import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { AccessDenied } from "#pages/not-authorised";
import { useSelector } from "react-redux";
import type { RootState } from "src/store/store";

export function GameLobbyGate() {
  const { socketStatus, inComingRequests } = useSelector((state: RootState) => state.lobby)
  if (socketStatus && socketStatus === "connected") {
    return (
      <>
        <Header messages={inComingRequests?.length}/>
        <div className="m-auto px-xl py-12 flex flex-col items-start">
          <Outlet />
        </div>
        <BottomNav />
      </>);
  }

  return (<><AccessDenied /></>)
}
