
interface PetitionStats {
  wins: number;
  accuracy: number;
  ping: number;
}

export interface PetitionCardProps {
  id?: string;
  petitionNumber?: string;
  timeAgo?: string;
  expiresIn?: string;
  playerName?: string;
  playerLevel?:1 | 2| 3| 4 | 5;
  playerRank?: 'beginner'|'intermediate'|'professional'|'expert'|'genius';
  stats?: PetitionStats;
  targetRoom?: string;
  hostBypass?: 'YES' | 'NO';
  onReject?: (id: string) => void;
  onResolve?: (id: string) => void;
}

export function PetitionCard({
  id,
  petitionNumber = 'REQ-9083',
  timeAgo = '1m',
  expiresIn = '01:12',
  playerName = 'NOVA_GLITCH',
  playerLevel = 19,
  playerRank = 'NOVICE',
  stats = { wins: 32, accuracy: 88.5, ping: 45 },
  targetRoom = 'CYBERPUNK CITY',
  hostBypass = 'NO',
  onReject,
  onResolve
}: PetitionCardProps) {

  // Reusable Tailwind utility string for neobrutalist button interactions
  const brutalBtnClass = "transition-all duration-100 hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[5px_5px_0px_0px_#121721] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[1px_1px_0px_0px_#121721]";

  return (
    <article className="max-w-2xl max-h-1xl z-99 bg-white rounded-xl border-[3px] border-[#121721] shadow-[6px_6px_0px_0px_#121721] overflow-hidden transition-all duration-200">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#fff8f1] border-b-[3px] border-[#121721]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-yellow-500"></span>
          <span className="font-mono text-[11px] font-extrabold tracking-wider text-black uppercase">
            PETITION #{petitionNumber}
          </span>
        </div>
        <span className="font-mono text-[11px] text-gray-700 font-bold">
          {timeAgo} AGO // EXPIRES: <span className="text-orange-600 font-extrabold">{expiresIn}</span>
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          {/* Player Identity & Metadata */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 bg-[#93c5fd] border-[3px] border-[#121721] flex items-center justify-center font-black text-2xl text-black">
                <span className="material-symbols-outlined text-3xl">psychology</span>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-black text-white font-mono text-[10px] font-black px-1.5 py-0.5 border border-white">
                LV.{playerLevel}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl tracking-tight text-black uppercase">{playerName}</h3>
                <span className="bg-yellow-400 text-black font-mono text-[10px] font-bold px-1.5 py-0.5 uppercase border border-black">
                  {playerRank}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 font-mono text-xs text-gray-600">
                <span className="flex items-center gap-1 font-bold text-black">
                  <span className="material-symbols-outlined text-sm text-[#ec2513]">trophy</span>
                  {stats.wins} Wins
                </span>
                <span>•</span>
                <span className="font-bold text-black">{stats.accuracy}% Acc</span>
                <span>•</span>
                <span className="text-green-700 font-bold">Ping: {stats.ping}ms</span>
              </div>
            </div>
          </div>

          {/* Target Arena Info */}
          <div className="sm:text-right bg-[#f1f3ff] p-2 px-3 border-[3px] border-[#121721] w-full sm:w-auto">
            <div className="font-mono text-[10px] text-gray-500 uppercase">REQUEST FOR</div>
            <div className="font-extrabold text-xs text-black uppercase">{targetRoom}</div>
            <div className="font-mono text-[10px] text-gray-700 font-bold">HOST BYPASS CODE: {hostBypass}</div>
          </div>
        </div>

        {/* Action Divider */}
        <div className="my-4 border-t-[3px] border-[#121721]"></div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-gray-500">
            Auto-rejects if capacity fills before approval.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onReject(id)}
              className={`${brutalBtnClass} flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-[#121721] font-black uppercase text-xs border-[3px] border-[#121721] shadow-[3px_3px_0px_0px_#121721]`}
            >
              <span className="material-symbols-outlined text-base text-[#ec2513]">close</span>
              Reject
            </button>
            <button
              onClick={() => onResolve(id)}
              className={`${brutalBtnClass} flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#ec2513] hover:bg-[#d41c0b] text-white font-black uppercase text-xs border-[3px] border-[#121721] shadow-[3px_3px_0px_0px_#121721]`}
            >
              <span className="material-symbols-outlined text-base">check</span>
              Resolve (Accept)
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
