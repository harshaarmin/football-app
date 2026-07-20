import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import API_BASE_URL from "../../utils/api";

export default function NewsSection() {

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchNews = async () => {

            try {

                const res = await axios.get(
                    `${API_BASE_URL}/news/pl`
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

            <section className="mt-20 sm:mt-28">

                <div className="text-center text-white py-20">

                    Loading Latest News...

                </div>

            </section>

        );

    }

    return (

        <section className="mt-20 sm:mt-28">

            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">

                        Latest News

                    </h2>

                    <p className="mt-3 text-white/55">

                        Premier League stories powered by BBC Sport.

                    </p>

                </div>

                <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto">

                    View All

                </button>

            </div>

            <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3 lg:gap-8">

                {articles.slice(0, 6).map((article, index) => (

                    <a

                        key={index}

                        href={article.link}

                        target="_blank"

                        rel="noreferrer"

                        className="group overflow-hidden rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl hover:border-cyan-400/50 transition-all duration-300"

                    >

                        <div className="relative h-52 overflow-hidden sm:h-60">
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

                        <div className="p-5 sm:p-7">

                            <h3 className="line-clamp-2 text-xl font-black leading-snug text-white transition-colors group-hover:text-cyan-300 sm:text-2xl">

                                {article.title}

                            </h3>

                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/60 sm:text-base sm:leading-7">

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
