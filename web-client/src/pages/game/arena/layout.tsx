import { useSelector } from "react-redux";
import type { RootState } from "#store/store";
import { Lobby } from "#pages/game/lobby"
import { Outlet } from "react-router-dom";


export function ArenaGate() {
  const { status } = useSelector((state: RootState) => state.arena);

  if (status ==="room:in") {
    return (
      <div className="h-fit">
        <Outlet />
      </div>);
  }
  return (<><Lobby /></>)
}
