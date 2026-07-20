import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search as SearchIcon, Shield, Trophy, Users, Star, ArrowRight, Heart, X, Sparkles } from 'lucide-react';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { saveFavoritePlayer, getFavorites, removeFavorite } from '../services/favoritesService';

export default function Search() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({ players: [] });

  // Player Detail Modal State
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Fetch Favorites
  const fetchFavorites = () => {
    if (!token) return;
    getFavorites(token)
      .then(res => setFavorites(res))
      .catch(err => console.log('Error fetching favorites:', err));
  };

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError('Search query failed or hit rate limits. Try another word.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: check if player is favorited
  const isPlayerFav = (playerId) => {
    return favorites.players?.some(p => p.playerId === Number(playerId));
  };

  // Toggle player favorite
  const togglePlayerFav = async (player) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isFav = isPlayerFav(player.id);
    try {
      if (isFav) {
        const favId = favorites.players.find(p => p.playerId === Number(player.id))?.id;
        if (favId) {
          await removeFavorite(token, 'player', favId);
          setFavorites(prev => ({
            ...prev,
            players: prev.players.filter(p => p.id !== favId)
          }));
        }
      } else {
        const payloadPlayer = {
          id: player.id,
          name: player.name,
          photo: player.photo || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`
        };
        const saved = await saveFavoritePlayer(token, payloadPlayer, player.team || 'Unknown Club');
        setFavorites(prev => ({
          ...prev,
          players: [saved, ...prev.players]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Open Player Details
  const openPlayerDetails = (player) => {
    // Generate mocked F1-app premium details based on id seed
    const seed = player.id || 100;
    const age = 19 + (seed % 15);
    const height = 168 + (seed % 24);
    const position = player.position || ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'][seed % 4];
    const shirtNumber = 1 + (seed % 35);
    const nationality = ['England', 'Spain', 'Germany', 'France', 'Italy', 'Brazil', 'Argentina', 'Portugal', 'Netherlands'][seed % 9];
    const appearances = 12 + (seed % 28);
    const goals = player.goals || (seed % 14);

    setSelectedPlayer({
      ...player,
      age,
      height,
      position,
      shirtNumber,
      nationality,
      appearances,
      goals,
      photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80`
    });
  };

  return (
    <main className="min-h-screen bg-[#06070a] text-white/90">
      {/* Banner */}
      <section className="relative overflow-hidden border-b border-white/5 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(6,182,212,0.1),transparent_35%),linear-gradient(135deg,#060c13_0%,#050608_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
          <span className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
            Search Central
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Find Teams & Players
          </h1>
          <p className="mt-2 text-sm font-normal text-white/50 max-w-xl">
            Look up your favorite clubs, check competition hubs, or view player profiles.
          </p>
        </div>
      </section>

      {/* Input */}
      <section className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="group flex h-12 flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.02] px-4 transition-all duration-300 focus-within:border-white/25 hover:border-white/20">
            <SearchIcon className="mr-3 text-white/30 group-focus-within:text-white/60" size={18} />
            <input
              type="text"
              placeholder="Search Arsenal, Chelsea, Mbappe, Bellingham..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none font-normal"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-white px-6 text-sm font-medium text-gray-950 transition hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="mt-8 space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-20 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                <div className="h-20 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        ) : results ? (
          <div className="mt-8 space-y-8">
            {/* COMPETITIONS */}
            {results.competitions?.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3.5 flex items-center gap-2">
                  <Trophy size={13} /> Competitions
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.competitions.map((c) => (
                    <div
                      key={c.code}
                      onClick={() => navigate(`/competitions/${c.code}`)}
                      className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.04]"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition">
                          {c.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-white/40 font-light">{c.area?.name || 'International'}</p>
                      </div>
                      <ArrowRight size={14} className="text-white/30 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEAMS */}
            {results.teams?.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3.5 flex items-center gap-2">
                  <Shield size={13} /> Teams
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.teams.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/teams/${t.id}`)}
                      className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.04] p-1.5">
                          {t.crest ? (
                            <img src={t.crest} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Shield size={16} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition">
                            {t.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-white/40 font-light uppercase tracking-wider">{t.league}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-white/30 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PLAYERS */}
            {results.players?.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3.5 flex items-center gap-2">
                  <Users size={13} /> Players
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.players.map((p) => {
                    const isFav = isPlayerFav(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => openPlayerDetails(p)}
                        className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.04]"
                      >
                        <div>
                          <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition">
                            {p.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-white/40 font-light">{p.team} · Goals: {p.goals || 0}</p>
                        </div>
                        {user && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlayerFav(p);
                            }}
                            className={`rounded-lg p-1.5 transition ${
                              isFav ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20' : 'text-white/30 hover:text-white/80'
                            }`}
                          >
                            <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NEWS */}
            {results.news?.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3.5 flex items-center gap-2">
                  <Sparkles size={13} /> Breaking News Articles
                </h2>
                <div className="grid gap-4">
                  {results.news.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group block rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
                    >
                      <span className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">BBC News</span>
                      <h3 className="mt-1 text-sm font-medium text-white/90 group-hover:text-white transition line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-white/50 leading-relaxed font-light line-clamp-2">
                        {item.content || item.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* No matches at all */}
            {!results.competitions?.length && !results.teams?.length && !results.players?.length && !results.news?.length && (
              <div className="text-center py-12 text-white/40">
                <Users size={32} className="mx-auto mb-2" />
                <p className="text-sm font-medium">No results found for "{query}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-16 text-center text-white/30 py-8">
            <SearchIcon className="mx-auto mb-3" size={32} />
            <p className="text-sm font-light">Type something and hit enter to start searching</p>
          </div>
        )}
      </section>

      {/* PLAYER DETAILS MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B121E] shadow-2xl">
            {/* Header / Backdrop Image */}
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
                <p className="text-[10px] uppercase tracking-wider text-yellow-400/80">Tournament Stats</p>
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
