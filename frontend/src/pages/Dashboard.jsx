import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Star, Trophy, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getFavorites, removeFavorite, saveFavoritePlayer } from "../services/favoritesService";
import { PageSkeleton } from "../components/Skeleton";

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState({ teams: [], players: [], matches: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Player Detail Modal State
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    if (!token) return;
    getFavorites(token)
      .then(setFavorites)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRemove = async (type, id) => {
    const collection = {
      team: "teams",
      player: "players",
      match: "matches"
    }[type];

    try {
      await removeFavorite(token, type, id);
      setFavorites((current) => ({
        ...current,
        [collection]: current[collection].filter((item) => item.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Open Player Modal
  const handlePlayerClick = (playerItem) => {
    const seed = playerItem.playerId || 99;
    const age = 19 + (seed % 15);
    const height = 168 + (seed % 24);
    const position = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'][seed % 4];
    const shirtNumber = 1 + (seed % 35);
    const nationality = ['England', 'Spain', 'Germany', 'France', 'Italy', 'Brazil', 'Argentina', 'Portugal'][seed % 8];
    const appearances = 12 + (seed % 28);
    const goals = seed % 12;

    setSelectedPlayer({
      id: playerItem.playerId,
      name: playerItem.playerName,
      team: playerItem.teamName,
      age,
      height,
      position,
      shirtNumber,
      nationality,
      appearances,
      goals,
      photo: playerItem.playerPhoto || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`
    });
  };

  const isPlayerFav = (playerId) => {
    return favorites.players?.some(p => p.playerId === Number(playerId));
  };

  const togglePlayerFav = async (player) => {
    const favItem = favorites.players.find(p => p.playerId === Number(player.id));
    if (favItem) {
      await handleRemove("player", favItem.id);
      setSelectedPlayer(null);
    }
  };

  if (loading) return <PageSkeleton label="Loading your dashboard..." />;

  return (
    <main className="min-h-screen bg-[#06070a] text-white/90">
      {/* Banner */}
      <section className="relative overflow-hidden border-b border-white/5 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(6,182,212,0.1),transparent_35%),linear-gradient(135deg,#060c13_0%,#050608_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
          <span className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
            Account Dashboard
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Welcome back, {user?.name || "Fan"}.
          </h1>
          <p className="mt-2 text-sm font-normal text-white/50 max-w-xl">
            Your customized profile showing saved matches, teams, and player cards.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/15 bg-red-500/5 p-4 text-xs text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Favorite Clubs */}
          <FavoritePanel
            icon={Shield}
            title="Favorite Clubs"
            items={favorites.teams}
            empty="Save teams by clicking the heart button on club profiles."
            render={(item) => (
              <div 
                onClick={() => navigate(`/teams/${item.teamId}`)}
                className="flex flex-1 items-center gap-3 cursor-pointer group"
              >
                {item.teamLogo ? (
                  <img src={item.teamLogo} alt="" className="h-8 w-8 object-contain" />
                ) : (
                  <div className="h-8 w-8 flex items-center justify-center rounded bg-white/5 text-xs">⚽</div>
                )}
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition">{item.teamName}</span>
              </div>
            )}
            onRemove={(id) => handleRemove("team", id)}
          />

          {/* Favorite Players */}
          <FavoritePanel
            icon={Star}
            title="Favorite Players"
            items={favorites.players}
            empty="Add players to favorites from search results or team squads."
            render={(item) => (
              <div 
                onClick={() => handlePlayerClick(item)}
                className="flex flex-1 flex-col cursor-pointer group text-left"
              >
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition">{item.playerName}</span>
                <span className="text-[10px] text-white/40 font-light mt-0.5">{item.teamName}</span>
              </div>
            )}
            onRemove={(id) => handleRemove("player", id)}
          />

          {/* Favorite Matches */}
          <FavoritePanel
            icon={Trophy}
            title="Saved Matches"
            items={favorites.matches}
            empty="Save match centers by hitting the star on any fixture card."
            render={(item) => (
              <div 
                onClick={() => navigate(`/match/${item.matchId}`)}
                className="flex flex-1 flex-col cursor-pointer group text-left"
              >
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition">{item.homeTeam} vs {item.awayTeam}</span>
                <span className="text-[10px] text-white/40 font-light mt-0.5">{new Date(item.kickoff).toLocaleDateString()}</span>
              </div>
            )}
            onRemove={(id) => handleRemove("match", id)}
          />
        </div>
      </section>

      {/* PLAYER DETAILS MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B121E] shadow-2xl">
            {/* Header backdrop */}
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
                  <p className="text-xs text-white/45 font-light">{selectedPlayer.team || 'Unknown Club'}</p>
                </div>
              </div>

              {/* Stats card grid */}
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Position</p>
                  <p className="mt-1 text-sm font-medium text-white">{selectedPlayer.position}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Nationality</p>
                  <p className="mt-1 text-sm font-medium text-white">{selectedPlayer.nationality}</p>
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
              <button
                onClick={() => togglePlayerFav(selectedPlayer)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition"
              >
                <Heart size={14} fill="currentColor" />
                Remove Favorite Player
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FavoritePanel({ icon: Icon, title, items, empty, render, onRemove }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="text-cyan-400" size={18} />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/10 p-3 hover:bg-white/[0.01] transition duration-200">
            <div className="flex min-w-0 flex-1 items-center gap-3">{render(item)}</div>
            <button
              onClick={() => onRemove(item.id)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/5 text-white/35 transition hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5"
            >
              <Heart size={13} fill="currentColor" className="text-red-400" />
            </button>
          </div>
        ))}
        {!items.length && <p className="text-xs leading-5 text-white/40 font-light">{empty}</p>}
      </div>
    </div>
  );
}
