import { useState } from "react";

interface TaresHeaderProps {
  pendingCount?: number;
  roomName?: string;
  roomNumber?: number;
  resolveRequests?: () => void; 
}

export function PendingRequestsHeader({
  resolveRequests,
  pendingCount = 3,
  roomName = 'CYBERPUNK CITY',
  roomNumber = 789,
  
}: TaresHeaderProps) {
   const [showAction, setShowAction] = useState()
  return (
    <header className="w-full bg-white border-[3px] border-[#121721] shadow-[6px_6px_0px_0px_#121721] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-[#ec2513] text-white border-[3px] border-[#121721] p-2 px-3 font-extrabold text-xl tracking-tighter">
          TARES
        </div>
        <div>
          <div className="font-mono text-xs text-[#ec2513] font-extrabold tracking-widest uppercase">
            MODULE // HOST-SECURITY
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Incoming Room Join Requests
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button onClick={resolveRequests }  className="inline-flex items-center gap-1.5 active:scale-110 hover:bg-red-800 bg-[#dbeafe] px-3 py-1 font-mono text-xs font-bold border-[3px] border-[#121721]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ec2513] animate-pulse"></span>
          {pendingCount} {"PENDING REQUESTS"}
        </button>
        <div className="text-xs font-mono text-gray-600 bg-gray-100 p-2 border-[3px] border-[#121721]">
          ROOM: <span className="font-bold text-black">{roomName} (#{roomNumber})</span>
        </div>
      </div>

    </header>
  );
}