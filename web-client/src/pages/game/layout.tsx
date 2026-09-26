import { Outlet } from "react-router-dom";
import { BottomNav, Header } from "#components/game/arena";
import { AccessDenied } from "#pages/notAuthorised";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "src/store/store";
import { changeShowMsgStatus } from "#store/slices/lobby";
import { PetitionCard } from "#components/ui/petition";
import { pushToLobby, updateRequests } from "#store/slices/lobby";

export function GameLobbyGate() {
  const { socketStatus, inComingRequests, showMessages } = useSelector((state: RootState) => state.lobby);
  const dispatch = useDispatch(); 
  // Owner resolves  requestor's petition
  const handlePetitionAction = (id: string, actionType: 'resolved' | 'rejected') => {
    const request = inComingRequests.find((item) => item.id === id);
    if (request) {
      dispatch(pushToLobby({
        type: 'in:lobby',
        payload: {
          action: 'room:join:resolve',
          value: { requestId: id, accepted: actionType === 'resolved' },
        },
      }));
    }
    dispatch(updateRequests({ id }));
  };
  if (socketStatus && socketStatus === "connected") {
    return (
      <>
        <Header messages={inComingRequests?.length} onShowMsg={()=> dispatch(changeShowMsgStatus(!showMessages))}/>
        <div className="m-auto px-xl py-12 flex flex-col items-start">
          <Outlet />
        </div>
        <BottomNav />
        {inComingRequests.length > 0 && showMessages && (
          <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-deep-ink/40 backdrop-blur-md">
            <div className="relative w-full max-w-2xl flex items-center justify-center min-h-75">

              {inComingRequests.map((dt, index) => {
                // Performance: Only render the top 4 cards visually
                if (index > 3) return null;

                // Dynamic styling based on the array index
                const isFront = index === 0;
                const scale = 1 - index * 0.05;
                const translateY = index * 16;
                const opacity = index === 0 ? 1 : 1 - index * 0.2;

                return (
                  <div
                    key={dt.id}
                    className="absolute w-full transition-all duration-300 ease-out shadow-2xl"
                    style={{
                      zIndex: 50 - index,
                      transform: `translateY(${translateY}px) scale(${scale})`,
                      opacity: opacity,
                      transformOrigin: 'top',
                      // 4. Critical: only the front card is clickable
                      pointerEvents: isFront ? 'auto' : 'none',
                    }}
                  >
                    {/* Re-added your animate-in wrapper for the initial pop-in */}
                    <div className="animate-in fade-in zoom-in duration-200">
                      <PetitionCard
                        {...dt}
                        // Connect to the handler to remove the card and reveal the next
                        onReject={() => handlePetitionAction(dt.id, 'rejected')}
                        onResolve={() => handlePetitionAction(dt.id, 'resolved')}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>);
  }

  return (<><AccessDenied /></>)
}
