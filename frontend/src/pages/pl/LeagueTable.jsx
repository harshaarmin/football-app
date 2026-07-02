export default function LeagueTable({ standings, competition }) {

    if (!standings || !standings.length) return null;

    const table = standings[0].table;

    return (

        <section id="pl-table" className="mt-10">

            <div className="mb-4 flex items-end justify-between gap-4">

                <div>

                    <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
                        Standings
                    </p>

                    <h2 className="mt-1 text-3xl font-black text-white">

                        League Table

                    </h2>

                    <p className="mt-2 text-sm text-white/55">

                        {competition?.note || "Premier League table."}

                    </p>

                </div>

            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">

                {/* HEADER */}

                <div className="grid grid-cols-12 border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/40 sm:px-5">

                    <div>Pos</div>

                    <div className="col-span-4">

                        Club

                    </div>

                    <div className="text-center">

                        P

                    </div>

                    <div className="text-center">

                        W

                    </div>

                    <div className="text-center">

                        D

                    </div>

                    <div className="text-center">

                        L

                    </div>

                    <div className="text-center">

                        GD

                    </div>

                    <div className="text-center">

                        Pts

                    </div>

                </div>

                {/* ROWS */}

                <div>

                    {table.map((club) => {

                        const topFour =

                            club.position <= 4;

                        const europa =

                            club.position === 5;

                        const relegation =

                            club.position >= 18;

                        return (
                            <div
                                key={club.team.id}
                                className="grid grid-cols-12 items-center border-b border-white/5 px-4 py-3 transition-all duration-300 hover:bg-white/5 sm:px-5"
                            >

                                {/* POSITION */}

                                <div>

                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black

                                        ${
                                            topFour
                                                ? "bg-emerald-400 text-gray-950"

                                                : europa
                                                ? "bg-blue-400 text-gray-950"

                                                : relegation
                                                ? "bg-red-500 text-white"

                                                : "bg-white/10 text-white"
                                        }`}
                                    >

                                        {club.position}

                                    </div>

                                </div>

                                {/* TEAM */}

                                <div className="col-span-4 flex min-w-0 items-center gap-3">

                                    <img
                                        src={club.team.crest}
                                        alt=""
                                        className="h-9 w-9 flex-shrink-0 object-contain"
                                    />

                                    <div className="min-w-0">

                                        <div className="truncate text-sm font-bold text-white">

                                            {club.team.shortName ||
                                                club.team.name}

                                        </div>

                                        <div className="mt-0.5 text-xs text-white/40">

                                            {club.team.tla}

                                        </div>

                                    </div>

                                </div>

                                {/* PLAYED */}

                                <div className="text-center text-sm font-semibold text-white">

                                    {club.playedGames}

                                </div>

                                {/* WON */}

                                <div className="text-center text-sm font-semibold text-emerald-300">

                                    {club.won}

                                </div>

                                {/* DRAW */}

                                <div className="text-center text-sm font-semibold text-yellow-300">

                                    {club.draw}

                                </div>

                                {/* LOST */}

                                <div className="text-center text-sm font-semibold text-red-300">

                                    {club.lost}

                                </div>

                                {/* GOAL DIFFERENCE */}

                                <div
                                    className={`text-center text-sm font-bold

                                    ${
                                        club.goalDifference >= 0
                                            ? "text-cyan-300"

                                            : "text-red-300"
                                    }`}
                                >

                                    {club.goalDifference > 0
                                        ? `+${club.goalDifference}`
                                        : club.goalDifference}

                                </div>

                                {/* POINTS */}

                                <div className="flex justify-center">

                                    <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-black text-gray-950">

                                        {club.points}

                                    </span>

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

            {/* LEGEND */}

            <div className="mt-5 flex flex-wrap gap-5 text-sm">

                <div className="flex items-center gap-2">

                    <div className="h-4 w-4 rounded bg-emerald-500" />

                    <span className="text-white/60">

                        UEFA Champions League

                    </span>

                </div>

                <div className="flex items-center gap-2">

                    <div className="h-4 w-4 rounded bg-blue-500" />

                    <span className="text-white/60">

                        Europa League

                    </span>

                </div>

                <div className="flex items-center gap-2">

                    <div className="h-4 w-4 rounded bg-red-500" />

                    <span className="text-white/60">

                        Relegation

                    </span>

                </div>

            </div>

        </section>

    );

}
