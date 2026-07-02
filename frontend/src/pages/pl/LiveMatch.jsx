import { Clock3, Radio } from "lucide-react";

const teamName = (team) => team?.shortName || team?.name || "TBC";

function MatchRow({ match, mode }) {
    const isResult = mode === "result";

    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/5 px-4 py-4 transition hover:bg-white/5 sm:px-5">
            <div className="min-w-0 flex items-center gap-3">
                <img src={match.homeTeam.crest} alt="" className="h-9 w-9 flex-shrink-0 object-contain" />
                <span className="truncate text-sm font-bold text-white">{teamName(match.homeTeam)}</span>
            </div>

            <div className="text-center">
                {isResult ? (
                    <div className="rounded-lg bg-white px-3 py-1.5 text-sm font-black text-gray-950">
                        {match.score.fullTime.home}
                        <span className="mx-1 text-gray-400">-</span>
                        {match.score.fullTime.away}
                    </div>
                ) : (
                    <div className="text-sm font-black text-cyan-300">VS</div>
                )}
                <div className="mt-1 text-[10px] uppercase tracking-widest text-white/35">
                    {isResult ? "FT" : new Date(match.utcDate).toLocaleDateString()}
                </div>
            </div>

            <div className="min-w-0 flex items-center justify-end gap-3">
                <span className="truncate text-right text-sm font-bold text-white">{teamName(match.awayTeam)}</span>
                <img src={match.awayTeam.crest} alt="" className="h-9 w-9 flex-shrink-0 object-contain" />
            </div>
        </div>
    );
}

export default function LiveMatch({ matches }) {
    if (!matches || !matches.length) return null;

    const liveMatches = matches.filter((match) => match.status === "LIVE" || match.status === "IN_PLAY");
    const upcomingMatches = matches
        .filter((match) => match.status === "TIMED" || match.status === "SCHEDULED")
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    const recentResults = matches
        .filter((match) => match.status === "FINISHED")
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

    return (
        <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">Matches</p>
                    <h2 className="mt-1 text-3xl font-black text-white">Recent & Upcoming</h2>
                    <p className="mt-2 text-sm text-white/55">
                        Results stay useful while the next season schedule settles in.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-red-300/20 bg-red-300/5">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <Radio size={18} className="text-red-300" />
                            <span className="text-xs font-black uppercase tracking-[0.24em] text-red-200">Live now</span>
                        </div>
                        <span className="rounded-full bg-red-400 px-3 py-1 text-xs font-black text-gray-950">{liveMatches.length}</span>
                    </div>

                    {liveMatches.length ? (
                        liveMatches.slice(0, 5).map((match) => <MatchRow key={match.id} match={match} mode="result" />)
                    ) : (
                        recentResults.slice(0, 5).map((match) => <MatchRow key={match.id} match={match} mode="result" />)
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <Clock3 size={18} className="text-cyan-300" />
                            <span className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
                                {upcomingMatches.length ? "Upcoming" : "Recent form"}
                            </span>
                        </div>
                        <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-gray-950">
                            {upcomingMatches.length || recentResults.length}
                        </span>
                    </div>

                    {(upcomingMatches.length ? upcomingMatches : recentResults)
                        .slice(0, 5)
                        .map((match) => (
                            <MatchRow
                                key={`${match.id}-${upcomingMatches.length ? "upcoming" : "recent"}`}
                                match={match}
                                mode={upcomingMatches.length ? "upcoming" : "result"}
                            />
                        ))}
                </div>
            </div>
        </section>
    );
}
