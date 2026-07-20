import { Trophy } from "lucide-react";

export default function TopPlayers({ players, competition }) {

    if (!players || !players.length) return null;

    return (

        <section className="mt-10">

            <div className="mb-4 flex items-end justify-between gap-4">

                <div>

                    <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
                        Players
                    </p>

                    <h2 className="mt-1 text-3xl font-black text-white">

                        Golden Boot Race

                    </h2>

                    <p className="mt-2 text-sm text-white/55">

                        Top scorers from {competition?.displaySeason || "the Premier League"}.

                    </p>

                </div>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                {players.slice(0, 6).map((player, index) => (

                    <div

                        key={index}

                        className="group relative min-h-[298px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition duration-300 hover:-translate-y-0.5 hover:border-yellow-300/40"

                    >

                        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-yellow-400/10 blur-[120px]" />

                        <div className="relative z-10 p-5">

                            {/* RANK */}

                            <div className="flex items-center justify-between">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-xl font-black text-black shadow-lg shadow-yellow-500/20">

                                    #{index + 1}

                                </div>

                                <Trophy
                                    size={28}
                                    className="text-yellow-400"
                                />

                            </div>

                            {/* PLAYER */}

                            <div className="mt-6 min-h-[88px]">

                                <h3 className="text-xl font-black leading-tight text-white sm:text-2xl">

                                    {player.player.name}

                                </h3>

                                <p className="mt-2 text-white/55">

                                    {player.team.name}

                                </p>

                            </div>

                            {/* STATS */}

                            <div className="mt-5 grid grid-cols-2 gap-3">

                                <div className="rounded-xl bg-black/25 p-4">

                                    <div className="text-sm text-white/45">

                                        Goals

                                    </div>

                                    <div className="mt-2 text-3xl font-black text-cyan-300">

                                        {player.goals}

                                    </div>

                                </div>

                                <div className="rounded-xl bg-black/25 p-4">

                                    <div className="text-sm text-white/45">

                                        Assists

                                    </div>

                                    <div className="mt-2 text-3xl font-black text-emerald-300">

                                        {player.assists ?? "--"}

                                    </div>

                                </div>

                            </div>

                            {/* DETAILS */}

                            <div className="mt-5 space-y-3 text-sm">

                                <div className="flex items-center justify-between gap-3">

                                    <span className="text-white/45">

                                        Nationality

                                    </span>

                                    <span className="font-semibold text-white">

                                        {player.player.nationality}

                                    </span>

                                </div>

                                <div className="flex items-center justify-between gap-3">

                                    <span className="text-white/45">

                                        Position

                                    </span>

                                    <span className="font-semibold text-white">

                                        {player.player.position || "--"}

                                    </span>

                                </div>

                            </div>

                            {/* FOOTER */}

                            <div className="mt-5 rounded-xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3">

                                <div className="text-xs uppercase tracking-[2px] text-yellow-300">

                                    Golden Boot Ranking

                                </div>

                                <div className="mt-2 text-white font-bold">

                                    Currently ranked #{index + 1}

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </section>

    );

}
