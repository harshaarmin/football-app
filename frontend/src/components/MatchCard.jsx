function MatchCard({ match }) {
    const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
    const isFinished = match.status === 'FINISHED'
    const kickoff = new Date(match.utcDate).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500 transition-colors">
            {/* Status badge */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {match.competition?.name}
                </span>
                {isLive ? (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                        LIVE
                    </span>
                ) : isFinished ? (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        FT
                    </span>
                ) : (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {kickoff}
                    </span>
                )}
            </div>

            {/* Teams and score */}
            <div className="flex items-center justify-between gap-4">
                {/* Home team */}
                <div className="flex items-center gap-2 flex-1">
                    <img
                        src={match.homeTeam?.crest}
                        alt={match.homeTeam?.name}
                        className="w-8 h-8 object-contain"
                    />
                    <span className="text-sm font-medium text-white">
                        {match.homeTeam?.shortName}
                    </span>
                </div>

                {/* Score */}
                <div className="text-center min-w-[60px]">
                    {isLive || isFinished ? (
                        <span className="text-xl font-bold text-white">
                            {match.score?.fullTime?.home ?? 0} - {match.score?.fullTime?.away ?? 0}
                        </span>
                    ) : (
                        <span className="text-gray-500 text-sm">vs</span>
                    )}
                </div>

                {/* Away team */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-medium text-white">
                        {match.awayTeam?.shortName}
                    </span>
                    <img
                        src={match.awayTeam?.crest}
                        alt={match.awayTeam?.name}
                        className="w-8 h-8 object-contain"
                    />
                </div>
            </div>
        </div>
    )
}

export default MatchCard