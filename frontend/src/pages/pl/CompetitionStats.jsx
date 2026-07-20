

import { Goal, Home, Plane, Scale, Sigma, Trophy } from "lucide-react";

export default function CompetitionStats({ standings, matches, competition }) {

    if (!standings || !matches) return null;



    const matchesPlayed = matches.filter(
        match => match.status === "FINISHED"
    );

    const totalGoals = matchesPlayed.reduce(
        (sum, match) =>
            sum +
            (match.score.fullTime.home ?? 0) +
            (match.score.fullTime.away ?? 0),
        0
    );

    const homeWins = matchesPlayed.filter(
        match => match.score.winner === "HOME_TEAM"
    ).length;

    const awayWins = matchesPlayed.filter(
        match => match.score.winner === "AWAY_TEAM"
    ).length;

    const draws = matchesPlayed.filter(
        match => match.score.winner === "DRAW"
    ).length;

    const averageGoals =
        matchesPlayed.length
            ? (totalGoals / matchesPlayed.length).toFixed(2)
            : 0;

    const cards = [

        {
            title: "Goals",
            value: totalGoals,
            icon: Goal,
            color: "text-yellow-300"
        },

        {
            title: "Matches",
            value: matchesPlayed.length,
            icon: Trophy,
            color: "text-cyan-300"
        },

        {
            title: "Avg Goals",
            value: averageGoals,
            icon: Sigma,
            color: "text-emerald-300"
        },

        {
            title: "Home Wins",
            value: homeWins,
            icon: Home,
            color: "text-blue-300"
        },

        {
            title: "Away Wins",
            value: awayWins,
            icon: Plane,
            color: "text-violet-300"
        },

        {
            title: "Draws",
            value: draws,
            icon: Scale,
            color: "text-white"
        }

    ];

    return (

        <section className="mt-10">

            <div className="mb-4 flex items-end justify-between gap-4">

                <div>

                    <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
                        Numbers
                    </p>

                    <h2 className="mt-1 text-3xl font-black text-white">

                        League Statistics

                    </h2>

                    <p className="mt-2 text-sm text-white/50">

                        {competition?.note || "Season numbers powered by Football Data API."}

                    </p>

                </div>

            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">

                {cards.map((card) => {
                    const Icon = card.icon;

                    return (

                        <div
                            key={card.title}
                            className="relative min-h-[156px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition duration-300 hover:border-cyan-300/40 sm:p-5"
                        >

                            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.06),transparent_42%)]" />

                            <div className="relative z-10 flex h-full flex-col justify-between">

                                <Icon className={card.color} size={26} />

                                <div>
                                    <div className="text-3xl font-black text-white sm:text-4xl">

                                        {card.value}

                                    </div>

                                    <div className="mt-1 text-sm font-bold text-white/50">

                                        {card.title}

                                    </div>
                                </div>

                            </div>

                        </div>

                    );
                })}

            </div>

        </section>

    );

}
