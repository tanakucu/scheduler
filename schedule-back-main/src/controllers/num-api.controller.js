const pool = require('../config/db');

const index = (req, res) => {
    res.json({ message: 'Hello from NUM API' });
}

const getBuildings = async (req, res) => {
    try {
        const query = `
            SELECT * FROM buildings;
            `;
        
            const { rows } = await pool.query(query);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
};

const getRooms = async (req, res) => {
    try {
        const { building_id } = req.body;
        const query = `
            SELECT * FROM rooms
            WHERE building_id = $1;
        `;
        const values = [building_id];
        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const query = `
            SELECT 
                rooms.*, 
                buildings.building_name AS building_name
            FROM rooms
            JOIN buildings ON rooms.building_id = buildings.building_id;
        `;

        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {   
        res.status(500).json({ message: error.message });
    }
};

const getSchedules = async (req, res) => {
    try {
        const { room_id } = req.body;

        const query = `
            SELECT cs.*, u.name AS scheduled_user_name
            FROM course_schedule cs
            LEFT JOIN users u ON cs.scheduled_user_id = u.id
            WHERE cs.room_id = $1;
        `;

        const values = [room_id];

        const { rows } = await pool.query(query, values);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAvailableSchedulesByFilters = async (req, res) => {
    try {
        const { start_time, end_time, day, building, capacity } = req.body;
        
        let query = `
            WITH time_spans AS (
            SELECT unnest(ARRAY[
                '07:40', '08:25', '09:10', '09:55', '10:40', '11:25',
                '12:10', '12:55', '13:40', '14:25', '15:10', '15:55',
                '16:40', '17:25', '18:10', '18:55', '19:40', '20:25'
            ]) AS start_time,
            unnest(ARRAY[
                '08:25', '09:10', '09:55', '10:40', '11:25', '12:10',
                '12:55', '13:40', '14:25', '15:10', '15:55', '16:40',
                '17:25', '18:10', '18:55', '19:40', '20:25', '21:10'
            ]) AS end_time
            ),
            available_rooms AS (
            SELECT room_id, room_name, building_name
            FROM course_schedule
            WHERE ($3::integer IS NULL OR week_day = $3::integer)
            GROUP BY room_id, room_name, building_name
            HAVING (
                $5::text IS NULL 
                OR MAX(num_student) < 
                CASE $5::text
                    WHEN '1' THEN 21
                    WHEN '2' THEN 41
                    WHEN '3' THEN 61
                    WHEN '4' THEN 81
                    WHEN '5' THEN 101
                    WHEN '6' THEN 99999
                END
            )
            ),
            occupied_times AS (
            SELECT room_id, time_range, week_day
            FROM course_schedule
            )
            SELECT 
            a.room_id, 
            a.room_name, 
            a.building_name,
            t.start_time || '-' || t.end_time AS time_range,
            $3::integer AS week_day
            FROM available_rooms a
            CROSS JOIN time_spans t
            LEFT JOIN occupied_times o
            ON o.room_id = a.room_id 
            AND (
                (split_part(o.time_range, '-', 1)::time, split_part(o.time_range, '-', 2)::time)
                OVERLAPS (t.start_time::time, t.end_time::time)
            )
            AND ($3::integer IS NULL OR o.week_day = $3::integer)
            WHERE o.room_id IS NULL
            AND ($4::text IS NULL OR a.building_name = $4::text)
            AND (
                ($1::time IS NULL OR t.start_time::time >= $1::time)
                AND ($2::time IS NULL OR t.end_time::time <= $2::time)
            )
            ORDER BY a.building_name, a.room_name, t.start_time;
        `;

        const values = [
            start_time || null,
            end_time || null,
            day || null,
            building || null,
            capacity || null
        ];

        const { rows } = await pool.query(query, values);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const scheduleRoom = async (req, res) => {
    try {
        const { user_id, room_id, time_range, week_day, description } = req.body;

        const query = `
            INSERT INTO course_schedule (scheduled_user_id, room_id, time_range, week_day, scheduled_user_description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const values = [
            user_id,
            room_id,
            time_range,
            week_day,
            description,
        ];

        const { rows } = await pool.query(query, values);

        res.json({ message: 'Өрөө амжилттай захиалагдлаа', schedule: rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const saveAllSchedulesToDB = async (req, res) => {
    try {
        // Хичээлийн байр 7 id-> 8, Хичээлийн байр 8 id-> 9
        const buildingIds = [8, 9];
        const rooms = [];
        for (const buildingId of buildingIds) {
            const response = await fetch(`https://stud-api.num.edu.mn/topMenus/GetRoomsForschedule?unitid=1002076&buildingid=${buildingId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(req.body)
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            rooms.push(...data);
        }
        
        const bookedSchedules = [];
        for (const room of rooms) {
            const response = await fetch(`https://stud-api.num.edu.mn/topMenus/TopSchedules?empid=0&roomid=${room.roomId}&courseid=0`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(req.body)
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const schedules = await response.json();
            bookedSchedules.push(...schedules);
        }

        // Save to DB
        for (const sched of bookedSchedules) {
            await pool.query(
            `INSERT INTO course_schedule (
                course_id, course_name, course_index, course_credit, hid, week_day, week_name, dur_week, dur_time, first_date,
                time_id, time_range, sched_type, sched_type_name, comp_id, comp_name, chosen_stud_count, num_student, comment,
                building_name, room_id, room_name, emp_priv_hash, emp_name, group_id, unit_name, unit_type_name
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19,
                $20, $21, $22, $23, $24, $25, $26, $27
            )`,
            [
                sched.courseId, sched.courseName, sched.courseIndex, sched.courseCredit, sched.hid, sched.weekDay,
                sched.weekName, sched.durWeek, sched.durTime, sched.firstDate, sched.timeId, sched.time, sched.schedType,
                sched.schedTypeName, sched.compId, sched.compName, sched.chosenStudCount, sched.numStudent, sched.comment,
                sched.buildingName, sched.roomId, sched.roomName, sched.empPrivHash, sched.empName, sched.groupId,
                sched.unitName, sched.unitTypeName
            ]
            );
        }

        res.json({ message: 'Schedules fetched and saved successfully.', count: bookedSchedules.length });
        // res.json(bookedSchedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    index,
    getBuildings,
    getRooms,
    getAllRooms,
    getSchedules,
    saveAllSchedulesToDB,
    getAvailableSchedulesByFilters,
    // getAllSchedules,
    scheduleRoom
};

// const getBuildings = async (req, res) => {
//     try {
//         const response = await fetch('https://stud-api.num.edu.mn/topMenus/Buildings?unitid=1002076', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(req.body)
//         });
//         if(!response.ok) {  
//             throw new Error('Failed to fetch data');
//         }
//         const buildings = await response.json();
//         console.log(buildings);
//         res.json(buildings);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// const getRooms = async (req, res) => {
//         // Хичээлийн байр 7 id-> 8, Хичээлийн байр 8 id-> 9
//         // buildingIds = [8, 9];
//         const {buildingId} = req.body;
//         const rooms = [];

//         const response = await fetch(`https://stud-api.num.edu.mn/topMenus/GetRoomsForschedule?unitid=1002076&buildingid=${buildingId}`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(req.body)
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to fetch data');
//         }
//         const buildingRooms = await response.json();
//         rooms.push(...buildingRooms);

//         res.json(rooms);
// }

// const getAllRooms = async (req, res) => {
//     try {
//         // Building IDs with their names
//         const buildings = [
//             { id: 8, name: "Хичээлийн байр 7" },
//             { id: 9, name: "Хичээлийн байр 8" }
//         ];
//         const rooms = [];

//         for (const building of buildings) {
//             const response = await fetch(`https://stud-api.num.edu.mn/topMenus/GetRoomsForschedule?unitid=1002076&buildingid=${building.id}`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(req.body)
//             });
            
//             if (!response.ok) {
//                 throw new Error('Failed to fetch data');
//             }
//             const data = await response.json();
            
//             // Add building info to each room object
//             const roomsWithBuilding = data.map(room => ({
//                 ...room,
//                 buildingId: building.id,
//                 buildingName: building.name
//             }));
            
//             rooms.push(...roomsWithBuilding);
//         }

//         res.json(rooms);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// const getSchedules = async (req, res) => {
//     try {
//         const {roomId} = req.body;
//         console.log(roomId);
        
//         const response = await fetch(`https://stud-api.num.edu.mn/topMenus/TopSchedules?empid=0&roomid=${roomId}&courseid=0`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(req.body)
//         });
//         if (!response.ok) {
//             throw new Error('Failed to fetch data');
//         }
//         const schedules = await response.json();

//         res.json(schedules);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// const getAllSchedules = async (req, res) => {
//     try {
//         // Хичээлийн байр 7 id-> 8, Хичээлийн байр 8 id-> 9
//         const buildingIds = [8, 9];
//         const rooms = [];
//         for (const buildingId of buildingIds) {
//             const response = await fetch(`https://stud-api.num.edu.mn/topMenus/GetRoomsForschedule?unitid=1002076&buildingid=${buildingId}`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(req.body)
//             });
            
//             if (!response.ok) {
//                 throw new Error('Failed to fetch data');
//             }
//             const data = await response.json();
//             rooms.push(...data);
//         }
        
//         const bookedSchedules = [];
//         for (const room of rooms) {
//             const response = await fetch(`https://stud-api.num.edu.mn/topMenus/TopSchedules?empid=0&roomid=${room.roomId}&courseid=0`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(req.body)
//             });
//             if (!response.ok) {
//                 throw new Error('Failed to fetch data');
//             }
//             const schedules = await response.json();
//             bookedSchedules.push(...schedules);
//         }

//         res.json(bookedSchedules);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }