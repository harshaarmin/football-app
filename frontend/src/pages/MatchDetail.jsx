import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Star, Clock, MapPin, Sparkles, Shield, User, ArrowLeft, Calendar } from 'lucide-react';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { saveFavoriteMatch, getFavorites, removeFavorite } from '../services/favoritesService';

const parseScorers = (str) => {
  if (!str || str === 'null') return [];
  return str.replace(/[{}"]/g, '').split(',').map(s => {
    const raw = s.trim();
    const minute = raw.match(/\d+['+]?/)?.[0] || 'Goal';
    const name = raw.replace(/\s\d+['+]?.*/, '').trim();
    return { raw, name: name || raw, minute };
  }).filter(s => s.name);
};

const pct = (value, total) => total ? Math.round((value / total) * 100) : 50;

const makeSeed = (match) =>
  String(match.id || `${match.homeTeam?.name || ''}${match.awayTeam?.name || ''}`)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

const makeDemoStats = (match, homeGoals, awayGoals) => {
  const seed = makeSeed(match);
  const homeEdge = Math.max(homeGoals - awayGoals, 0);
  const awayEdge = Math.max(awayGoals - homeGoals, 0);
  const homePossession = Math.min(68, Math.max(39, 50 + homeEdge * 6 - awayEdge * 5 + (seed % 9) - 4));
  const awayPossession = 100 - homePossession;

  return [
    { label: 'Shots', home: 9 + homeGoals * 3 + (seed % 4), away: 8 + awayGoals * 3 + (seed % 3) },
    { label: 'Shots on target', home: Math.max(homeGoals, 3 + homeGoals + (seed % 3)), away: Math.max(awayGoals, 2 + awayGoals + (seed % 2)) },
    { label: 'Possession', home: `${homePossession}%`, away: `${awayPossession}%`, homeRaw: homePossession, awayRaw: awayPossession },
    { label: 'Passes', home: 390 + homePossession * 4 + (seed % 35), away: 390 + awayPossession * 4 + (seed % 28) },
    { label: 'Pass accuracy', home: `${80 + (seed % 10)}%`, away: `${78 + (seed % 9)}%`, homeRaw: 80 + (seed % 10), awayRaw: 78 + (seed % 9) },
    { label: 'Corners', home: 3 + (seed % 6), away: 2 + ((seed + 2) % 5) },
    { label: 'Fouls', home: 8 + (seed % 8), away: 9 + ((seed + 4) % 8) },
    { label: 'Offsides', home: seed % 4, away: (seed + 1) % 4 }
  ];
};

const makeLineup = (teamName, scorers, startNumber) => {
  const roles = ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'CM', 'CM', 'RW', 'ST', 'LW'];
  return roles.map((role, index) => ({
    role,
    number: startNumber + index,
    name: scorers[index]?.name || `${teamName.split(' ')[0]} ${index + 1}`,
    x: [50, 18, 38, 62, 82, 50, 34, 66, 20, 50, 80][index],
    y: [10, 27, 29, 29, 27, 46, 58, 58, 78, 84, 78][index]
  }));
};

function TeamMiniCard({ teamName, flag, isWc }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex min-w-0 items-center gap-3">
        {flag ? (
          <img src={flag} alt="" className="h-9 w-12 rounded-lg object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded bg-white/5 text-sm">⚽</div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-medium text-white">{teamName}</h3>
          <p className="text-[10px] uppercase tracking-wider text-white/40">{isWc ? 'National Team' : 'Club Profile'}</p>
        </div>
      </div>
    </div>
  );
}

function Pitch({ home, away }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#1e3427] p-4">
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-white/40">
        <span>Formation: 4-3-3</span>
        <span>Lineup Preview</span>
        <span>Formation: 4-3-3</span>
      </div>

      <div className="relative aspect-[12/10] overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_50%,transparent_50%)]">
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-0 top-[25%] h-[50%] w-[15%] border-y border-r border-white/10" />
        <div className="absolute right-0 top-[25%] h-[50%] w-[15%] border-y border-l border-white/10" />

        {home.map(player => (
          <div
            key={`home-${player.role}-${player.number}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
          >
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-semibold text-gray-950">{player.number}</div>
            <p className="mt-1 max-w-[50px] truncate text-[9px] font-normal text-white">{player.name}</p>
          </div>
        ))}

        {away.map(player => (
          <div
            key={`away-${player.role}-${player.number}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${100 - player.x}%`, top: `${100 - player.y}%` }}
          >
            <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-semibold text-gray-950">{player.number}</div>
            <p className="mt-1 max-w-[50px] truncate text-[9px] font-normal text-white">{player.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load Match Data
  useEffect(() => {
    setLoading(true);
    setMatch(null);

    // 1. Try generic match details route first
    axios.get(`${API_BASE_URL}/match/${id}`)
      .then(res => {
        const raw = res.data;
        setMatch({
          id: raw.id,
          isWc: false,
          homeTeam: {
            name: raw.homeTeam?.name || 'TBC',
            shortName: raw.homeTeam?.shortName || raw.homeTeam?.name || 'TBC',
            crest: raw.homeTeam?.crest || ''
          },
          awayTeam: {
            name: raw.awayTeam?.name || 'TBC',
            shortName: raw.awayTeam?.shortName || raw.awayTeam?.name || 'TBC',
            crest: raw.awayTeam?.crest || ''
          },
          score: {
            home: raw.score?.fullTime?.home ?? null,
            away: raw.score?.fullTime?.away ?? null
          },
          status: raw.status,
          date: raw.utcDate,
          venue: raw.venue || 'Stadium TBD',
          stage: raw.stage === 'GROUP_STAGE' ? `Matchday ${raw.matchday}` : raw.stage?.replace(/_/g, ' '),
          competition: raw.competition?.name || 'League Match',
          homeScorers: [],
          awayScorers: []
        });
        setLoading(false);
      })
      .catch(() => {
        // 2. Fallback to World Cup matches list
        axios.get(`${API_BASE_URL}/worldcup/matches`)
          .then(res => {
            const wcMatch = res.data.find(m => String(m.id) === String(id));
            if (wcMatch) {
              setMatch({
                id: wcMatch.id,
                isWc: true,
                homeTeam: {
                  name: wcMatch.home_team_name_en,
                  shortName: wcMatch.home_team_name_en,
                  crest: wcMatch.home_team?.flag || ''
                },
                awayTeam: {
                  name: wcMatch.away_team_name_en,
                  shortName: wcMatch.away_team_name_en,
                  crest: wcMatch.away_team?.flag || ''
                },
                score: {
                  home: wcMatch.home_score !== null ? Number(wcMatch.home_score) : null,
                  away: wcMatch.away_score !== null ? Number(wcMatch.away_score) : null
                },
                status: wcMatch.finished === 'TRUE' ? 'FINISHED' : 'SCHEDULED',
                date: wcMatch.local_date,
                venue: wcMatch.venue || 'Stadium TBD',
                stage: `Group ${wcMatch.group || '--'}`,
                competition: 'FIFA World Cup 2026',
                homeScorers: parseScorers(wcMatch.home_scorers),
                awayScorers: parseScorers(wcMatch.away_scorers)
              });
            }
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      });
  }, [id]);

  // Load Favorites
  useEffect(() => {
    if (!token) return;
    getFavorites(token)
      .then(res => {
        setFavorites(res.matches || []);
        setIsFav(res.matches?.some(f => f.matchId === Number(id)));
      })
      .catch(err => console.log('Error loading favorites:', err));
  }, [id, token]);

  // Toggle Favorite Match
  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isFav) {
        const favId = favorites.find(f => f.matchId === Number(id))?.id;
        if (favId) {
          await removeFavorite(token, 'match', favId);
          setIsFav(false);
          setFavorites(prev => prev.filter(f => f.id !== favId));
        }
      } else {
        const saved = await saveFavoriteMatch(token, match);
        setIsFav(true);
        setFavorites(prev => [saved, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/5 bg-white/[0.02] p-7 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 animate-pulse">Loading Match Centre</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4 text-white">
        <div className="max-w-lg rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Match Not Found</p>
          <h1 className="mt-3 text-2xl font-medium">This match record could not be loaded.</h1>
          <button onClick={() => navigate('/matches')} className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition">
            Back to Matches
          </button>
        </div>
      </main>
    );
  }

  const isFinished = match.status === 'FINISHED';
  const homeGoals = match.score.home ?? 0;
  const awayGoals = match.score.away ?? 0;
  const totalGoals = homeGoals + awayGoals;
  const homeGoalPct = pct(homeGoals, totalGoals);
  const awayGoalPct = 100 - homeGoalPct;

  const demoStats = makeDemoStats(match, homeGoals, awayGoals);
  const homeLineup = makeLineup(match.homeTeam.name, match.homeScorers, 1);
  const awayLineup = makeLineup(match.awayTeam.name, match.awayScorers, 12);

  const goalsList = [
    ...match.homeScorers.map(goal => ({ ...goal, team: match.homeTeam.name, side: 'home' })),
    ...match.awayScorers.map(goal => ({ ...goal, team: match.awayTeam.name, side: 'away' }))
  ];

  const searchUrl = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return (
    <main className="min-h-screen bg-[#06070a] text-white/90">
      {/* Top Header Card */}
      <section className="relative overflow-hidden border-b border-white/5 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(6,182,212,0.14),transparent_35%),linear-gradient(135deg,#060c13_0%,#050608_100%)]" />
        <div className="relative mx-auto max-w-5xl px-4 lg:px-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <button onClick={() => navigate('/matches')} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 hover:text-white transition">
              <ArrowLeft size={13} /> Matches
            </button>
            {user && (
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                  isFav
                    ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
                {isFav ? 'Match Saved' : 'Save Match'}
              </button>
            )}
          </div>

          <div className="rounded-3xl border border-white/5 bg-black/30 p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-white/40">
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 font-semibold text-cyan-400">
                {match.competition}
              </span>
              <span className="font-light">
                {match.stage} · {new Date(match.date).toLocaleDateString()}
              </span>
            </div>

            {/* Scoreboard display */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
              {/* Home Team */}
              <div className="flex flex-col items-center text-center min-w-0">
                {match.homeTeam.crest ? (
                  <img src={match.homeTeam.crest} alt="" className="mb-3 h-12 w-12 object-contain sm:h-16 sm:w-16" />
                ) : (
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl">⚽</div>
                )}
                <h1 className="truncate text-sm font-semibold text-white/90 sm:text-lg">{match.homeTeam.name}</h1>
              </div>

              {/* Score Box */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-center sm:px-8 sm:py-4">
                {isFinished || match.status === 'IN_PLAY' || match.status === 'PAUSED' ? (
                  <div className="text-2xl font-bold sm:text-4xl text-white">
                    {homeGoals}<span className="mx-2 text-white/30">-</span>{awayGoals}
                  </div>
                ) : (
                  <div className="text-lg font-bold sm:text-2xl text-white/40">VS</div>
                )}
                {match.status === 'IN_PLAY' && (
                  <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-red-500 animate-pulse">LIVE</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center text-center min-w-0">
                {match.awayTeam.crest ? (
                  <img src={match.awayTeam.crest} alt="" className="mb-3 h-12 w-12 object-contain sm:h-16 sm:w-16" />
                ) : (
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl">⚽</div>
                )}
                <h1 className="truncate text-sm font-semibold text-white/90 sm:text-lg">{match.awayTeam.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="sticky top-[64px] z-30 border-b border-white/5 bg-[#06070a]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 lg:px-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'timeline', label: 'Timeline' },
            { key: 'lineups', label: 'Lineups' },
            { key: 'stats', label: 'Stats' },
            { key: 'highlights', label: 'Highlights' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`min-w-max border-b-2 px-5 py-4 text-xs font-semibold tracking-wide transition ${
                activeTab === tab.key
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-white/45 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <section className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-12">
            <div className="space-y-6 md:col-span-8">
              <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5 shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/45">Match Summary</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {isFinished ? 'Match Completed' : 'Match Scheduled'}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-white/50 font-light">
                  {isFinished
                    ? `${match.homeTeam.name} and ${match.awayTeam.name} produced a scoreline of ${homeGoals}-${awayGoals} in the ${match.competition}.`
                    : `${match.homeTeam.name} faces ${match.awayTeam.name} in the ${match.competition}. Kickoff scheduled at ${match.venue}.`}
                </p>
              </div>

              {isFinished && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5 shadow-sm">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/45">Match Stats Summary</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Score Balance</h2>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs font-medium text-white/50">
                      <span>{match.homeTeam.name} ({homeGoalPct}%)</span>
                      <span>{match.awayTeam.name} ({awayGoalPct}%)</span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
                      <div className="bg-yellow-400" style={{ width: `${homeGoalPct}%` }} />
                      <div className="bg-cyan-400" style={{ width: `${awayGoalPct}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6 md:col-span-4">
              <TeamMiniCard teamName={match.homeTeam.name} flag={match.homeTeam.crest} isWc={match.isWc} />
              <TeamMiniCard teamName={match.awayTeam.name} flag={match.awayTeam.crest} isWc={match.isWc} />
              <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-4 text-center">
                <MapPin size={16} className="mx-auto text-cyan-400 mb-2" />
                <p className="text-[10px] uppercase tracking-wider text-white/40">Venue</p>
                <p className="mt-1 text-xs font-medium text-white/80">{match.venue}</p>
              </div>
            </aside>
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/45">Timeline Events</p>
            <h2 className="mt-1 text-xl font-semibold text-white mb-6">Key Events</h2>
            <div className="space-y-3">
              {goalsList.length > 0 ? (
                goalsList.map((goal, index) => (
                  <div key={index} className={`flex items-center gap-3 ${goal.side === 'away' ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-10 text-xs font-bold text-cyan-400">{goal.minute}</div>
                    <div className="flex-1 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
                      <p className="text-sm font-semibold text-white">{goal.name}</p>
                      <p className="mt-0.5 text-[10px] text-white/40">{goal.team}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/45 font-light py-4 text-center">No goal details available for this match.</p>
              )}
            </div>
          </div>
        )}

        {/* LINEUPS */}
        {activeTab === 'lineups' && (
          <div className="space-y-6">
            <Pitch home={homeLineup} away={awayLineup} />
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: match.homeTeam.name, crest: match.homeTeam.crest, lineup: homeLineup, accent: 'bg-yellow-400' },
                { name: match.awayTeam.name, crest: match.awayTeam.crest, lineup: awayLineup, accent: 'bg-cyan-400' }
              ].map(team => (
                <div key={team.name} className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    {team.crest && <img src={team.crest} alt="" className="h-6 w-8 object-contain" />}
                    <h3 className="text-sm font-semibold text-white">{team.name}</h3>
                  </div>
                  <div className="grid gap-2">
                    {team.lineup.map(p => (
                      <div key={p.number} className="flex items-center justify-between rounded-xl bg-black/10 px-3.5 py-2 text-xs font-medium">
                        <span className="text-white/40">{p.role}</span>
                        <span className="text-white/90">
                          <span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-gray-950 ${team.accent}`}>
                            {p.number}
                          </span>
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {activeTab === 'stats' && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-5">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-white/40 mb-6">Team Statistics</h2>
            <div className="space-y-4">
              {demoStats.map(stat => {
                const homeRaw = stat.homeRaw ?? Number(stat.home);
                const awayRaw = stat.awayRaw ?? Number(stat.away);
                const total = Math.max(homeRaw + awayRaw, 1);
                return (
                  <div key={stat.label}>
                    <div className="mb-2 flex justify-between text-xs font-medium text-white/80">
                      <span>{stat.home}</span>
                      <span className="text-white/40">{stat.label}</span>
                      <span>{stat.away}</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="bg-yellow-400" style={{ width: `${(homeRaw / total) * 100}%` }} />
                      <div className="bg-cyan-400" style={{ width: `${(awayRaw / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HIGHLIGHTS */}
        {activeTab === 'highlights' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {['Match Highlights', 'Full Match Replay', 'Interviews & Reaction'].map(label => (
                <a
                  key={label}
                  href={searchUrl(`${match.homeTeam.name} vs ${match.awayTeam.name} ${label}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-white/5 bg-white/[0.015] transition-all hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#060c13] to-black flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-950 group-hover:scale-105 transition-transform">Play</div>
                  </div>
                  <div className="p-4 text-xs">
                    <p className="font-semibold text-white/90 group-hover:text-white transition">{label}</p>
                    <p className="mt-0.5 text-white/30 font-light">Search on YouTube</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
