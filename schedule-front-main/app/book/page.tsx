"use client";
import { useState } from "react";
import style from "./book.module.css";
import Navbar from "@/components/main/navbar/navbar";
import Select from "@/components/ui/select";
import CustomButton from "@/components/ui/button";
import Room from "@/components/main/room/room";
import { useSession } from "next-auth/react";

export default function BookPage() {
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(
    null
  );
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedRoomCapacity, setSelectedRoomCapacity] = useState<
    string | null
  >(null);
  const [schedulingSlotId, setSchedulingSlotId] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const userId = session?.user?.id || null;
  const isAuthenticated = status === "authenticated";

  interface Room {
    room_id: number;
    room_name: string;
    building_name: number | string;
    time_range: string;
    week_day: number;
  }

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoom, setModalRoom] = useState<Room | null>(null);
  const [description, setDescription] = useState("");

  const getSlotId = (room: Room) => {
    return `${room.room_id}-${room.time_range}-${room.week_day}`;
  };

  const timeSpans = [
    "07:40",
    "08:25",
    "09:10",
    "09:55",
    "10:40",
    "11:25",
    "12:10",
    "12:55",
    "13:40",
    "14:25",
    "15:10",
    "15:55",
    "16:40",
    "17:25",
    "18:10",
    "18:55",
    "19:40",
    "20:25",
  ];

  const days = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];

  const buildings = [
    { value: "7", label: "Хичээлийн байр 7" },
    { value: "8", label: "Хичээлийн байр 8" },
  ];

  const capacities = [
    { value: "1", label: "1-20" },
    { value: "2", label: "21-40" },
    { value: "3", label: "41-60" },
    { value: "4", label: "61-80" },
    { value: "5", label: "81-100" },
    { value: "6", label: "100+" },
  ];

  const handleSearchClick = async () => {
    const requestBody = {
      start_time: selectedStartTime,
      end_time: selectedEndTime,
      day: selectedDay,
      building: selectedBuilding,
      capacity: selectedRoomCapacity,
    };

    if (!selectedStartTime || !selectedEndTime || !selectedDay) {
      alert("Эхлэх, дуусах цаг, Өдрийг сонгоно уу.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3030/num-api/get-schedules-filter",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Серверийн алдаа гарлаа");

      const data = await response.json();
      if (data.length === 0) {
        alert("Тохирох танхим олдсонгүй.");
        return;
      }
      setRooms(data);
    } catch (error) {
      console.error("Алдаа:", error);
      alert("Алдаа гарлаа. Дахин оролдоно уу.");
    }
  };

  const handleScheduleRoom = (room: Room) => {
    if (!isAuthenticated) {
      alert("Та захиалга хийхийн тулд нэвтрэх шаардлагатай.");
      return;
    }
    setModalRoom(room);
    setDescription("");
    setIsModalOpen(true);
  };

  const confirmBooking = async () => {
    if (!description.trim()) {
      alert("Та захиалгын зорилгыг бичнэ үү.");
      return;
    }

    if (!modalRoom) return;

    const slotId = getSlotId(modalRoom);
    setSchedulingSlotId(slotId);

    try {
      const payload = {
        user_id: userId,
        room_id: modalRoom.room_id,
        time_range: modalRoom.time_range,
        week_day: modalRoom.week_day,
        description,
        week_number: calculateWeekNumber(modalRoom.week_day),
      };

      const response = await fetch(
        "http://localhost:3030/num-api/schedule-room",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Захиалгын серверийн алдаа");

      setRooms((prev) => prev.filter((r) => getSlotId(r) !== slotId));

      alert(
        `Танхим захиалагдлаа: ${modalRoom.room_name}\nЦаг: ${modalRoom.time_range}`
      );
    } catch (error) {
      console.error("Захиалгын алдаа:", error);
      alert("Захиалга хийх үед алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSchedulingSlotId(null);
      setIsModalOpen(false);
    }
  };

  const calculateWeekNumber = (weekDay: number): number => {
    const startDate = new Date("2025-02-03");
    const today = new Date();
    const diffInDays = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.floor(diffInDays / 7) + 1;
  };

  return (
    <>
      <Navbar />
      <div className={style.main}>
        <div className={style.container}>
          <div className={style.filterItems}>
            <Select
              options={timeSpans.map((time) => ({ value: time, label: time }))}
              selectedValue={selectedStartTime || ""}
              setSelectedValue={(val) => setSelectedStartTime(val || null)}
              placeholder="Эхлэх цаг"
              className={style.select}
            />
            <Select
              options={timeSpans.map((time) => ({ value: time, label: time }))}
              selectedValue={selectedEndTime || ""}
              setSelectedValue={(val) => setSelectedEndTime(val || null)}
              placeholder="Дуусах цаг"
              className={style.select}
            />
            <Select
              options={days.map((day, idx) => ({
                value: `${idx + 1}`,
                label: day,
              }))}
              selectedValue={selectedDay || ""}
              setSelectedValue={(val) => setSelectedDay(val || null)}
              placeholder="Өдөр"
              className={style.select}
            />
            <Select
              options={buildings}
              selectedValue={selectedBuilding || ""}
              setSelectedValue={(val) => setSelectedBuilding(val || null)}
              placeholder="Хичээлийн байр"
              className={style.select}
            />
            <Select
              options={capacities}
              selectedValue={selectedRoomCapacity || ""}
              setSelectedValue={(val) => setSelectedRoomCapacity(val || null)}
              placeholder="Танхимын багтаамж"
              className={style.select}
            />
            <CustomButton onClick={handleSearchClick}>Хайх</CustomButton>
          </div>

          <div className={style.rooms}>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <Room
                  key={`${room.room_id}-${room.time_range}-${room.week_day}`}
                  room={room}
                  onSchedule={() => handleScheduleRoom(room)}
                  isScheduling={schedulingSlotId === getSlotId(room)}
                />
              ))
            ) : (
              <div className={style.noRooms}>Танхим олдсонгүй</div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && modalRoom && (
        <div className={style.modalBackdrop}>
          <div className={style.modalContent}>
            <label>
              Тайлбар:
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Жишээ: Hackum meeting "
                className={style.descInput}
              />
            </label>
            <div className={style.modalButtons}>
              <CustomButton onClick={confirmBooking}>Захиалах</CustomButton>
              <CustomButton onClick={() => setIsModalOpen(false)}>
                Цуцлах
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
