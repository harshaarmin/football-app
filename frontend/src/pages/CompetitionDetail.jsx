import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { CalendarDays, Star, Table2, Users } from "lucide-react";
import API_BASE_URL from "../utils/api";
import { PageSkeleton } from "../components/Skeleton";

const tabs = [
  { key: "table", label: "Table", icon: Table2 },
  { key: "fixtures", label: "Fixtures", icon: CalendarDays },
  { key: "teams", label: "Teams", icon: Users },
  { key: "scorers", label: "Scorers", icon: Star }
];

const teamName = (team) => team?.shortName || team?.name || "TBC";

export default function CompetitionDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("table");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/competitions/${String(code).toUpperCase()}/summary`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [code]);

  const finished = useMemo(() => {
    return data?.matches?.filter((match) => match.status === "FINISHED")
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate)) || [];
  }, [data]);

  const upcoming = useMemo(() => {
    return data?.matches?.filter((match) => match.status !== "FINISHED")
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)) || [];
  }, [data]);

  if (loading) return <PageSkeleton label="Loading competition hub" />;

  if (!data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4 text-white">
        <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Unavailable</p>
          <h1 className="mt-3 text-3xl font-black">Competition could not load.</h1>
        </div>
      </main>
    );
  }

  const table = data.standings?.[0]?.table || [];
  const shownFixtures = upcoming.length ? upcoming : finished;

  return (
    <main className="min-h-screen bg-[#06070a] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(250,204,21,0.10),transparent_32%),linear-gradient(135deg,#061118_0%,#0d1320_48%,#050608_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_320px] lg:px-6">
          <div>
            <span className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-950">
              {data.competition.displaySeason}
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] sm:text-6xl">
              {data.competition.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">
              {data.competition.description}
            </p>
            {data.competition.note && (
              <p className="mt-4 max-w-2xl rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm font-bold text-yellow-100">
                {data.competition.note}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["Teams", data.insights.totalTeams],
              ["Played", data.insights.matchesPlayed],
              ["Goals", data.insights.totalGoals],
              ["Avg", data.insights.averageGoals]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-center">
                <div className="text-3xl font-black text-cyan-300">{value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky top-[64px] z-30 border-b border-white/10 bg-[#06070a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 lg:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex min-w-max items-center gap-2 border-b-2 px-5 py-4 text-sm font-black transition ${
                  activeTab === tab.key
                    ? "border-cyan-300 text-white"
                    : "border-transparent text-white/45 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {activeTab === "table" && <TableView table={table} onTeam={(team) => navigate(`/teams/${team.id}`)} />}
        {activeTab === "fixtures" && <FixturesView matches={shownFixtures} />}
        {activeTab === "teams" && <TeamsView teams={data.teams} onTeam={(team) => navigate(`/teams/${team.id}`)} />}
        {activeTab === "scorers" && <ScorersView players={data.players} />}
      </section>
    </main>
  );
}

function TableView({ table, onTeam }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-12 border-b border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
          <span className="col-span-1">#</span>
          <span className="col-span-5">Team</span>
          <span className="col-span-1 text-center">P</span>
          <span className="col-span-1 text-center">W</span>
          <span className="col-span-1 text-center">D</span>
          <span className="col-span-1 text-center">GD</span>
          <span className="col-span-2 text-center text-white">Pts</span>
        </div>
        {table.map((row) => (
          <button key={row.team.id} onClick={() => onTeam(row.team)} className="grid w-full grid-cols-12 items-center border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5">
            <span className="col-span-1 text-sm font-black text-white/50">{row.position}</span>
            <span className="col-span-5 flex min-w-0 items-center gap-2">
              {row.team.crest && <img src={row.team.crest} alt="" className="h-7 w-7 object-contain" />}
              <span className="truncate text-sm font-black">{teamName(row.team)}</span>
            </span>
            <span className="col-span-1 text-center text-sm text-white/60">{row.playedGames}</span>
            <span className="col-span-1 text-center text-sm text-white/60">{row.won}</span>
            <span className="col-span-1 text-center text-sm text-white/60">{row.draw}</span>
            <span className="col-span-1 text-center text-sm text-white/60">{row.goalDifference}</span>
            <span className="col-span-2 text-center text-sm font-black text-cyan-300">{row.points}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FixturesView({ matches }) {
  return (
    <div className="grid gap-4">
      {matches.slice(0, 30).map((match) => (
        <article key={match.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <TeamSide team={match.homeTeam} />
            <div className="rounded-xl bg-white px-4 py-2 text-center text-sm font-black text-gray-950">
              {match.status === "FINISHED" ? `${match.score.fullTime.home}-${match.score.fullTime.away}` : "VS"}
            </div>
            <TeamSide team={match.awayTeam} right />
          </div>
          <div className="mt-4 border-t border-white/10 pt-3 text-center text-xs font-bold text-white/40">
            {new Date(match.utcDate).toLocaleDateString()} · Matchday {match.matchday || "--"}
          </div>
        </article>
      ))}
    </div>
  );
}

function TeamsView({ teams, onTeam }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {teams.map((team) => (
        <button key={team.id} onClick={() => onTeam(team)} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40">
          {team.crest && <img src={team.crest} alt="" className="h-16 w-16 object-contain" />}
          <h3 className="mt-4 min-h-[48px] text-xl font-black leading-tight">{teamName(team)}</h3>
          <p className="text-sm font-bold text-white/40">{team.area?.name || "Club"}</p>
        </button>
      ))}
    </div>
  );
}

function ScorersView({ players }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {players.slice(0, 18).map((row, index) => (
        <article key={`${row.player.id}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-300 text-sm font-black text-gray-950">{index + 1}</div>
            <div className="text-3xl font-black text-cyan-300">{row.goals}</div>
          </div>
          <h3 className="mt-5 text-xl font-black">{row.player.name}</h3>
          <p className="mt-1 text-sm font-bold text-white/45">{row.team.name}</p>
        </article>
      ))}
    </div>
  );
}

function TeamSide({ team, right }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${right ? "justify-end text-right" : ""}`}>
      {!right && team?.crest && <img src={team.crest} alt="" className="h-10 w-10 object-contain" />}
      <span className="truncate text-sm font-black">{teamName(team)}</span>
      {right && team?.crest && <img src={team.crest} alt="" className="h-10 w-10 object-contain" />}
    </div>
  );
}
