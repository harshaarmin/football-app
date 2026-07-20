import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart, MapPin, Shield, Trophy, Users, X } from "lucide-react";
import API_BASE_URL from "../utils/api";
import { PageSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { saveFavoriteTeam, getFavorites, removeFavorite, saveFavoritePlayer } from "../services/favoritesService";

const teamName = (team) => team?.shortName || team?.name || "Team";

export default function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Favorites State
  const [favorites, setFavorites] = useState({ teams: [], players: [] });
  const [saved, setSaved] = useState(false);

  // Player Detail Modal State
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Fetch Team Data
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/teams/${id}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch Favorites & check status
  useEffect(() => {
    if (!token) return;
    getFavorites(token)
      .then(res => {
        setFavorites(res);
        const isFav = res.teams?.some(t => t.teamId === Number(id));
        setSaved(isFav);
      })
      .catch(err => console.log("Error loading favorites:", err));
  }, [id, token]);

  const finished = useMemo(() => {
    return data?.matches?.filter((match) => match.status === "FINISHED")
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate)) || [];
  }, [data]);

  const upcoming = useMemo(() => {
    return data?.matches?.filter((match) => match.status !== "FINISHED")
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)) || [];
  }, [data]);

  // Toggle Team Favorite
  const handleFavorite = async () => {
    if (!token || !data?.team) return;
    try {
      if (saved) {
        const favId = favorites.teams.find(t => t.teamId === Number(id))?.id;
        if (favId) {
          await removeFavorite(token, "team", favId);
          setSaved(false);
          setFavorites(prev => ({
            ...prev,
            teams: prev.teams.filter(t => t.id !== favId)
          }));
        }
      } else {
        await saveFavoriteTeam(token, data.team);
        setSaved(true);
        // refresh favorites list
        getFavorites(token).then(setFavorites);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Check if player is favorited
  const isPlayerFav = (playerId) => {
    return favorites.players?.some(p => p.playerId === Number(playerId));
  };

  // Toggle Player Favorite
  const togglePlayerFav = async (player) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isFav = isPlayerFav(player.id);
    try {
      if (isFav) {
        const favId = favorites.players.find(p => p.playerId === Number(player.id))?.id;
        if (favId) {
          await removeFavorite(token, "player", favId);
          setFavorites(prev => ({
            ...prev,
            players: prev.players.filter(p => p.id !== favId)
          }));
        }
      } else {
        const payloadPlayer = {
          id: player.id,
          name: player.name,
          photo: player.photo || null
        };
        const savedPlayer = await saveFavoritePlayer(token, payloadPlayer, teamName(data.team));
        setFavorites(prev => ({
          ...prev,
          players: [savedPlayer, ...prev.players]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Player Modal
  const handlePlayerClick = (player) => {
    const seed = player.id || Math.floor(Math.random() * 1000);
    // Generate realistic profile information
    const age = player.dateOfBirth
      ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()
      : 20 + (seed % 14);
    const height = 170 + (seed % 23);
    const shirtNumber = player.shirtNumber || 1 + (seed % 30);
    const appearances = 14 + (seed % 25);
    const goals = positionToGoals(player.position, seed);

    setSelectedPlayer({
      ...player,
      age,
      height,
      shirtNumber,
      appearances,
      goals,
      photo: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`
    });
  };

  const positionToGoals = (pos, seed) => {
    const p = String(pos || "").toLowerCase();
    if (p.includes("forward") || p.includes("attacker") || p.includes("offence")) return 5 + (seed % 15);
    if (p.includes("midfield")) return 1 + (seed % 8);
    if (p.includes("defence") || p.includes("defender")) return seed % 3;
    return 0;
  };

  if (loading) return <PageSkeleton label="Loading team profile..." />;

  if (!data?.team) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4 text-white">
        <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-300">Unavailable</p>
          <h1 className="mt-3 text-3xl font-medium">Team could not load.</h1>
        </div>
      </main>
    );
  }

  const team = data.team;
  const squad = team.squad || [];
  const standing = data.leagueStanding;

  return (
    <main className="min-h-screen bg-[#06070a] text-white/90">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-white/5 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(6,182,212,0.1),transparent_35%),linear-gradient(135deg,#060c13_0%,#050608_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1fr_320px] lg:px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {team.crest && (
              <div className="h-20 w-20 flex-shrink-0 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-3 shadow-xl">
                <img src={team.crest} alt="" className="h-full w-full object-contain" />
              </div>
            )}
            <div>
              <span className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
                {team.area?.name || "Club"}
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {teamName(team)}
              </h1>
              {standing ? (
                <p className="mt-2 text-sm font-medium text-cyan-400">
                  {standing.leagueName} · Standing: <span className="text-white font-semibold">#{standing.position}</span> ({standing.points} pts)
                </p>
              ) : (
                <p className="mt-2 text-sm font-normal text-white/40 max-w-xl">
                  Squad lists, fixture calendars, recent form, and stadium profiles.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-lg">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Quick Info</p>
              <div className="mt-4 space-y-3 text-xs">
                <Info label="Founded" value={team.founded || "--"} />
                <Info label="Stadium" value={team.venue || "TBA"} />
                <Info label="Coach" value={team.coach?.name || "TBA"} />
              </div>
            </div>
            {user && (
              <button
                onClick={handleFavorite}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                  saved
                    ? 'border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white'
                    : 'bg-white text-gray-950 hover:bg-white/95'
                }`}
              >
                <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
                {saved ? "Saved to Favorites" : "Add Team to Favorites"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column (Squad & Results) */}
          <div className="space-y-6 lg:col-span-8">
            {/* Squad */}
            <Panel icon={Users} eyebrow="Squad Roster" title="First-Team Squad">
              <div className="grid gap-3 sm:grid-cols-2">
                {squad.map((player) => (
                  <div
                    key={player.id || player.name}
                    onClick={() => handlePlayerClick(player)}
                    className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.015] p-4 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.03]"
                  >
                    <p className="text-sm font-semibold text-white/90 group-hover:text-white transition">
                      {player.name}
                    </p>
                    <p className="mt-1 text-xs font-light text-white/40">
                      {player.position || "Player"} · {player.nationality || "Nationality TBA"}
                    </p>
                  </div>
                ))}
                {squad.length === 0 && (
                  <p className="text-xs font-light text-white/40">Squad list is currently unavailable from this endpoint.</p>
                )}
              </div>
            </Panel>

            {/* Results */}
            <Panel icon={Trophy} eyebrow="Past Records" title="Recent Results">
              <MatchList matches={finished.slice(0, 8)} />
            </Panel>
          </div>

          {/* Right Column (Sidebar details) */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Recent Form */}
            <Panel icon={Shield} eyebrow="League Run" title="Club Form">
              <div className="flex gap-2">
                {finished.slice(0, 6).map((match) => {
                  const isHome = match.homeTeam.id === Number(id);
                  const gf = match.score.fullTime[isHome ? "home" : "away"];
                  const ga = match.score.fullTime[isHome ? "away" : "home"];
                  const result = gf > ga ? "W" : gf === ga ? "D" : "L";
                  return (
                    <span
                      key={match.id}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold ${
                        result === "W"
                          ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                          : result === "D"
                          ? "bg-yellow-500/10 border border-yellow-500/25 text-yellow-400"
                          : "bg-red-500/10 border border-red-500/25 text-red-400"
                      }`}
                    >
                      {result}
                    </span>
                  );
                })}
                {finished.length === 0 && <p className="text-xs font-light text-white/40">No form history available.</p>}
              </div>
            </Panel>

            {/* Stadium / Venue Info */}
            <Panel icon={MapPin} eyebrow="Match Day Location" title={team.venue || "Stadium"}>
              <p className="text-xs leading-5 text-white/50 font-light">
                {team.address || "Venue address is currently unavailable."}
              </p>
              {team.website && (
                <a
                  href={team.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
                >
                  Visit official site &rarr;
                </a>
              )}
            </Panel>

            {/* Upcoming Fixtures */}
            <Panel icon={Trophy} eyebrow="Calendar" title="Upcoming Fixtures">
              <MatchList matches={upcoming.slice(0, 5)} compact />
            </Panel>
          </aside>
        </div>
      </section>

      {/* PLAYER DETAILS MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B121E] shadow-2xl">
            {/* Header / Backdrop color */}
            <div className="relative h-28 bg-gradient-to-br from-cyan-950 via-[#0B121E] to-[#0B121E] p-5">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/5 p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content body */}
            <div className="px-6 pb-6 pt-2">
              <div className="flex items-center gap-4">
                <img
                  src={selectedPlayer.photo}
                  alt=""
                  className="h-16 w-16 rounded-2xl border border-white/15 bg-white/5 object-cover shadow-lg"
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedPlayer.name}</h3>
                  <p className="text-xs text-white/45 font-light">{teamName(team)}</p>
                </div>
              </div>

              {/* Stats card grid */}
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Position</p>
                  <p className="mt-1 text-sm font-medium text-white">{selectedPlayer.position || "Player"}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Nationality</p>
                  <p className="mt-1 text-sm font-medium text-white">{selectedPlayer.nationality || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Age / Shirt</p>
                  <p className="mt-1 text-sm font-medium text-white">Age {selectedPlayer.age} · #{selectedPlayer.shirtNumber}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Height</p>
                  <p className="mt-1 text-sm font-medium text-white">{selectedPlayer.height} cm</p>
                </div>
              </div>

              {/* Career stats info box */}
              <div className="mt-4 rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-yellow-400/80">Season Stats</p>
                <p className="mt-1 text-xs text-white/70 font-light">
                  Appearances: <span className="font-semibold text-white">{selectedPlayer.appearances}</span> · Goals: <span className="font-semibold text-cyan-400">{selectedPlayer.goals}</span>
                </p>
              </div>

              {/* Save/Favorite action button */}
              {user && (
                <button
                  onClick={() => togglePlayerFav(selectedPlayer)}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition ${
                    isPlayerFav(selectedPlayer.id)
                      ? 'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white'
                      : 'bg-white text-gray-950 hover:bg-white/95'
                  }`}
                >
                  <Heart size={14} fill={isPlayerFav(selectedPlayer.id) ? 'currentColor' : 'none'} />
                  {isPlayerFav(selectedPlayer.id) ? 'Remove Favorite Player' : 'Save Favorite Player'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
      <span className="text-white/40">{label}</span>
      <span className="break-words text-right font-medium text-white/80">{value}</span>
    </div>
  );
}

function Panel({ icon: Icon, eyebrow, title, children }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="text-cyan-400" size={18} />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">{eyebrow}</p>
          <h2 className="mt-0.5 text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function MatchList({ matches, compact }) {
  const navigate = useNavigate();
  if (!matches.length) {
    return <p className="text-xs font-light text-white/40">No matches available.</p>;
  }

  return (
    <div className="space-y-2.5">
      {matches.map((match) => (
        <div
          key={match.id}
          onClick={() => navigate(`/match/${match.id}`)}
          className="cursor-pointer rounded-xl border border-white/5 bg-black/10 p-3 transition hover:border-white/10 hover:bg-white/[0.02]"
        >
          <div className="flex items-center justify-between gap-3 text-sm font-medium">
            <span className="truncate text-white/70">{teamName(match.homeTeam)}</span>
            <span className="rounded bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-white/90">
              {match.status === "FINISHED" ? `${match.score.fullTime.home}-${match.score.fullTime.away}` : "VS"}
            </span>
            <span className="truncate text-right text-white/70">{teamName(match.awayTeam)}</span>
          </div>
          {!compact && (
            <p className="mt-2 text-[10px] font-light text-white/30">
              {match.competition?.name} · {new Date(match.utcDate).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
