import { ArrowRight, CalendarDays, Table2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const teamName = (team) => team?.shortName || team?.name || "TBC";

const formatDate = (date) =>
    new Date(date).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

export default function Hero({ competition, matches }) {
    const navigate = useNavigate();

    if (!competition || !matches) return null;

    const finished = matches
        .filter((match) => match.status === "FINISHED")
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

    const upcoming = matches
        .filter((match) => match.status === "TIMED" || match.status === "SCHEDULED")
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    const latest = finished[0];
    const next = upcoming[0];
    const played = finished.length;
    const remaining = Math.max(380 - played, 0);
    const totalGoals = finished.reduce(
        (sum, match) =>
            sum + (match.score.fullTime.home ?? 0) + (match.score.fullTime.away ?? 0),
        0
    );
    const avgGoals = played ? (totalGoals / played).toFixed(1) : "--";

    const stats = [
        { value: played, label: "Played", color: "text-emerald-300" },
        { value: remaining, label: "Remaining", color: "text-blue-300" },
        { value: totalGoals, label: "Goals", color: "text-yellow-300" },
        { value: avgGoals, label: "Avg/match", color: "text-cyan-300" }
    ];
    const heroTeams = [
        latest?.homeTeam,
        latest?.awayTeam,
        next?.homeTeam,
        next?.awayTeam
    ].filter(Boolean);

    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(250,204,21,0.14),transparent_32%),linear-gradient(135deg,#061118_0%,#0d1320_48%,#050608_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#06070a] to-transparent" />

            <div className="relative pb-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-200">
                        {competition.dataMode === "previous" ? "Season archive" : "Live league hub"}
                    </span>
                    <button
                        onClick={() => navigate("/pl/fixtures")}
                        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/70 transition hover:border-cyan-300 hover:text-white"
                    >
                        Full fixtures
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
                    <div className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#071018] p-5 sm:p-8">
                        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(34,211,238,0.12),transparent_45%),linear-gradient(20deg,rgba(250,204,21,0.10),transparent_34%)]" />

                        {competition.emblem && (
                            <img
                                src={competition.emblem}
                                alt=""
                                className="absolute right-8 top-10 h-24 w-40 object-contain opacity-10 sm:h-28 sm:w-52"
                            />
                        )}

                        <div className="absolute right-6 bottom-7 hidden w-[300px] grid-cols-2 gap-3 lg:grid">
                            {heroTeams.slice(0, 4).map((team, index) => (
                                <div
                                    key={`${team.id}-${index}`}
                                    className="flex min-h-[86px] items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 backdrop-blur"
                                >
                                    <img src={team.crest} alt="" className="h-11 w-11 flex-shrink-0 object-contain" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black text-white">{teamName(team)}</p>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/35">
                                            {index < 2 ? "Latest" : "Next"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative z-20 max-w-2xl">
                            <span className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-950">
                                Premier League {competition.displaySeason}
                            </span>
                            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] sm:text-6xl">
                                Every rivalry,<br />every table swing,<br />every weekend.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                                Fixtures, final standings, top scorers and club intelligence in one focused Premier League experience.
                            </p>

                            {competition.note && (
                                <p className="mt-4 max-w-xl rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm font-bold text-yellow-100">
                                    {competition.note}
                                </p>
                            )}

                            <div className="mt-7 flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate("/pl/fixtures")}
                                    className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-black text-gray-950 transition hover:bg-cyan-300"
                                >
                                    <CalendarDays size={18} />
                                    Fixtures
                                    <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={() => document.getElementById("pl-table")?.scrollIntoView({ behavior: "smooth" })}
                                    className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white/75 transition hover:border-yellow-300 hover:text-white"
                                >
                                    <Table2 size={18} />
                                    Table
                                </button>
                            </div>
                        </div>

                        <div className="relative z-20 mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                                    <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
                                    {latest ? "Latest score" : "Match centre"}
                                </p>
                                <h2 className="mt-1 text-2xl font-black">Match centre</h2>
                            </div>
                            <Trophy className="text-yellow-300" size={28} />
                        </div>

                        {latest ? (
                            <div className="rounded-2xl bg-black/30 p-4">
                                <p className="mb-3 text-xs text-white/45">Full time</p>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                    <div className="min-w-0">
                                        <img src={latest.homeTeam.crest} alt="" className="mb-2 h-12 w-12 object-contain" />
                                        <h3 className="truncate text-lg font-black">{teamName(latest.homeTeam)}</h3>
                                    </div>
                                    <div className="rounded-xl bg-white px-3 py-2 text-center text-gray-950">
                                        <div className="text-xl font-black">
                                            {latest.score.fullTime.home}
                                            <span className="mx-1 text-gray-400">-</span>
                                            {latest.score.fullTime.away}
                                        </div>
                                    </div>
                                    <div className="min-w-0 text-right">
                                        <img src={latest.awayTeam.crest} alt="" className="ml-auto mb-2 h-12 w-12 object-contain" />
                                        <h3 className="truncate text-lg font-black">{teamName(latest.awayTeam)}</h3>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-black/30 p-6 text-center text-sm text-white/45">
                                No results available yet
                            </div>
                        )}

                        {next && (
                            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                                <p className="mb-3 text-xs font-black uppercase tracking-widest text-emerald-300">Next kickoff</p>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                    <div className="min-w-0 flex items-center gap-2">
                                        <img src={next.homeTeam.crest} alt="" className="h-8 w-8 object-contain" />
                                        <span className="truncate text-sm font-bold">{teamName(next.homeTeam)}</span>
                                    </div>
                                    <span className="text-xs font-black text-emerald-300">VS</span>
                                    <div className="min-w-0 flex items-center justify-end gap-2">
                                        <span className="truncate text-right text-sm font-bold">{teamName(next.awayTeam)}</span>
                                        <img src={next.awayTeam.crest} alt="" className="h-8 w-8 object-contain" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                                    <span className="font-bold text-white/60">{formatDate(next.utcDate)}</span>
                                    <span className="font-black text-white">{formatTime(next.utcDate)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
