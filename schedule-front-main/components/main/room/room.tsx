import style from "./room.module.css";

interface RoomProps {
  room: {
    room_id: number;
    room_name: string;
    building_name: number | string;
    time_range: string;
    week_day: number;
  };
  onSchedule: () => void;
  isScheduling: boolean;
}

const Room = ({ room, onSchedule, isScheduling }: RoomProps) => {
  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSchedule();
  };

  return (
    <div className={style["room-card"]}>
      <div className={style["accent-bar"]}></div>
      <div className={style["room-header"]}>
        <div className={style["icon-container"]}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={style["room-icon"]} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <h3 className={style["room-name"]}>{room.room_name}</h3>
      </div>
      
      <div className={style["room-details"]}>
        <div className={style["building-info"]}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={style["detail-icon"]} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span className={style["building-name"]}>
            {typeof room.building_name === 'number' 
              ? `Хичээлийн байр ${room.building_name}` 
              : room.building_name}
          </span>
        </div>
        
        <div className={style["time-info"]}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={style["detail-icon"]} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className={style["time-range"]}>{room.time_range}</span>
        </div>
      </div>
      
      <button 
        className={`${style["schedule-button"]} ${isScheduling ? style["scheduling"] : ''}`}
        onClick={handleScheduleClick}
        disabled={isScheduling}
      >
        {isScheduling ? 'Захиалж байна...' : 'Захиалах'}
      </button>
    </div>
  );
};

export default Room;