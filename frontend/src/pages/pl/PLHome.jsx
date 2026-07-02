import { useEffect, useState } from "react";
import axios from "axios";

import Hero from "./Hero";
import FeatureStrip from "./FeatureStrip";
import LiveMatch from "./LiveMatch";
import LeagueTable from "./LeagueTable";
import TopPlayers from "./TopPlayers";
import TopClubs from "./TopClubs";
import CompetitionStats from "./CompetitionStats";
import TrendingMatches from "./TrendingMatches";
import NewsSection from "./NewsSection";
import FooterBanner from "./FooterBanner";
import NewsTicker from "./NewsTicker";

export default function PLHome() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchPL = async () => {

            try {

                const res = await axios.get(
                    "http://localhost:3000/api/pl/home"
                );

                setData(res.data);
                setError("");

            }

            catch (err) {

                console.log(err);
                setError("Premier League data could not load right now.");

            }

            finally {

                setLoading(false);

            }

        };

        fetchPL();

    }, []);

    if (loading) {

        return (

            <div className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4 text-white">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center">
                    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent" />
                    <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                        Loading Premier League
                    </p>
                </div>

            </div>

        );

    }

    if (error || !data) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4 text-white">
                <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
                        Data unavailable
                    </p>
                    <h1 className="mt-3 text-3xl font-black">
                        Premier League could not load.
                    </h1>
                    <p className="mt-3 text-white/55">
                        {error || "Please try again in a moment."}
                    </p>
                </div>
            </main>
        );
    }

    return (

        <main className="min-h-screen bg-[#06070a] text-white">

            <div className="mx-auto max-w-7xl px-4 pb-10 pt-7 lg:px-6">
                <Hero
                    competition={data.competition}
                    matches={data.matches}
                />

                <NewsTicker matches={data.matches} />

                <FeatureStrip
                    competition={data.competition}
                    matches={data.matches}
                    players={data.players}
                />

                <LiveMatch matches={data.matches} />

                <LeagueTable
                    standings={data.standings}
                    competition={data.competition}
                />

                <TopPlayers
                    players={data.players}
                    competition={data.competition}
                />

                <TopClubs
                    clubs={data.clubs}
                    competition={data.competition}
                />

                <CompetitionStats
                    standings={data.standings}
                    matches={data.matches}
                    competition={data.competition}
                />

                <TrendingMatches matches={data.matches} />

                <NewsSection />

                <FooterBanner />

            </div>

        </main>

    );

}
