import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronRight, 
  Activity 
} from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

// Fallback data in case APIs fail
const FALLBACK_NEWS = [
  {
    title: 'Liverpool push for another attacking signing before the window closes',
    content: 'Clubs across Europe are moving quickly as managers shape their squads for the next run of fixtures.',
    link: '#',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Premier League clubs prepare for a busy week of medicals and announcements',
    content: 'Recruitment teams are pushing to close deals before squads travel for summer tours.',
    link: '#',
    image: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'World Cup contenders reveal refreshed squads and new generation stars',
    content: 'National teams are shaping early plans around pace, pressing and younger attacking profiles.',
    link: '#',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
  },
];

const FALLBACK_TRANSFERS = [
  { player: 'Alexander Isak', from: 'Newcastle', to: 'Liverpool', status: 'Rumour', detail: 'Forward shortlist' },
  { player: 'Victor Osimhen', from: 'Napoli', to: 'Chelsea', status: 'Talks', detail: 'Striker search' },
  { player: 'Florian Wirtz', from: 'Leverkusen', to: 'Man City', status: 'Linked', detail: 'Creative midfield' },
  { player: 'Nico Williams', from: 'Athletic Club', to: 'Arsenal', status: 'Watching', detail: 'Wide option' },
];

function formatMatchDate(dateStr, isPL) {
  if (!dateStr) return 'TBC';
  if (isPL) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } else {
    const datePart = String(dateStr).split(' ')[0];
    const parts = datePart.split('/');
    if (parts.length < 3) return datePart;
    const date = new Date(parts[2], parts[0] - 1, parts[1]);
    if (isNaN(date.getTime())) return datePart;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}

function formatMatchTime(dateStr, isPL) {
  if (!dateStr) return '';
  if (isPL) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  } else {
    const parts = String(dateStr).split(' ');
    return parts[1] ? parts[1].slice(0, 5) : '';
  }
}

function buildWcScorers(matches) {
  const scorerMap = {};
  matches.forEach(match => {
    const add = (str, team, flag) => {
      if (!str || str === 'null') return;
      str.replace(/[{}"]/g, '').split(',').forEach(s => {
        const name = s.trim().replace(/\s\d+['’"+]?.*$/, '').trim();
        if (!name) return;
        if (!scorerMap[name]) scorerMap[name] = { name, goals: 0, team, flag };
        scorerMap[name].goals++;
      });
    };
    add(match.home_scorers, match.home_team_name_en, match.home_team?.flag);
    add(match.away_scorers, match.away_team_name_en, match.away_team?.flag);
  });
  return Object.values(scorerMap).sort((a, b) => b.goals - a.goals).slice(0, 5);
}

export default function Home() {
  const [plData, setPlData] = useState(null);
  const [wcData, setWcData] = useState(null);
  const [news, setNews] = useState([]);
  const [newsTab, setNewsTab] = useState('all');
  const [loadingNews, setLoadingNews] = useState(false);

  // Layout Tab Switchers
  const [heroMatchFeed, setHeroMatchFeed] = useState('pl'); // 'pl' or 'wc'
  const [heroMatchState, setHeroMatchState] = useState('scores'); // 'scores' or 'upcoming'
  const [standingsTab, setStandingsTab] = useState('pl'); // 'pl' or 'wc'
  const [fixturesTab, setFixturesTab] = useState('pl'); // 'pl' or 'wc'
  const [scorersTab, setScorersTab] = useState('pl'); // 'pl' or 'wc'
  
  const [selectedWcGroup, setSelectedWcGroup] = useState('Group A');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    Promise.all([
      axios.get(`${API_BASE}/pl/home`),
      axios.get(`${API_BASE}/worldcup/home`),
      axios.get(`${API_BASE}/news`)
    ]).then(([plRes, wcRes, newsRes]) => {
      if (!mounted) return;
      setPlData(plRes.data || null);
      setWcData(wcRes.data || null);
      setNews(newsRes.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      if (mounted) {
        setError('Football Hub could not load matches. Retrying shortly.');
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, []);

  // Handle Tab Switch for News
  const handleNewsTabChange = async (tab) => {
    setNewsTab(tab);
    setLoadingNews(true);
    try {
      const endpoint = tab === 'all' ? '/news' : `/news/${tab}`;
      const res = await axios.get(`${API_BASE}${endpoint}`);
      setNews(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNews(false);
    }
  };

  // Memoized lists for Match Feeds
  const plFinished = useMemo(() => {
    return plData?.matches?.filter(m => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate)) || [];
  }, [plData]);

  const plUpcoming = useMemo(() => {
    return plData?.matches?.filter(m => m.status !== 'FINISHED')
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)) || [];
  }, [plData]);

  const wcFinished = useMemo(() => {
    return wcData?.matches?.filter(m => m.finished === 'TRUE')
      .sort((a, b) => new Date(b.local_date) - new Date(a.local_date)) || [];
  }, [wcData]);

  const wcUpcoming = useMemo(() => {
    return wcData?.matches?.filter(m => m.finished !== 'TRUE')
      .sort((a, b) => new Date(a.local_date) - new Date(b.local_date)) || [];
  }, [wcData]);

  // Compute WC Top Scorers
  const wcTopScorers = useMemo(() => {
    return wcData?.matches ? buildWcScorers(wcData.matches) : [];
  }, [wcData]);

  // Combined Ticker Stories
  const tickerStories = useMemo(() => {
    const rawStories = news.length ? news : FALLBACK_NEWS;
    const scores = wcFinished.slice(0, 3).map(m => `${m.home_team_name_en} ${m.home_score}-${m.away_score} ${m.away_team_name_en}`);
    return scores.concat(rawStories.slice(0, 4).map(s => s.title)).concat([
      'Dual League Coverage: Premier League Standings & World Cup Groups Synchronized',
      'Follow results, upcoming matches, transfer rumours and top scorers central'
    ]);
  }, [news, wcFinished]);

  // Pick Overall Featured Matches for Hero Spotlight
  const plFeaturedHero = plUpcoming[0] || plFinished[0];
  const wcFeaturedHero = wcUpcoming[0] || wcFinished[0];
  const flagshipMatch = heroMatchFeed === 'pl' ? plFeaturedHero : wcFeaturedHero;
  const isFlagshipPL = heroMatchFeed === 'pl';
  const isFlagshipFinished = isFlagshipPL 
    ? flagshipMatch?.status === 'FINISHED' 
    : flagshipMatch?.finished === 'TRUE';

  // Stats Counters
  const totalWcGoals = useMemo(() => {
    return wcFinished.reduce((sum, match) => sum + Number(match.home_score || 0) + Number(match.away_score || 0), 0);
  }, [wcFinished]);

  const plFinishedCount = plFinished.length;
  const wcFinishedCount = wcFinished.length;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a] px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-red-950/10 p-8 text-center backdrop-blur-2xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Activity size={24} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-400">Connection Failed</p>
          <p className="mt-2 text-sm text-white/60">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-cyan-400 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06070a] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center">
          <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-emerald-300 border-t-transparent animate-spin" />
          <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">Loading central feed</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#06070a] text-white">
      {/* 1. HERO SECTION (Layout aligned with WorldCupHome / PLHome) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(16,185,129,0.15),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(139,92,246,0.15),transparent_32%),linear-gradient(135deg,#07110d_0%,#0d1320_48%,#050608_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#06070a] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 lg:px-6">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/65">
              Football Hub Central
            </span>
            <div className="flex gap-2">
              <button onClick={() => navigate('/pl')} className="rounded-full border border-white/10 bg-purple-600/20 px-4 py-2 text-xs font-black uppercase tracking-widest text-purple-300 hover:bg-purple-600/40 transition">
                PL Hub
              </button>
              <button onClick={() => navigate('/worldcup')} className="rounded-full border border-white/10 bg-yellow-500/20 px-4 py-2 text-xs font-black uppercase tracking-widest text-yellow-300 hover:bg-yellow-500/40 transition">
                World Cup Hub
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
            {/* Left Main Hero Panel */}
            <div className="relative min-h-[460px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0f0d] p-6 sm:p-9">
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(16,185,129,0.12),transparent_45%),linear-gradient(20deg,rgba(139,92,246,0.10),transparent_34%)]" />
              
              <div className="relative z-20 max-w-2xl">
                <span className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-950">
                  Scores, stats & headlines
                </span>
                <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.02] sm:text-6xl">
                  {flagshipMatch ? (
                    isFlagshipPL ? (
                      `Next in PL: ${flagshipMatch.homeTeam?.shortName || flagshipMatch.homeTeam?.name} vs ${flagshipMatch.awayTeam?.shortName || flagshipMatch.awayTeam?.name}`
                    ) : (
                      `Next in WC: ${flagshipMatch.home_team_name_en} vs ${flagshipMatch.away_team_name_en}`
                    )
                  ) : (
                    'The ultimate dual-tournament soccer central.'
                  )}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-white/62 sm:text-lg">
                  Follow live standings, fixtures, schedules, player golden boots, and transfer rumours from one single integrated dashboard.
                </p>

                {/* Hero Feature Match Switcher */}
                <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => setHeroMatchFeed('pl')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      isFlagshipPL ? 'bg-purple-600 text-white' : 'bg-black/30 text-white/50 hover:text-white'
                    }`}
                  >
                    Premier League Spotlight
                  </button>
                  <button 
                    onClick={() => setHeroMatchFeed('wc')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      !isFlagshipPL ? 'bg-yellow-500 text-black font-extrabold' : 'bg-black/30 text-white/50 hover:text-white'
                    }`}
                  >
                    World Cup Spotlight
                  </button>
                </div>
              </div>

              {/* Featured Match Card */}
              {flagshipMatch && (
                <div className="relative z-20 mt-8 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="min-w-0 flex items-center gap-3">
                    {isFlagshipPL ? (
                      flagshipMatch.homeTeam?.crest && <img src={flagshipMatch.homeTeam.crest} alt="" className="h-9 w-9 object-contain" />
                    ) : (
                      flagshipMatch.home_team?.flag && <img src={flagshipMatch.home_team.flag} alt="" className="h-9 w-12 rounded-lg object-cover" />
                    )}
                    <span className="truncate text-sm font-black">
                      {isFlagshipPL ? (flagshipMatch.homeTeam?.shortName || flagshipMatch.homeTeam?.name) : flagshipMatch.home_team_name_en}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-gray-950">
                    {isFlagshipFinished ? (
                      isFlagshipPL ? (
                        `${flagshipMatch.score?.fullTime?.home}-${flagshipMatch.score?.fullTime?.away}`
                      ) : (
                        `${flagshipMatch.home_score}-${flagshipMatch.away_score}`
                      )
                    ) : 'VS'}
                  </div>
                  <div className="min-w-0 flex items-center justify-end gap-3">
                    <span className="truncate text-right text-sm font-black">
                      {isFlagshipPL ? (flagshipMatch.awayTeam?.shortName || flagshipMatch.awayTeam?.name) : flagshipMatch.away_team_name_en}
                    </span>
                    {isFlagshipPL ? (
                      flagshipMatch.awayTeam?.crest && <img src={flagshipMatch.awayTeam.crest} alt="" className="h-9 w-9 object-contain" />
                    ) : (
                      flagshipMatch.away_team?.flag && <img src={flagshipMatch.away_team.flag} alt="" className="h-9 w-12 rounded-lg object-cover" />
                    )}
                  </div>
                </div>
              )}

              {/* Central Quick Stats grid */}
              <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { val: plFinishedCount, label: 'PL Played', color: 'text-purple-300' },
                  { val: plUpcoming.length, label: 'PL Pending', color: 'text-cyan-300' },
                  { val: wcFinishedCount, label: 'WC Played', color: 'text-yellow-300' },
                  { val: totalWcGoals, label: 'WC Goals', color: 'text-emerald-300' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                    <div className={'text-2xl font-black ' + s.color}>{s.val}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Aside Card (Match center sidebar feed) */}
            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Match center</p>
                    <h2 className="mt-1 text-2xl font-black">Match feed</h2>
                  </div>
                </div>

                {/* Tournament switch tab */}
                <div className="grid grid-cols-2 rounded-2xl bg-black/25 p-1 mb-3">
                  <button 
                    onClick={() => { setHeroMatchState('scores') }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                      heroMatchState === 'scores' ? 'bg-white text-gray-950' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Scores
                  </button>
                  <button 
                    onClick={() => { setHeroMatchState('upcoming') }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                      heroMatchState === 'upcoming' ? 'bg-white text-gray-950' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Upcoming
                  </button>
                </div>

                {/* Sub-tab: Premier League vs World Cup */}
                <div className="grid grid-cols-2 rounded-xl bg-white/5 p-1 mb-4 text-xs">
                  <button 
                    onClick={() => { setFixturesTab('pl') }}
                    className={`rounded-lg py-1 font-bold transition ${
                      fixturesTab === 'pl' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Premier League
                  </button>
                  <button 
                    onClick={() => { setFixturesTab('wc') }}
                    className={`rounded-lg py-1 font-bold transition ${
                      fixturesTab === 'wc' ? 'bg-yellow-500 text-black font-extrabold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    World Cup
                  </button>
                </div>

                {/* Render Selected feed matches */}
                <div className="space-y-3">
                  {(fixturesTab === 'pl' 
                    ? (heroMatchState === 'scores' ? plFinished : plUpcoming) 
                    : (heroMatchState === 'scores' ? wcFinished : wcUpcoming)
                  ).slice(0, 3).map((match, idx) => {
                    const isPL = fixturesTab === 'pl';
                    const homeName = isPL ? (match.homeTeam?.shortName || match.homeTeam?.name) : match.home_team_name_en;
                    const awayName = isPL ? (match.awayTeam?.shortName || match.awayTeam?.name) : match.away_team_name_en;
                    const homeCrest = isPL ? match.homeTeam?.crest : match.home_team?.flag;
                    const awayCrest = isPL ? match.awayTeam?.crest : match.away_team?.flag;
                    const scoreText = isPL 
                      ? `${match.score?.fullTime?.home ?? 0} - ${match.score?.fullTime?.away ?? 0}` 
                      : `${match.home_score} - ${match.away_score}`;
                    const isFinished = isPL ? match.status === 'FINISHED' : match.finished === 'TRUE';

                    return (
                      <div 
                        key={match.id || idx}
                        onClick={() => navigate('/match/' + match.id)}
                        className="cursor-pointer rounded-xl bg-black/35 p-3.5 hover:bg-white/5 transition border border-white/5"
                      >
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {isPL ? (
                              homeCrest && <img src={homeCrest} className="h-5 w-5 object-contain" alt="" />
                            ) : (
                              homeCrest && <img src={homeCrest} className="h-3.5 w-5 rounded object-cover" alt="" />
                            )}
                            <span className="truncate text-xs font-bold">{homeName}</span>
                          </div>
                          
                          <div className="rounded bg-white/10 px-2 py-1 text-[11px] font-black text-white text-center min-w-[50px]">
                            {isFinished ? scoreText : 'VS'}
                          </div>

                          <div className="flex items-center justify-end gap-2 min-w-0 text-right">
                            <span className="truncate text-xs font-bold">{awayName}</span>
                            {isPL ? (
                              awayCrest && <img src={awayCrest} className="h-5 w-5 object-contain" alt="" />
                            ) : (
                              awayCrest && <img src={awayCrest} className="h-3.5 w-5 rounded object-cover" alt="" />
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-white/35 flex justify-between">
                          <span>{isPL ? `Matchday ${match.matchday}` : `Group ${match.group}`}</span>
                          <span>{isPL ? formatMatchDate(match.utcDate, true) : formatMatchDate(match.local_date, false)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {((fixturesTab === 'pl' 
                    ? (heroMatchState === 'scores' ? plFinished : plUpcoming) 
                    : (heroMatchState === 'scores' ? wcFinished : wcUpcoming)
                  ).length === 0) && (
                    <div className="py-8 text-center text-xs text-white/30">No matches scheduled</div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => navigate(fixturesTab === 'pl' ? '/pl' : '/worldcup')}
                className="mt-4 w-full rounded-xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-white/70 hover:border-emerald-300 hover:text-white"
              >
                Go to hub →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TICKER BANNER */}
      <section className="border-y border-white/10 bg-emerald-300 text-gray-950">
        <div className="kickoff-ticker flex overflow-hidden whitespace-nowrap py-3 text-sm font-black uppercase tracking-wider">
          {tickerStories.concat(tickerStories).map((item, index) => (
            <span key={index} className="mx-6 inline-flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-gray-950" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* 3. MAIN DASHBOARD CONTENT (8-cols Left, 4-cols Right Sidebar layout matching tournament pages) */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Main Content Area (8 columns) */}
          <div className="space-y-8 lg:col-span-8">
            
            {/* Dynamic Standings Section */}
            <div>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Standings</p>
                  <h2 className="mt-1 text-3xl font-black">League & Group Tables</h2>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStandingsTab('pl')}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                      standingsTab === 'pl' 
                        ? 'bg-purple-600 border-purple-500 text-white shadow' 
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    Premier League Table
                  </button>
                  <button 
                    onClick={() => setStandingsTab('wc')}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                      standingsTab === 'wc' 
                        ? 'bg-yellow-500 border-yellow-500 text-black font-black' 
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    World Cup Groups
                  </button>
                </div>
              </div>

              {standingsTab === 'pl' ? (
                /* Premier League Standings View */
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
                    <span className="col-span-1">Pos</span>
                    <span className="col-span-4">Club</span>
                    <span className="col-span-1 text-center">GP</span>
                    <span className="col-span-1 text-center">W</span>
                    <span className="col-span-1 text-center">D</span>
                    <span className="col-span-1 text-center">L</span>
                    <span className="col-span-1 text-center">GD</span>
                    <span className="col-span-2 text-center text-white">Pts</span>
                  </div>
                  {plData?.standings?.[0]?.table?.slice(0, 10).map((row, i) => (
                    <div key={row.team.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition">
                      <span className={`col-span-1 text-sm font-black ${i < 4 ? 'text-emerald-400' : 'text-white/40'}`}>{row.position}</span>
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        {row.team.crest ? <img src={row.team.crest} className="h-5 w-5 object-contain" alt="" /> : <div className="h-5 w-5 bg-white/10 rounded" />}
                        <span className="truncate text-sm font-bold">{row.team.shortName || row.team.name}</span>
                      </div>
                      <span className="col-span-1 text-center text-sm text-white/60">{row.playedGames}</span>
                      <span className="col-span-1 text-center text-sm text-white/60">{row.won}</span>
                      <span className="col-span-1 text-center text-sm text-white/60">{row.draw}</span>
                      <span className="col-span-1 text-center text-sm text-white/60">{row.lost}</span>
                      <span className="col-span-1 text-center text-sm text-white/60">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</span>
                      <span className="col-span-2 text-center font-black text-sm text-purple-300">{row.points}</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* World Cup Groups Standings View */
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-black/25 p-3 rounded-2xl border border-white/10">
                    <span className="text-xs font-bold text-white/40">Select Group:</span>
                    <select 
                      value={selectedWcGroup}
                      onChange={(e) => setSelectedWcGroup(e.target.value)}
                      className="rounded-lg bg-black px-3 py-1.5 text-xs font-bold text-yellow-300 border border-white/10 outline-none cursor-pointer"
                    >
                      {wcData?.groups?.map(g => (
                        <option key={g.name} value={g.name} className="bg-black text-white">{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] overflow-hidden">
                    <div className="grid grid-cols-12 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
                      <span className="col-span-1">Pos</span>
                      <span className="col-span-4">Nation</span>
                      <span className="col-span-1 text-center">GP</span>
                      <span className="col-span-1 text-center">W</span>
                      <span className="col-span-1 text-center">D</span>
                      <span className="col-span-1 text-center">L</span>
                      <span className="col-span-1 text-center">GD</span>
                      <span className="col-span-2 text-center text-white">Pts</span>
                    </div>
                    {(wcData?.groups?.find(g => g.name === selectedWcGroup) || wcData?.groups?.[0])?.teams?.map((row, idx) => (
                      <div key={row.team_id || idx} className="grid grid-cols-12 items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition">
                        <span className={`col-span-1 text-sm font-black ${idx < 2 ? 'text-yellow-300' : 'text-white/40'}`}>{idx + 1}</span>
                        <div className="col-span-4 flex items-center gap-2 min-w-0">
                          {row.team?.flag ? <img src={row.team.flag} className="h-3.5 w-5 object-cover rounded-sm" alt="" /> : <div className="h-3.5 w-5 bg-white/10 rounded-sm" />}
                          <span className="truncate text-sm font-bold">{row.team?.name_en || 'Unknown'}</span>
                        </div>
                        <span className="col-span-1 text-center text-sm text-white/60">{row.mp}</span>
                        <span className="col-span-1 text-center text-sm text-white/60">{row.w}</span>
                        <span className="col-span-1 text-center text-sm text-white/60">{row.d}</span>
                        <span className="col-span-1 text-center text-sm text-white/60">{row.l}</span>
                        <span className="col-span-1 text-center text-sm text-white/60">{Number(row.gd) > 0 ? `+${row.gd}` : row.gd}</span>
                        <span className="col-span-2 text-center font-black text-sm text-yellow-300">{row.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Match Calendar/Upcoming Grid Section */}
            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Matches</p>
                  <h2 className="mt-1 text-3xl font-black">Upcoming fixtures</h2>
                </div>
                
                <div className="flex gap-2 text-xs">
                  <button 
                    onClick={() => navigate(fixturesTab === 'pl' ? '/pl/fixtures' : '/worldcup/fixtures')}
                    className="rounded-xl border border-white/10 px-4 py-2 font-bold text-white hover:border-emerald-300 transition"
                  >
                    View All Calendar
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(fixturesTab === 'pl' ? plUpcoming : wcUpcoming).slice(0, 4).map((match, idx) => {
                  const isPL = fixturesTab === 'pl';
                  const homeName = isPL ? (match.homeTeam?.shortName || match.homeTeam?.name) : match.home_team_name_en;
                  const awayName = isPL ? (match.awayTeam?.shortName || match.awayTeam?.name) : match.away_team_name_en;
                  const homeCrest = isPL ? match.homeTeam?.crest : match.home_team?.flag;
                  const awayCrest = isPL ? match.awayTeam?.crest : match.away_team?.flag;

                  return (
                    <div 
                      key={match.id || idx}
                      onClick={() => navigate('/match/' + match.id)}
                      className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-emerald-300/50"
                    >
                      <span className="rounded-full bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/45">
                        {isPL ? `Matchday ${match.matchday}` : `Group ${match.group}`}
                      </span>

                      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="min-w-0 flex flex-col items-center text-center">
                          {isPL ? (
                            homeCrest && <img src={homeCrest} className="h-10 w-10 object-contain mb-2" alt="" />
                          ) : (
                            homeCrest && <img src={homeCrest} className="h-7 w-11 rounded object-cover mb-2" alt="" />
                          )}
                          <h4 className="truncate w-full text-xs font-black">{homeName}</h4>
                        </div>
                        
                        <div className="rounded-xl bg-black/30 px-3 py-2 text-center text-xs font-black text-white/40 min-w-[55px]">
                          {isPL ? formatMatchTime(match.utcDate, true) : formatMatchTime(match.local_date, false)}
                        </div>

                        <div className="min-w-0 flex flex-col items-center text-center">
                          {isPL ? (
                            awayCrest && <img src={awayCrest} className="h-10 w-10 object-contain mb-2" alt="" />
                          ) : (
                            awayCrest && <img src={awayCrest} className="h-7 w-11 rounded object-cover mb-2" alt="" />
                          )}
                          <h4 className="truncate w-full text-xs font-black">{awayName}</h4>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 text-center text-[10px] text-white/40">
                        Kickoff: {isPL ? formatMatchDate(match.utcDate, true) : formatMatchDate(match.local_date, false)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Headlines Section */}
            <div>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Latest news</p>
                  <h2 className="mt-1 text-3xl font-black">Headlines hub</h2>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { id: 'all', label: 'All News' },
                    { id: 'pl', label: 'Premier League' },
                    { id: 'worldcup', label: 'World Cup' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleNewsTabChange(tab.id)}
                      className={`rounded-lg px-3 py-1.5 font-bold transition ${
                        newsTab === tab.id 
                          ? 'bg-emerald-300 text-gray-950 font-black shadow' 
                          : 'bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingNews ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {(news.length ? news : FALLBACK_NEWS).slice(0, 3).map((story, index) => (
                    <a 
                      key={story.title + index} 
                      href={story.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={(index === 0 ? 'md:col-span-2 md:row-span-2 ' : '') + 'group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition hover:border-emerald-300/50 flex flex-col justify-between'}
                    >
                      <div>
                        <div 
                          className={(index === 0 ? 'h-72' : 'h-36') + ' bg-cover bg-center transition duration-500 group-hover:scale-[1.03]'}
                          style={{ backgroundImage: 'url(' + (story.image || FALLBACK_NEWS[index % FALLBACK_NEWS.length].image) + ')' }}
                        />
                        <div className="p-5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">BBC Sport</span>
                          <h3 className={(index === 0 ? 'text-2xl sm:text-3xl' : 'text-sm') + ' mt-2 font-black leading-tight group-hover:text-emerald-300 transition-colors'}>{story.title}</h3>
                          {index === 0 && <p className="mt-3 text-xs leading-relaxed text-white/55 line-clamp-3">{story.content}</p>}
                        </div>
                      </div>

                      <div className="p-5 pt-0 text-[10px] text-white/30 font-bold uppercase tracking-wider flex justify-between items-center">
                        <span>{story.pubDate ? new Date(story.pubDate).toLocaleDateString() : 'Today'}</span>
                        <span className="text-emerald-300 inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition duration-300">
                          Read <ChevronRight size={12} />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Transfers Market Watch */}
            <div>
              <div className="mb-4">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Transfers</p>
                <h2 className="mt-1 text-3xl font-black">Market watch</h2>
              </div>
              
              <div className="grid auto-cols-[minmax(250px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {FALLBACK_TRANSFERS.map((item, index) => (
                  <div key={item.player + index} className="min-h-[170px] rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-emerald-300/40">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-emerald-300/10 border border-emerald-300/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-300">{item.status}</span>
                      <span className="text-[10px] font-bold text-white/40">{item.detail}</span>
                    </div>
                    <h3 className="line-clamp-2 text-base font-black leading-snug">{item.player}</h3>
                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[10px] font-bold">
                      <span className="truncate rounded bg-black/25 py-1 px-2 text-white/50 text-center">{item.from}</span>
                      <span className="font-black text-emerald-300">→</span>
                      <span className="truncate rounded bg-black/25 py-1 px-2 text-white/50 text-center">{item.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Area (4 columns - aside) */}
          <aside className="space-y-8 lg:col-span-4">
            
            {/* Top Scorers Widget */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Players</p>
                  <h2 className="mt-1 text-xl font-black">Top scorers</h2>
                </div>

                <div className="flex bg-black/25 p-0.5 rounded-lg text-[10px] border border-white/10">
                  <button 
                    onClick={() => setScorersTab('pl')}
                    className={`rounded px-2.5 py-1 font-bold transition ${
                      scorersTab === 'pl' ? 'bg-purple-600 text-white' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    PL
                  </button>
                  <button 
                    onClick={() => setScorersTab('wc')}
                    className={`rounded px-2.5 py-1 font-bold transition ${
                      scorersTab === 'wc' ? 'bg-yellow-500 text-black' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    WC
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {scorersTab === 'pl' ? (
                  plData?.players?.slice(0, 5).map((row, idx) => (
                    <div key={row.player.id || idx} className="flex items-center gap-3 rounded-xl bg-black/25 p-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                        idx === 0 ? 'bg-amber-300 text-gray-950' : 'bg-white/10 text-white'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-black">{row.player.name}</div>
                        <div className="truncate text-[10px] text-white/45">{row.team.name}</div>
                      </div>
                      <div className="text-lg font-black text-purple-300">{row.goals}</div>
                    </div>
                  ))
                ) : (
                  wcTopScorers.slice(0, 5).map((row, idx) => (
                    <div key={row.name + idx} className="flex items-center gap-3 rounded-xl bg-black/25 p-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                        idx === 0 ? 'bg-amber-300 text-gray-950' : 'bg-white/10 text-white'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-black">{row.name}</div>
                        <div className="truncate text-[10px] text-white/45 flex items-center gap-1">
                          {row.flag && <img src={row.flag} className="h-2.5 w-4 object-cover rounded-sm" alt="" />}
                          <span>{row.team}</span>
                        </div>
                      </div>
                      <div className="text-lg font-black text-yellow-300">{row.goals}</div>
                    </div>
                  ))
                )}
                {((scorersTab === 'pl' ? (plData?.players?.length || 0) : wcTopScorers.length) === 0) && (
                  <div className="py-6 text-center text-xs text-white/30">Player stats currently loading.</div>
                )}
              </div>
            </div>

            {/* Tournament Pulse Widget */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Overview</p>
              <h2 className="mt-1 text-xl font-black">Tournament pulse</h2>
              
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-black/25 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                    <span>🏴 Premier League</span>
                    <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-white/60">English Top-Flight</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-black/35 rounded-lg p-2.5">
                      <span className="text-[20px] font-black text-white block">{plData?.standings?.[0]?.table?.length || 20}</span>
                      <span className="text-[9px] text-white/35 uppercase">Total Clubs</span>
                    </div>
                    <div className="bg-black/35 rounded-lg p-2.5">
                      <span className="text-[20px] font-black text-white block">{plFinishedCount + plUpcoming.length}</span>
                      <span className="text-[9px] text-white/35 uppercase">Fixtures</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-black/25 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-yellow-300">
                    <span>🏆 FIFA World Cup</span>
                    <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-white/60">International Pinnacle</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-black/35 rounded-lg p-2.5">
                      <span className="text-[20px] font-black text-white block">{wcData?.teams?.length || 48}</span>
                      <span className="text-[9px] text-white/35 uppercase">Nations</span>
                    </div>
                    <div className="bg-black/35 rounded-lg p-2.5">
                      <span className="text-[20px] font-black text-white block">{wcData?.groups?.length || 12}</span>
                      <span className="text-[9px] text-white/35 uppercase">Groups</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Navigation Explore Block */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Explore</p>
              <h2 className="mt-1 text-xl font-black">Direct navigation</h2>
              
              <div className="mt-4 grid gap-2">
                {[
                  { label: 'World Cup Overview', path: '/worldcup' },
                  { label: 'World Cup Group Standings', path: '/worldcup/standings' },
                  { label: 'Premier League Overview', path: '/pl' },
                  { label: 'Premier League Fixtures', path: '/pl/fixtures' },
                ].map((link) => (
                  <button 
                    key={link.path} 
                    onClick={() => navigate(link.path)} 
                    className="flex items-center justify-between rounded-xl bg-black/25 px-4 py-3.5 text-left text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>{link.label}</span>
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>

          </aside>

        </section>
      </div>
    </main>
  );
}
