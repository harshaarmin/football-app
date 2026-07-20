import { useNavigate } from 'react-router-dom';

export default function LiveMatchBanner({ match, tournament = 'worldcup' }) {
  const navigate = useNavigate();

  if (!match) return null;

  const isWorldCup = tournament === 'worldcup';
  const homeName = isWorldCup ? match.home_team_name_en : match.homeTeam?.shortName || match.homeTeam?.name;
  const awayName = isWorldCup ? match.away_team_name_en : match.awayTeam?.shortName || match.awayTeam?.name;
  const homeFlag = isWorldCup ? match.home_team?.flag : match.homeTeam?.crest;
  const awayFlag = isWorldCup ? match.away_team?.flag : match.awayTeam?.crest;
  const scoreText = isWorldCup
    ? `${match.home_score} - ${match.away_score}`
    : `${match.score?.fullTime?.home ?? 0} - ${match.score?.fullTime?.away ?? 0}`;
  const isLive = isWorldCup ? match.finished !== 'TRUE' : match.status === 'LIVE';

  // Format date/time for display
  const formatDateTime = (dateStr, isWC) => {
    if (!dateStr) return '';
    if (isWC) {
      const parts = String(dateStr).split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '';
      if (datePart) {
        const dateParts = datePart.split('/');
        if (dateParts.length >= 3) {
          const date = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
          const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          return timePart ? `${formattedDate} • ${timePart.slice(0, 5)}` : formattedDate;
        }
      }
      return dateStr;
    } else {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const formattedTime = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${formattedDate} • ${formattedTime}`;
    }
  };

  const matchDateTime = formatDateTime(isWorldCup ? match.local_date : match.utcDate, isWorldCup);

  const handleClick = () => {
    navigate(`/match/${match.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full overflow-hidden rounded-[28px] border-2 border-red-500/40 bg-gradient-to-br from-red-950/60 via-red-900/30 to-red-950/60 p-4 cursor-pointer transition-all hover:border-red-400/70 hover:shadow-2xl hover:shadow-red-500/20 sm:rounded-[32px] sm:p-6 lg:p-8"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(239,68,68,0.15),transparent_50%,rgba(239,68,68,0.15))] animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.2),transparent_50%)]" />

      <div className="relative z-10">
        {/* Header with LIVE indicator */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-400 sm:text-sm">
              LIVE NOW
            </span>
          </div>
          <span className="rounded-full border border-red-500/30 bg-red-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-200 sm:px-4 sm:py-1.5 sm:text-xs">
            {isWorldCup ? 'FIFA World Cup 2026' : 'Premier League'}
          </span>
        </div>

        {/* Match content */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6">
          {/* Home team */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {homeFlag && (
              <img
                src={homeFlag}
                alt={homeName}
                className={`h-12 w-12 flex-shrink-0 object-contain shadow-lg sm:h-16 sm:w-16 ${isWorldCup ? 'rounded-xl' : ''}`}
              />
            )}
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-white sm:text-xl">{homeName}</h3>
              {isWorldCup && match.group && (
                <p className="text-xs font-bold text-white/60 sm:text-sm">Group {match.group}</p>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="rounded-2xl border-4 border-red-500/30 bg-white px-5 py-3 text-center shadow-2xl sm:px-8 sm:py-4">
            <div className="text-2xl font-black tracking-wider text-gray-950 sm:text-4xl">{scoreText}</div>
          </div>

          {/* Away team */}
          <div className="flex min-w-0 items-center gap-3 sm:justify-end sm:gap-4">
            <div className="min-w-0 sm:text-right">
              <h3 className="truncate text-base font-black text-white sm:text-xl">{awayName}</h3>
              {isWorldCup && match.group && (
                <p className="text-xs font-bold text-white/60 sm:text-sm">Group {match.group}</p>
              )}
            </div>
            {awayFlag && (
              <img
                src={awayFlag}
                alt={awayName}
                className={`h-12 w-12 flex-shrink-0 object-contain shadow-lg sm:h-16 sm:w-16 ${isWorldCup ? 'rounded-xl' : ''}`}
              />
            )}
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-red-500/30 pt-4 sm:mt-6">
          <div className="flex flex-col gap-1">
            {matchDateTime && (
              <p className="text-xs font-bold text-white/40">
                {matchDateTime}
              </p>
            )}
            <p className="text-sm font-bold text-white/60">
              Tap for live match details
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-300 sm:text-sm">
            <span>View Details</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
