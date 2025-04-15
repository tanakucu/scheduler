const index = (req, res) => {
    res.json({ message: 'Hello from NUM API' });
}

const getBuildings = async (req, res) => {
    try {
        const response = await fetch('https://stud-api.num.edu.mn/topMenus/Buildings?unitid=1002076', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        if(!response.ok) {  
            throw new Error('Failed to fetch data');
        }
        const buildings = await response.json();
        console.log(buildings);
        res.json(buildings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRooms = async (req, res) => {
        // Хичээлийн байр 7 id-> 8, Хичээлийн байр 8 id-> 9
        // buildingIds = [8, 9];
        const {buildingId} = req.body;
        const rooms = [];

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
        const buildingRooms = await response.json();
        rooms.push(...buildingRooms);

        res.json(rooms);
}

const getAllRooms = async (req, res) => {
    try {
        // Building IDs with their names
        const buildings = [
            { id: 8, name: "Хичээлийн байр 7" },
            { id: 9, name: "Хичээлийн байр 8" }
        ];
        const rooms = [];

        for (const building of buildings) {
            const response = await fetch(`https://stud-api.num.edu.mn/topMenus/GetRoomsForschedule?unitid=1002076&buildingid=${building.id}`, {
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
            
            // Add building info to each room object
            const roomsWithBuilding = data.map(room => ({
                ...room,
                buildingId: building.id,
                buildingName: building.name
            }));
            
            rooms.push(...roomsWithBuilding);
        }

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getSchedules = async (req, res) => {
    try {
        const {roomId} = req.body;
        console.log(roomId);
        
        const response = await fetch(`https://stud-api.num.edu.mn/topMenus/TopSchedules?empid=0&roomid=${roomId}&courseid=0`, {
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

        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAvailableSchedules = async (req, res) => {
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

        res.json(bookedSchedules);
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
    getAvailableSchedules
};