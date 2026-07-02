import { Activity, CalendarClock, Medal, Shield, Star, Trophy } from "lucide-react";

const teamName = (team) => team?.shortName || team?.name || "TBC";

export default function FeatureStrip({ competition, matches, players }) {
    if (!competition || !matches) return null;

    const finished = matches.filter((match) => match.status === "FINISHED");
    const upcoming = matches
        .filter((match) => match.status === "TIMED" || match.status === "SCHEDULED")
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    const live = matches.filter((match) => match.status === "LIVE" || match.status === "IN_PLAY");
    const next = upcoming[0];
    const topScorer = players?.[0];

    const cards = [
        {
            icon: Trophy,
            title: "Season",
            value: competition.displaySeason,
            subtitle: competition.dataMode === "previous" ? "Final archive" : "Live season",
            color: "text-yellow-300"
        },
        {
            icon: CalendarClock,
            title: "Next Fixture",
            value: next ? `${teamName(next.homeTeam)} vs ${teamName(next.awayTeam)}` : "Schedule pending",
            subtitle: next ? new Date(next.utcDate).toLocaleDateString() : "No fixture listed",
            color: "text-cyan-300"
        },
        {
            icon: Star,
            title: "Golden Boot",
            value: topScorer?.player?.name || "Awaiting data",
            subtitle: topScorer ? `${topScorer.goals} goals` : "Top scorer unavailable",
            color: "text-emerald-300"
        },
        {
            icon: Activity,
            title: "Live Now",
            value: live.length,
            subtitle: live.length ? "In play" : "No live matches",
            color: "text-red-300"
        }
    ];

    return (
        <section className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="relative min-h-[168px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/40"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.06),transparent_42%)]" />
                            <div className="relative flex h-full flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/40">{card.title}</p>
                                    <Icon className={card.color} size={22} />
                                </div>
                                <div>
                                    <h3 className="min-h-[64px] text-2xl font-black leading-tight text-white">{card.value}</h3>
                                    <p className="mt-2 text-sm font-bold text-white/45">{card.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">League pulse</p>
                            <h2 className="mt-1 text-2xl font-black">Focused competitions</h2>
                        </div>
                        <Shield className="text-cyan-300" size={26} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {["Premier League", "Champions League", "FIFA World Cup"].map((label) => (
                            <div key={label} className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-black text-white">
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-5">
                    <div className="flex items-center gap-3">
                        <Medal className="text-yellow-300" size={24} />
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-200">Data logic</p>
                            <p className="mt-1 text-sm font-bold leading-6 text-white/70">
                                {competition.note || `${finished.length} matches loaded for this season.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
