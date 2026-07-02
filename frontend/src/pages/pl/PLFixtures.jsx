import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, Clock3, Flame, Goal, Shield, Trophy } from "lucide-react";

const teamName = (team) => team?.shortName || team?.name || "TBC";

const formatDate = (date) =>
    new Date(date).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

export default function PLFixtures() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFixtures = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/pl/home");
                setData(res.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFixtures();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4 text-white">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center">
                    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent" />
                    <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                        Loading fixtures
                    </p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4 text-white">
                <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Data unavailable</p>
                    <h1 className="mt-3 text-3xl font-black">Fixtures could not load.</h1>
                </div>
            </main>
        );
    }

    const upcoming = data.matches
        .filter((match) => match.status === "TIMED" || match.status === "SCHEDULED")
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    const previous = data.matches
        .filter((match) => match.status === "FINISHED")
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

    const fixtures = upcoming.length ? upcoming : previous;
    const showingArchive = upcoming.length === 0;
    const finished = data.matches.filter((match) => match.status === "FINISHED");
    const goals = finished.reduce(
        (sum, match) => sum + (match.score.fullTime.home ?? 0) + (match.score.fullTime.away ?? 0),
        0
    );
    const homeWins = finished.filter((match) => match.score.winner === "HOME_TEAM").length;
    const awayWins = finished.filter((match) => match.score.winner === "AWAY_TEAM").length;
    const draws = finished.filter((match) => match.score.winner === "DRAW").length;
    const highestScoring = finished
        .slice()
        .sort((a, b) =>
            ((b.score.fullTime.home ?? 0) + (b.score.fullTime.away ?? 0)) -
            ((a.score.fullTime.home ?? 0) + (a.score.fullTime.away ?? 0))
        )[0];
    const matchdays = fixtures.reduce((acc, match) => {
        const key = match.matchday || "TBC";
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
    }, {});
    const statCards = [
        { label: "Matches played", value: finished.length, icon: Trophy, color: "text-cyan-300" },
        { label: "Goals", value: goals, icon: Goal, color: "text-yellow-300" },
        { label: "Home wins", value: homeWins, icon: Shield, color: "text-emerald-300" },
        { label: "Away wins", value: awayWins, icon: Flame, color: "text-red-300" }
    ];

    return (
        <main className="min-h-screen bg-[#06070a] text-white">
            <section className="relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(250,204,21,0.12),transparent_32%),linear-gradient(135deg,#061118_0%,#0d1320_48%,#050608_100%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6">
                    <span className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-950">
                        Premier League {data.competition.displaySeason}
                    </span>
                    <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] sm:text-6xl">
                        Fixtures that still tell the story.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                        {showingArchive
                            ? data.competition.note || "New season fixtures are not live yet, so showing the most recent Premier League results."
                            : "Upcoming Premier League fixtures, sorted by kickoff."}
                    </p>

                    <div className="mt-7 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <div key={card.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                    <Icon className={card.color} size={22} />
                                    <div className="mt-3 text-3xl font-black">{card.value}</div>
                                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{card.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
                <div className="mb-8 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">Season read</p>
                        <h2 className="mt-2 text-2xl font-black">{showingArchive ? "Archive mode is intentional" : "Schedule mode"}</h2>
                        <p className="mt-3 text-sm leading-6 text-white/55">
                            {showingArchive
                                ? "Because the new season has not started, this page uses the completed season to keep the experience useful."
                                : "Upcoming fixtures are live, with results and season stats still available for context."}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.26em] text-yellow-300">Match to revisit</p>
                        <h2 className="mt-2 text-2xl font-black">
                            {highestScoring ? `${teamName(highestScoring.homeTeam)} ${highestScoring.score.fullTime.home}-${highestScoring.score.fullTime.away} ${teamName(highestScoring.awayTeam)}` : "Awaiting results"}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-white/55">
                            Highest-scoring fixture from the loaded Premier League data.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-300">Result profile</p>
                        <h2 className="mt-2 text-2xl font-black">{draws} draws</h2>
                        <p className="mt-3 text-sm leading-6 text-white/55">
                            Home wins {homeWins}, away wins {awayWins}. Good quick context before scanning fixtures.
                        </p>
                    </div>
                </div>

                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
                            {showingArchive ? "Previous season" : "Upcoming"}
                        </p>
                        <h2 className="mt-1 text-3xl font-black">
                            {showingArchive ? "Recent Results" : "Premier League Fixtures"}
                        </h2>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/50">
                        {fixtures.length} matches
                    </span>
                </div>

                <div className="grid gap-6">
                    {Object.entries(matchdays).map(([matchday, matches]) => (
                        <div key={matchday}>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-[0.24em] text-white/45">
                                    Matchday {matchday}
                                </h3>
                                <span className="text-xs font-bold text-white/35">{matches.length} matches</span>
                            </div>
                            <div className="grid gap-4">
                                {matches.map((match) => {
                        const isResult = match.status === "FINISHED";

                        return (
                            <article
                                key={match.id}
                                className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/40 sm:p-5"
                            >
                                <div className="grid gap-5 lg:grid-cols-[190px_1fr_150px] lg:items-center">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-4 py-2 text-cyan-200">
                                            <CalendarDays size={16} />
                                            <span className="text-sm font-black">{formatDate(match.utcDate)}</span>
                                        </div>
                                        <div className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white/45">
                                            <Clock3 size={15} />
                                            {isResult ? "Full time" : formatTime(match.utcDate)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                        <div className="min-w-0 flex items-center gap-3">
                                            <img src={match.homeTeam.crest} alt="" className="h-12 w-12 flex-shrink-0 object-contain" />
                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-black">{teamName(match.homeTeam)}</p>
                                                <p className="text-xs font-bold text-white/40">Home</p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-white px-4 py-2 text-center text-base font-black text-gray-950">
                                            {isResult ? (
                                                <>
                                                    {match.score.fullTime.home}
                                                    <span className="mx-1 text-gray-400">-</span>
                                                    {match.score.fullTime.away}
                                                </>
                                            ) : (
                                                "VS"
                                            )}
                                        </div>

                                        <div className="min-w-0 flex items-center justify-end gap-3">
                                            <div className="min-w-0 text-right">
                                                <p className="truncate text-lg font-black">{teamName(match.awayTeam)}</p>
                                                <p className="text-xs font-bold text-white/40">Away</p>
                                            </div>
                                            <img src={match.awayTeam.crest} alt="" className="h-12 w-12 flex-shrink-0 object-contain" />
                                        </div>
                                    </div>

                                    <div className="text-left lg:text-right">
                                        <span className={`inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${
                                            isResult
                                                ? "bg-emerald-300/15 text-emerald-200"
                                                : "bg-cyan-300/15 text-cyan-200"
                                        }`}>
                                            {isResult ? "Result" : match.status}
                                        </span>
                                        <p className="mt-2 text-sm font-bold text-white/40">Matchday {match.matchday || "--"}</p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
