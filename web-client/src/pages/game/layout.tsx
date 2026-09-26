import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { AccessDenied } from "#pages/notAuthorised";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "src/store/store";
import { changeShowMsgStatus } from "#store/slices/lobby";

export function GameLobbyGate() {
  const { socketStatus, inComingRequests, showMessages } = useSelector((state: RootState) => state.lobby);
  const dispatch = useDispatch(); 
  if (socketStatus && socketStatus === "connected") {
    return (
      <>
        <Header messages={inComingRequests?.length} onShowMsg={()=> dispatch(changeShowMsgStatus(!showMessages))}/>
        <div className="m-auto px-xl py-12 flex flex-col items-start">
          <Outlet />
        </div>
        <BottomNav />
      </>);
  }

  return (<><AccessDenied /></>)
}
