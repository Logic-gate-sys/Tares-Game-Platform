import { useSelector } from "react-redux";
import type { RootState } from "#store/store";
import { Lobby } from "#pages/game/lobby"
import { Outlet } from "react-router-dom";


export function ArenaGate() {
  const { status } = useSelector((state: RootState) => state.ingame);


  if (status ==="room:in") {
    return (
      <>
        <Outlet />
      </>);
  }
  return (<><Lobby /></>)
}
