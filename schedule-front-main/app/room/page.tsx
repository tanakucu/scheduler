"use client";
import { useEffect, useState } from "react";
import style from "./room.module.css";
import Navbar from "@/components/main/navbar/navbar";

interface Room {
    room_id: number;
    room_name: string;
    building_name: string;
}

export default function RoomPage() {
    const [roomData, setRoomData] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getRoomData = async () => {
            try {
                const response = await fetch("http://localhost:3030/num-api/get-all-rooms", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setRoomData(data);
            } catch (error) {
                console.error("Failed to fetch room data:", error);
            } finally {
                setLoading(false);
            }
        };

        getRoomData();
    }, []);

    const handleCreateRoom = () => {
        console.log("button clicked");
    };

    return (
        <>
            <Navbar />
            <div className={style.main}>
                <div className={style.container}>
                    <div className={style.buttonContainer}>
                        <button className={style.createRoomButton} onClick={handleCreateRoom}>
                            Өрөө үүсгэх
                        </button>
                    </div>
                    {loading ? (
                        <div className={style.loaderContainer}>
                            <div className={style.loader}></div>
                        </div>
                    ) : (
                        <div className={style.tableContainer}>
                            <table className={style.table}>
                                <thead>
                                    <tr>
                                        <th className={style.tableHeader}>ID</th>
                                        <th className={style.tableHeader}>Нэр</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roomData.map((room) => (
                                        <tr key={room.room_id} className={style.tableRow}>
                                            <td className={style.tableCell}>{room.room_id}</td>
                                            <td className={style.tableCell}>{room.building_name} - {room.room_name} Өрөө</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
