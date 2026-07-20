import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Shield, Trophy } from "lucide-react";
import API_BASE_URL from "../utils/api";
import { PageSkeleton } from "../components/Skeleton";

const fallbackCompetitions = [
  { code: "PL", name: "Premier League", country: "England", headline: "English football control room", accent: "cyan" },
  { code: "CL", name: "Champions League", country: "Europe", headline: "Europe's elite knockout path", accent: "blue" },
  { code: "PD", name: "La Liga", country: "Spain", headline: "Spanish title race tracker", accent: "red" },
  { code: "BL1", name: "Bundesliga", country: "Germany", headline: "German football tempo board", accent: "orange" },
  { code: "SA", name: "Serie A", country: "Italy", headline: "Italian football table watch", accent: "emerald" },
  { code: "FL1", name: "Ligue 1", country: "France", headline: "French football weekly desk", accent: "violet" }
];

export default function CompetitionsHub() {
  const [competitions, setCompetitions] = useState([]);
  const [selected, setSelected] = useState("PL");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/competitions`)
      .then((res) => setCompetitions(res.data?.length ? res.data : fallbackCompetitions))
      .catch(() => setCompetitions(fallbackCompetitions))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton label="Loading competitions" />;

  const active = competitions.find((item) => item.code === selected) || competitions[0] || fallbackCompetitions[0];

  return (
    <main className="min-h-screen bg-[#06070a] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(250,204,21,0.10),transparent_32%),linear-gradient(135deg,#061118_0%,#0d1320_48%,#050608_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-950">
            Explore
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] sm:text-6xl">
            Pick the competition. Keep the page focused.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">
            Premier League, Champions League, La Liga, Bundesliga, Serie A and Ligue 1 use one consistent hub pattern with expandable data.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {competitions.map((competition) => (
            <button
              key={competition.code}
              onClick={() => setSelected(competition.code)}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                selected === competition.code
                  ? "border-cyan-300 bg-cyan-300/10"
                  : "border-white/10 bg-white/[0.045] hover:border-cyan-300/40"
              }`}
            >
              <Shield className="text-cyan-300" size={22} />
              <h3 className="mt-4 truncate text-sm font-black">{competition.name}</h3>
              <p className="mt-1 text-xs font-bold text-white/40">{competition.country || competition.area?.name}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">{active.country || active.area?.name}</p>
            <h2 className="mt-2 text-4xl font-black">{active.name}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
              {active.description || active.headline || "Fixtures, standings, teams and player snapshots in a consistent hub."}
            </p>
            <button
              onClick={() => navigate(`/competitions/${active.code}`)}
              className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-black text-gray-950 transition hover:bg-cyan-300"
            >
              Open competition
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6">
            <Trophy className="text-yellow-300" size={28} />
            <h3 className="mt-4 text-2xl font-black">Designed for scan speed</h3>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Each competition page keeps the first screen light, then reveals standings, fixtures, teams and scorers through tabs.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
