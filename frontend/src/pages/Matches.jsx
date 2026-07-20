import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, Trophy, Star, Clock, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { saveFavoriteMatch, getFavorites, removeFavorite } from '../services/favoritesService';

const COMPETITIONS = [
  { code: 'PL', name: 'Premier League', type: 'league' },
  { code: 'CL', name: 'Champions League', type: 'league' },
  { code: 'PD', name: 'La Liga', type: 'league' },
  { code: 'BL1', name: 'Bundesliga', type: 'league' },
  { code: 'SA', name: 'Serie A', type: 'league' },
  { code: 'FL1', name: 'Ligue 1', type: 'league' },
  { code: 'WC', name: 'World Cup', type: 'wc' }
];

export default function Matches() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedComp, setSelectedComp] = useState('PL');
  const [matches, setMatches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'upcoming', 'finished'

  // Fetch Favorites
  const fetchFavorites = () => {
    if (!token) return;
    getFavorites(token)
      .then(res => setFavorites(res.matches || []))
      .catch(err => console.log('Error loading favorites:', err));
  };

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  // Fetch Matches
  useEffect(() => {
    setLoading(true);
    setError('');
    const comp = COMPETITIONS.find(c => c.code === selectedComp);
    
    let request;
    if (comp.type === 'wc') {
      request = axios.get(`${API_BASE_URL}/worldcup/matches`).then(res => res.data);
    } else {
      request = axios.get(`${API_BASE_URL}/competitions/${selectedComp}/summary`).then(res => res.data?.matches || []);
    }

    request
      .then(data => {
        // Standardize matches
        const standardized = data.map(m => {
          if (comp.type === 'wc') {
            return {
              id: m.id,
              isWc: true,
              homeTeam: {
                name: m.home_team_name_en,
                crest: m.home_team?.flag || ''
              },
              awayTeam: {
                name: m.away_team_name_en,
                crest: m.away_team?.flag || ''
              },
              score: {
                home: m.home_score !== null ? Number(m.home_score) : null,
                away: m.away_score !== null ? Number(m.away_score) : null
              },
              status: m.finished === 'TRUE' ? 'FINISHED' : 'SCHEDULED',
              date: m.local_date,
              stage: `Group ${m.group || '--'}`,
              matchday: m.matchday
            };
          } else {
            return {
              id: m.id,
              isWc: false,
              homeTeam: {
                name: m.homeTeam?.shortName || m.homeTeam?.name || 'TBC',
                crest: m.homeTeam?.crest || ''
              },
              awayTeam: {
                name: m.awayTeam?.shortName || m.awayTeam?.name || 'TBC',
                crest: m.awayTeam?.crest || ''
              },
              score: {
                home: m.score?.fullTime?.home ?? null,
                away: m.score?.fullTime?.away ?? null
              },
              status: m.status,
              date: m.utcDate,
              stage: m.stage === 'GROUP_STAGE' ? `Matchday ${m.matchday}` : m.stage?.replace(/_/g, ' '),
              matchday: m.matchday
            };
          }
        });
        
        // Sort matches by date
        standardized.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMatches(standardized);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load matches for this competition. The API limit may be reached.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedComp]);

  // Filter Matches
  const filteredMatches = useMemo(() => {
    if (filterTab === 'finished') {
      return matches.filter(m => m.status === 'FINISHED');
    }
    if (filterTab === 'upcoming') {
      return matches.filter(m => m.status !== 'FINISHED');
    }
    return matches;
  }, [matches, filterTab]);

  // Check if a match is favorited
  const isMatchFav = (matchId) => {
    return favorites.some(f => f.matchId === Number(matchId));
  };

  // Toggle Favorite
  const toggleFavorite = async (e, match) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    const isFav = isMatchFav(match.id);
    try {
      if (isFav) {
        const favId = favorites.find(f => f.matchId === Number(match.id))?.id;
        if (favId) {
          await removeFavorite(token, 'match', favId);
          setFavorites(prev => prev.filter(f => f.id !== favId));
        }
      } else {
        const saved = await saveFavoriteMatch(token, match);
        setFavorites(prev => [saved, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format Date cleanly
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format Time cleanly
  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="min-h-screen bg-[#06070a] text-white/90">
      {/* Banner */}
      <section className="relative overflow-hidden border-b border-white/5 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(6,182,212,0.1),transparent_35%),linear-gradient(135deg,#060c13_0%,#050608_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
          <span className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
            Fixtures & Results
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Match Center
          </h1>
          <p className="mt-2 text-sm font-normal text-white/50 max-w-xl">
            Check completed results and upcoming fixtures from major world-class competitions.
          </p>
        </div>
      </section>

      {/* Selectors */}
      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {/* Horizontal scroll pills */}
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-4">
          {COMPETITIONS.map((c) => {
            const isSelected = selectedComp === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedComp(c.code)}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium transition-all duration-300 ${
                  isSelected
                    ? 'border-white text-gray-950 bg-white shadow-lg'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                <Trophy size={13} />
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Tab Filters (All / Upcoming / Finished) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex gap-2.5">
            {[
              { key: 'all', label: 'All Matches' },
              { key: 'upcoming', label: 'Fixtures' },
              { key: 'finished', label: 'Results' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  filterTab === tab.key
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'text-white/45 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-white/40">
            {filteredMatches.length} Matches Found
          </div>
        </div>

        {/* Matches Feed */}
        {loading ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] h-28" />
            <div className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] h-28" />
            <div className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] h-28" />
            <div className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] h-28" />
          </div>
        ) : error ? (
          <div className="mt-12 text-center rounded-2xl border border-white/5 bg-white/[0.02] p-8 max-w-md mx-auto">
            <AlertCircle className="mx-auto text-red-400 mb-3" size={32} />
            <h3 className="text-sm font-semibold text-white">Data Fetch Interrupted</h3>
            <p className="mt-1 text-xs text-white/40 leading-5">{error}</p>
            <button
              onClick={() => setSelectedComp(selectedComp)}
              className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="mt-16 text-center text-white/40 py-12">
            <CalendarDays className="mx-auto mb-3" size={36} />
            <p className="text-sm font-medium">No matches available in this filter</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {filteredMatches.map(match => {
              const isFav = isMatchFav(match.id);
              return (
                <div
                  key={match.id}
                  onClick={() => navigate(`/match/${match.id}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]"
                >
                  {/* Top info row */}
                  <div className="flex items-center justify-between text-[11px] font-medium text-white/40 mb-3.5">
                    <span className="flex items-center gap-1.5 font-light">
                      <Clock size={11} />
                      {formatDate(match.date)} · {formatTime(match.date)}
                    </span>
                    <span className="rounded-md border border-white/5 px-2 py-0.5 text-[10px] text-white/50 font-normal">
                      {match.stage}
                    </span>
                  </div>

                  {/* Teams row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-3 flex-1 min-w-0">
                      {/* Home Team */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-6 w-6 flex items-center justify-center rounded bg-white/[0.04] p-0.5">
                          {match.homeTeam.crest ? (
                            <img src={match.homeTeam.crest} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <div className="text-[10px]">⚽</div>
                          )}
                        </div>
                        <span className="truncate text-sm font-medium text-white/80 group-hover:text-white transition">
                          {match.homeTeam.name}
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-6 w-6 flex items-center justify-center rounded bg-white/[0.04] p-0.5">
                          {match.awayTeam.crest ? (
                            <img src={match.awayTeam.crest} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <div className="text-[10px]">⚽</div>
                          )}
                        </div>
                        <span className="truncate text-sm font-medium text-white/80 group-hover:text-white transition">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    {/* Scores or VS */}
                    <div className="flex flex-col items-center justify-center min-w-[50px] border-l border-white/5 pl-4 py-1 text-right">
                      {match.status === 'FINISHED' ? (
                        <div className="flex flex-col gap-2 font-medium text-sm text-cyan-400">
                          <span>{match.score.home}</span>
                          <span>{match.score.away}</span>
                        </div>
                      ) : match.status === 'IN_PLAY' || match.status === 'PAUSED' ? (
                        <div className="flex flex-col gap-2 font-medium text-sm text-emerald-400">
                          <span>{match.score.home}</span>
                          <span>{match.score.away}</span>
                          <span className="text-[9px] font-bold text-red-500 animate-pulse mt-0.5">LIVE</span>
                        </div>
                      ) : (
                        <div className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                          VS
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Favorites button */}
                  {user && (
                    <button
                      onClick={(e) => toggleFavorite(e, match)}
                      className={`absolute right-3 top-3 rounded-lg border p-1.5 transition-all duration-300 ${
                        isFav
                          ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
                          : 'border-white/5 bg-white/5 text-white/35 hover:text-white/85'
                      }`}
                    >
                      <Star size={12} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
