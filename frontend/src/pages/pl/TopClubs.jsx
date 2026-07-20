import { useNavigate } from "react-router-dom";

export default function TopClubs({ clubs, competition }) {
    const navigate = useNavigate();

    if (!clubs || !clubs.length) return null;

    return (
        <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">Clubs</p>
                    <h2 className="mt-1 text-3xl font-black text-white">Premier League Clubs</h2>
                    <p className="mt-2 text-sm text-white/55">
                        Consistent club cards with useful profile data.
                    </p>
                </div>
                <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/50 sm:inline-flex">
                    {competition?.displaySeason}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {clubs.map((club) => {
                    const facts = club.facts || {};

                    return (
                        <article
                            key={club.id}
                            onClick={() => navigate(`/teams/${club.id}`)}
                            className="group relative flex min-h-[386px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/40"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),transparent_40%),linear-gradient(30deg,rgba(250,204,21,0.07),transparent_36%)] opacity-80" />

                            <div className="relative flex flex-1 flex-col">
                                <div className="flex justify-center">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-black/25 p-3">
                                        <img
                                            src={club.crest}
                                            alt={club.name}
                                            className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 min-h-[76px] text-center">
                                    <h3 className="mx-auto flex min-h-[56px] max-w-[220px] items-center justify-center text-xl font-black leading-tight text-white sm:text-2xl">
                                        {club.shortName || club.name}
                                    </h3>
                                    <p className="text-sm font-bold text-white/45">
                                        {facts.nickname || club.area?.name || "Premier League"}
                                    </p>
                                </div>

                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="grid grid-cols-[96px_1fr] gap-3 border-b border-white/10 pb-3">
                                        <span className="text-white/40">Venue</span>
                                        <span className="break-words text-right font-bold text-white">{facts.venue || club.venue || "TBA"}</span>
                                    </div>
                                    <div className="grid grid-cols-[96px_1fr] gap-3 border-b border-white/10 pb-3">
                                        <span className="text-white/40">Founded</span>
                                        <span className="text-right font-bold text-white">{facts.founded || club.founded || "--"}</span>
                                    </div>
                                    <div className="grid grid-cols-[96px_1fr] gap-3 border-b border-white/10 pb-3">
                                        <span className="text-white/40">Capacity</span>
                                        <span className="text-right font-bold text-white">{facts.capacity || "TBA"}</span>
                                    </div>
                                    <div className="grid grid-cols-[96px_1fr] gap-3">
                                        <span className="text-white/40">Honours</span>
                                        <span className="break-words text-right font-bold text-yellow-200">{facts.majorHonours || "Top-flight club"}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-5">
                                    <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white/55">
                                        Open team profile · #{facts.lastSeasonFinish || "--"}
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
