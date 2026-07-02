export default function TrendingMatches({ matches }) {
    if (!matches || !matches.length) return null;

    const featuredMatches = matches
        .slice()
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
        .slice(0, 8);

    return (
        <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">Fixtures</p>
                    <h2 className="mt-1 text-3xl font-black text-white">Featured Matches</h2>
                    <p className="mt-2 text-sm text-white/55">Recent and upcoming Premier League matches in a quick-scan layout.</p>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3">
                {featuredMatches.map((match) => {
                    const isFinished = match.status === "FINISHED";

                    return (
                        <article
                            key={match.id}
                            className="min-w-[300px] rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/40"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <span
                                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                        isFinished
                                            ? "bg-emerald-300/15 text-emerald-200"
                                            : "bg-cyan-300/15 text-cyan-200"
                                    }`}
                                >
                                    {isFinished ? "Full time" : match.status}
                                </span>
                                <span className="text-xs font-bold text-white/40">MD {match.matchday || "--"}</span>
                            </div>

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <div className="min-w-0 text-center">
                                    <img src={match.homeTeam.crest} alt="" className="mx-auto h-12 w-12 object-contain" />
                                    <p className="mt-2 truncate text-sm font-black text-white">
                                        {match.homeTeam.shortName || match.homeTeam.name}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-black/30 px-3 py-2 text-center text-sm font-black text-white">
                                    {isFinished ? (
                                        <>
                                            {match.score.fullTime.home}
                                            <span className="mx-1 text-white/35">-</span>
                                            {match.score.fullTime.away}
                                        </>
                                    ) : (
                                        "VS"
                                    )}
                                </div>
                                <div className="min-w-0 text-center">
                                    <img src={match.awayTeam.crest} alt="" className="mx-auto h-12 w-12 object-contain" />
                                    <p className="mt-2 truncate text-sm font-black text-white">
                                        {match.awayTeam.shortName || match.awayTeam.name}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center text-xs font-bold text-white/45">
                                {new Date(match.utcDate).toLocaleDateString()}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
