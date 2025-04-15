"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/main/navbar/navbar";
import style from "./page.module.css";
import Select from "@/components/ui/select";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

interface Building {
    buildingID: number;
    buildingname: string;
}

interface Room {
    roomId: number;
    roomname: string;
}

interface Schedule {
    courseId: number;
    courseName: string;
    courseIndex: string;
    time: string;
    weekDay: number;
    compName: string;
    numStudent: string;
    empName: string;
    unitName: string;
    buildingName: string;
    roomName: string;
    durWeek: number;
    weekName: string;
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
      if (!scheduleData) return;
  
      const formatEvents = (data: Schedule[]): Event[] => {
        const startDate = new Date("2025-02-03");
  
        return data.map((course) => {
          const [startTime, endTime] = course.time.split("-");
          const weekDay = weekDayMap[course.weekName];
  
          const firstOccurrence = new Date(startDate);
          firstOccurrence.setDate(
            startDate.getDate() + ((weekDay - startDate.getDay() + 7) % 7)
          );
  
          const endDate = new Date(firstOccurrence);
          endDate.setDate(firstOccurrence.getDate() + course.durWeek * 7);
  
          return {
            title: `${course.courseIndex} ${course.compName}`,
            startRecur: firstOccurrence.toISOString().split("T")[0],
            endRecur: endDate.toISOString().split("T")[0],
            daysOfWeek: [weekDay],
            startTime,
            endTime,
            extendedProps: {
              compName: course.compName,
              roomName: course.roomName,
              courseName: course.courseName,
              empName: course.empName,
              building: course.buildingName,
              time: course.time,
              weekName: course.weekName,
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
                    body: JSON.stringify({ buildingId: selectedBuilding }),
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
                    body: JSON.stringify({ roomId: selectedRoom }),
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

    const getBackgroundClass = (compName: string): string => {
      const classMap: { [key: string]: string } = {
      'Лаб': style.lab,
      'Лекц': style.lecture,
      'Сем': style.seminar
      };
      return classMap[compName] || '';
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
                        value: building.buildingID.toString(),
                        label: building.buildingname,
                    }))}
                    selectedValue={selectedBuilding?.toString() || null}
                    setSelectedValue={(value) => setSelectedBuilding(value ? Number(value) : null)}
                    placeholder="Хичээлийн байр сонгох"
                    disabled={buildingData.length === 0}
                    className={style.select}
                />
                
                <Select
                    options={roomData.map((room) => ({
                        value: room.roomId.toString(),
                        label: `${room.roomname} Өрөө`,
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
                      className={`${style.event} ${getBackgroundClass(eventProps.compName)}`}
                      onMouseEnter={() => setHoveredEvent(eventProps)}
                      onMouseLeave={() => setHoveredEvent(null)}
                    >
                      <div className={style.eventTop}>
                        <span className={style.eventBadge}>{eventProps.compName}</span>
                        <span className={style.roomName}>{eventProps.roomName}</span>
                      </div>
                      <div className={style.eventMiddle}>{eventProps.courseName}</div>
                      <div className={style.eventBottom}>{eventProps.empName}</div>
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
                    <h3>{hoveredEvent.courseName}</h3>
                    <p><strong>Хичээлийн төрөл:</strong> {hoveredEvent.compName}</p>
                    <p><strong>Багш:</strong> {hoveredEvent.empName}</p>
                    <p><strong>Байр:</strong> {hoveredEvent.building}</p>
                    <p><strong>Өрөө:</strong> {hoveredEvent.roomName}</p>
                    <p><strong>Өдөр:</strong> {hoveredEvent.weekName}</p>
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