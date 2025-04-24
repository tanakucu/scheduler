"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/main/navbar/navbar";
import style from "./page.module.css";
import Select from "@/components/ui/select";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

interface Building {
    building_id: number;
    building_name: string;
}

interface Room {
    room_id: number;
    room_name: string;
}

interface Schedule {
    course_id: number;
    course_name: string;
    course_index: string;
    time_range: string;
    week_day: number;
    comp_name: string;
    numStudent: string;
    emp_name: string;
    unit_name: string;
    building_name: string;
    room_name: string;
    dur_week: number;
    week_name: string;
    scheduled_user_name: number;
    scheduled_user_description: string;
}

const HomePage = () => {
    const [buildingData, setBuildingData] = useState<Building[]>([]);
    const [roomData, setRoomData] = useState<Room[]>([]);
    const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [hoveredEvent, setHoveredEvent] = useState<any>(null);

    const weekDayMap: { [key: string]: number } = {
      Даваа: 1,
      Мягмар: 2,
      Лхагва: 3, 
      Пүрэв: 4, 
      Баасан: 5, 
      Бямба: 6, 
      Ням: 0, 
    };
  
    useEffect(() => {
      if (!scheduleData || scheduleData.length === 0) return;

      // const formatEvents = (data: Schedule[]): Event[] => {
      //   const startDate = new Date("2025-02-03");

      //   return data.map((course) => {
      //     const [startTime, endTime] = course.time_range?.split("-") || ["", ""];
      //     const weekDay = weekDayMap[course.week_name] ?? 0;

      //     const firstOccurrence = new Date(startDate);
      //     firstOccurrence.setDate(
      //     startDate.getDate() + ((weekDay - startDate.getDay() + 7) % 7)
      //     );

      //     const endDate = new Date(firstOccurrence);
      //     endDate.setDate(firstOccurrence.getDate() + (course.dur_week ?? 0) * 7);

      //     return {
      //     title: `${course.course_index ?? ""} ${course.comp_name ?? ""}`,
      //     startRecur: firstOccurrence.toISOString().split("T")[0],
      //     endRecur: endDate.toISOString().split("T")[0],
      //     daysOfWeek: [weekDay],
      //     startTime,
      //     endTime,
      //     extendedProps: {
      //       comp_name: course.comp_name ?? "",
      //       room_name: course.room_name ?? "",
      //       course_name: course.course_name ?? "",
      //       emp_name: course.emp_name ?? "",
      //       building: course.building_name ?? "",
      //       time: course.time_range ?? "",
      //       week_name: course.week_name ?? "",
      //     },
      //     };
      //   });
      // };

      const formatEvents = (data: Schedule[]): Event[] => {
        const startDate = new Date("2025-02-03");
      
        return data.map((course) => {
          const [startTime, endTime] = course.time_range?.split("-") || ["00:00", "00:00"];
          const weekDay = weekDayMap[course.week_name] ?? 1;
      
          const firstOccurrence = new Date(startDate);
          firstOccurrence.setDate(
            startDate.getDate() + ((weekDay - startDate.getDay() + 7) % 7)
          );
      
          const endDate = new Date(firstOccurrence);
          endDate.setDate(firstOccurrence.getDate() + (course.dur_week ?? 1) * 7); 
      
          return {
            title: `${course.course_index ?? "Unknown"} ${course.comp_name ?? "Unknown"}`,
            startRecur: firstOccurrence.toISOString().split("T")[0],
            endRecur: endDate.toISOString().split("T")[0],
            daysOfWeek: [weekDay],
            startTime,
            endTime,
            extendedProps: {
              comp_name: course.comp_name ?? "", 
              room_name: course.room_name ?? "",
              course_name: course.course_name ?? "Оюутан",
              emp_name: course.emp_name ?? course.scheduled_user_name,
              building: course.building_name ?? "Unknown",
              time: course.time_range ?? "Unknown",
              week_name: course.week_name ?? "Даваа", 
              scheduled_description: course.scheduled_user_description ?? "Unknown",
            },
          };
        });
      };

      setEvents(formatEvents(scheduleData));
    }, [scheduleData]);

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const response = await fetch("http://localhost:3030/num-api/buildings");
                if (!response.ok) {
                    throw new Error("Failed to fetch buildings.");
                }
                const data: Building[] = await response.json();
                setBuildingData(data);
            } catch (error) {
                console.error("Error fetching buildings:", error);
            }
        };

        fetchBuildings();
    }, []);

    useEffect(() => {
        if (selectedBuilding === null) return;

        const fetchRooms = async () => {
            try {
                const response = await fetch(`http://localhost:3030/num-api/rooms`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ building_id: selectedBuilding }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch rooms.");
                }

                const data: Room[] = await response.json();
                setRoomData(data);
            } catch (error) {
                console.error("Error fetching rooms:", error);
                alert("An error occurred while fetching the rooms.");
            }
        };

        fetchRooms();
    }, [selectedBuilding]);

    useEffect(() => {
        if (selectedRoom === null) return;

        const getSchedules = async () => {
            try {
                const response = await fetch(`http://localhost:3030/num-api/schedules`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ room_id: selectedRoom }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch schedules.");
                }

                const data: Schedule[] = await response.json();
                setScheduleData(data);
            } catch (error) {
                console.error("Error fetching schedules:", error);
            }
        };

        getSchedules();
    }, [selectedRoom]);

    const getBackgroundClass = (comp_name: string): string => {
      const classMap: { [key: string]: string } = {
      'Лаб': style.lab,
      'Лекц': style.lecture,
      'Сем': style.seminar
      };
      return classMap[comp_name] || '';
    };

    const DAY_NAMES = ["Да", "Мя", "Лха", "Пү", "Ба", "Бя", "Ня"];

    const getDayName = (dayIndex: number): string => {
      return DAY_NAMES[dayIndex] || "";
    };

    return (
      <>
        <Navbar />
        <div className={style.main}>
          <div className={style.container}>
            <div className={style.filterItems}>
              <Select
                    options={buildingData.map((building) => ({
                        value: building.building_id.toString(),
                        label: building.building_name,
                    }))}
                    selectedValue={selectedBuilding?.toString() || null}
                    setSelectedValue={(value) => setSelectedBuilding(value ? Number(value) : null)}
                    placeholder="Хичээлийн байр сонгох"
                    disabled={buildingData.length === 0}
                    className={style.select}
                />
                
                <Select
                    options={roomData.map((room) => ({
                        value: room.room_id.toString(),
                        label: `${room.room_name} Өрөө`,
                    }))}
                    selectedValue={selectedRoom?.toString() || null}
                    setSelectedValue={(value) => setSelectedRoom(value ? Number(value) : null)}
                    placeholder="Өрөө сонгох"
                    disabled={roomData.length === 0}
                    className={style.select}
                />
            </div>
            
            <div className={style.calendar}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                events={events}
                slotMinTime="07:40:00"
                slotMaxTime="21:00:00"
                slotDuration={"00:45:00"}
                dayHeaderContent={(date) => {
                    const dayIndex = (date.date.getDay() + 6) % 7; 
                    const dayName = getDayName(dayIndex);
                    const formattedDate = `${date.date.getMonth() + 1}/${date.date.getDate()}`;
                    return dayName + " " + formattedDate;
                  }
                }
                expandRows={true}
                contentHeight={"70vh"}
                firstDay={1} 
                allDaySlot={false}
                slotLabelContent={(slotInfo) => {
                  const startTime = slotInfo.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                  const endTime = new Date(slotInfo.date.getTime() + 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                  return `${startTime} - ${endTime}`;
                }}
                eventColor='#ffffff00'
                eventDisplay="block"
                eventContent={(eventInfo) => {
                  const eventProps = eventInfo.event.extendedProps;
                  return (
                    <div 
                      className={`${style.event} ${getBackgroundClass(eventProps.comp_name)}`}
                      onMouseEnter={() => setHoveredEvent(eventProps)}
                      onMouseLeave={() => setHoveredEvent(null)}
                    >
                      <div className={style.eventTop}>
                        <span className={style.eventBadge}>{eventProps.comp_name || eventProps.scheduled_user_id}</span>
                        <span className={style.room_name}>{eventProps.room_name || eventProps.scheduled_description}</span>
                      </div>
                      <div className={style.eventMiddle}>{eventProps.course_name}</div>
                      <div className={style.eventBottom}>{eventProps.emp_name}</div>
                    </div>
                  );
                }}
                buttonText={{
                  today: "Өнөөдөр",
                }}
              />

              {hoveredEvent && (
                <div className={style.hoverOverlay}>
                  <div className={style.hoverContent}>
                    <h3>{hoveredEvent.course_name}</h3>
                    <p><strong>Хичээлийн төрөл:</strong> {hoveredEvent.comp_name}</p>
                    <p><strong>Багш:</strong> {hoveredEvent.emp_name}</p>
                    <p><strong>Байр:</strong> {hoveredEvent.building}</p>
                    <p><strong>Өрөө:</strong> {hoveredEvent.room_name}</p>
                    <p><strong>Өдөр:</strong> {hoveredEvent.week_name}</p>
                    <p><strong>Цаг:</strong> {hoveredEvent.time}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </>
    );
};

export default HomePage;