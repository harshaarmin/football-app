import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";

export default function NewsSection() {

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchNews = async () => {

            try {

                const res = await axios.get(
                    "http://localhost:3000/api/news/pl"
                );

                setArticles(res.data);

            }

            catch (err) {

                console.log(err);

            }

            finally {

                setLoading(false);

            }

        };

        fetchNews();

    }, []);

    if (loading) {

        return (

            <section className="mt-28">

                <div className="text-center text-white py-20">

                    Loading Latest News...

                </div>

            </section>

        );

    }

    return (

        <section className="mt-28">

            <div className="flex items-center justify-between mb-10">

                <div>

                    <h2 className="text-5xl font-black text-white">

                        Latest News

                    </h2>

                    <p className="mt-3 text-white/55">

                        Premier League stories powered by BBC Sport.

                    </p>

                </div>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-white hover:bg-white/10 transition">

                    View All

                </button>

            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {articles.slice(0,6).map((article,index)=>(

                    <a

                        key={index}

                        href={article.link}

                        target="_blank"

                        rel="noreferrer"

                        className="group overflow-hidden rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl hover:border-cyan-400/50 transition-all duration-300"

                    >

                        <div className="relative h-60 overflow-hidden">
                                                        <img
                                src={
                                    article.image ||
                                    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1200"
                                }
                                alt={article.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#070B18] via-[#070B18]/20 to-transparent" />

                            <div className="absolute top-5 left-5 rounded-full bg-cyan-500/90 px-4 py-2 text-xs font-bold uppercase tracking-[2px] text-white">

                                BBC SPORT

                            </div>

                        </div>

                        <div className="p-7">

                            <h3 className="line-clamp-2 text-2xl font-black leading-snug text-white transition-colors group-hover:text-cyan-300">

                                {article.title}

                            </h3>

                            <p className="mt-4 line-clamp-3 text-white/60 leading-7">

                                {article.content}

                            </p>

                            <div className="mt-8 flex items-center justify-between">

                                <div>

                                    <div className="text-xs uppercase tracking-[2px] text-white/40">

                                        Published

                                    </div>

                                    <div className="mt-2 text-sm font-semibold text-white">

                                        {

                                            new Date(
                                                article.pubDate
                                            ).toLocaleDateString()

                                        }

                                    </div>

                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 transition-transform duration-300 group-hover:translate-x-1">

                                    <ArrowRight
                                        size={22}
                                        className="text-white"
                                    />

                                </div>

                            </div>

                        </div>

                    </a>

                ))}

            </div>

        </section>

    );

}