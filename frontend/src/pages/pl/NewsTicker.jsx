export default function NewsTicker({ matches }) {

    if (!matches || !matches.length) return null;

    const finished = matches
        .filter(match => match.status === "FINISHED")
        .slice(0, 8);

    const ticker = finished.map(match => {

        const home = match.homeTeam.shortName || match.homeTeam.name;
        const away = match.awayTeam.shortName || match.awayTeam.name;

        return `${home} ${match.score.fullTime.home} - ${match.score.fullTime.away} ${away}`;

    });

    ticker.push(
        "Premier League focus",
        "380 matches",
        "Final table fallback",
        "Updated standings"
    );

    return (

        <section className="border-y border-white/10 bg-cyan-300 text-gray-950">

            <div className="kickoff-ticker flex whitespace-nowrap py-3 font-black uppercase tracking-wider">
                {[...ticker, ...ticker].map((item, index) => (

                    <span
                        key={index}
                        className="mx-8 inline-flex items-center gap-4 text-sm"
                    >

                        <span className="h-2 w-2 rounded-full bg-slate-950" />

                        {item}

                    </span>

                ))}

            </div>

        </section>

    );

}
