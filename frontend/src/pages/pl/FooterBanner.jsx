import { Link } from "react-router-dom";

export default function FooterBanner() {
    return (
        <section className="mb-12 mt-10">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#071018] p-6 sm:p-8">
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(34,211,238,0.12),transparent_42%),linear-gradient(20deg,rgba(250,204,21,0.10),transparent_36%)]" />

                <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">KickOff focus</p>
                        <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">
                            Premier League, Champions League and FIFA World Cup. Nothing noisy.
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                            The site now keeps the football coverage focused on the competitions that matter for this portfolio.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/worldcup"
                            className="rounded-xl bg-white px-5 py-3 text-sm font-black text-gray-950 transition hover:bg-yellow-300"
                        >
                            World Cup
                        </Link>
                        <Link
                            to="/pl/fixtures"
                            className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white/70 transition hover:border-cyan-300 hover:text-white"
                        >
                            PL Fixtures
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
