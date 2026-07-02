import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const parseScorers = (str) => {
  if (!str || str === 'null') return []
  return str.replace(/[{}"]/g, '').split(',').map(s => {
    const raw = s.trim()
    const minute = raw.match(/\d+['+]?/)?.[0] || 'Goal'
    const name = raw.replace(/\s\d+['+]?.*/, '').trim()
    return { raw, name: name || raw, minute }
  }).filter(s => s.name)
}

const pct = (value, total) => total ? Math.round((value / total) * 100) : 50
const safeDate = (value) => value || 'Time TBC'
const searchUrl = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`

const makeSeed = (match) =>
  String(match.id || `${match.home_team_name_en}${match.away_team_name_en}`)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

const makeDemoStats = (match, homeGoals, awayGoals) => {
  const seed = makeSeed(match)
  const homeEdge = Math.max(homeGoals - awayGoals, 0)
  const awayEdge = Math.max(awayGoals - homeGoals, 0)
  const homePossession = Math.min(68, Math.max(39, 50 + homeEdge * 6 - awayEdge * 5 + (seed % 9) - 4))
  const awayPossession = 100 - homePossession

  return [
    { label: 'Shots', home: 9 + homeGoals * 3 + (seed % 4), away: 8 + awayGoals * 3 + (seed % 3) },
    { label: 'Shots on target', home: Math.max(homeGoals, 3 + homeGoals + (seed % 3)), away: Math.max(awayGoals, 2 + awayGoals + (seed % 2)) },
    { label: 'Possession', home: `${homePossession}%`, away: `${awayPossession}%`, homeRaw: homePossession, awayRaw: awayPossession },
    { label: 'Passes', home: 390 + homePossession * 4 + (seed % 35), away: 390 + awayPossession * 4 + (seed % 28) },
    { label: 'Pass accuracy', home: `${80 + (seed % 10)}%`, away: `${78 + (seed % 9)}%`, homeRaw: 80 + (seed % 10), awayRaw: 78 + (seed % 9) },
    { label: 'Corners', home: 3 + (seed % 6), away: 2 + ((seed + 2) % 5) },
    { label: 'Fouls', home: 8 + (seed % 8), away: 9 + ((seed + 4) % 8) },
    { label: 'Offsides', home: seed % 4, away: (seed + 1) % 4 }
  ]
}

const makeLineup = (teamName, scorers, startNumber) => {
  const roles = ['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'CM', 'CM', 'RW', 'ST', 'LW']
  return roles.map((role, index) => ({
    role,
    number: startNumber + index,
    name: scorers[index]?.name || `${teamName.split(' ')[0]} ${index + 1}`,
    x: [50, 18, 38, 62, 82, 50, 34, 66, 20, 50, 80][index],
    y: [10, 27, 29, 29, 27, 46, 58, 58, 78, 84, 78][index]
  }))
}

function TeamMiniCard({ teamName, flag, matches }) {
  const form = matches
    .filter(m => m.finished === 'TRUE' && (m.home_team_name_en === teamName || m.away_team_name_en === teamName))
    .slice()
    .sort((a, b) => new Date(b.local_date) - new Date(a.local_date))
    .slice(0, 5)

  const totals = form.reduce((acc, m) => {
    const isHome = m.home_team_name_en === teamName
    const gf = Number(isHome ? m.home_score : m.away_score)
    const ga = Number(isHome ? m.away_score : m.home_score)
    acc.gf += gf
    acc.ga += ga
    acc.points += gf > ga ? 3 : gf === ga ? 1 : 0
    return acc
  }, { gf: 0, ga: 0, points: 0 })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex min-w-0 items-center gap-3">
        {flag && <img src={flag} alt="" className="h-9 w-12 rounded-lg object-cover" />}
        <div className="min-w-0">
          <h3 className="truncate font-black text-white">{teamName}</h3>
          <p className="text-xs font-bold text-white/40">Recent tournament form</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ['Pts', totals.points, 'text-yellow-300'],
          ['GF', totals.gf, 'text-emerald-300'],
          ['GA', totals.ga, 'text-red-300']
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl bg-black/25 p-3">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/35">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Pitch({ home, away, homeFlag, awayFlag }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#244531] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white/75">
          {homeFlag && <img src={homeFlag} alt="" className="h-5 w-7 rounded object-cover" />}
          4-3-3
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-white/45">Lineup preview</p>
        <div className="flex items-center gap-2 text-sm font-bold text-white/75">
          4-3-3
          {awayFlag && <img src={awayFlag} alt="" className="h-5 w-7 rounded object-cover" />}
        </div>
      </div>

      <div className="relative aspect-[7/10] overflow-hidden rounded-xl border border-white/25 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_50%,transparent_50%)] sm:aspect-[16/10]">
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/25" />
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
        <div className="absolute left-0 top-[30%] h-[40%] w-[18%] border-y border-r border-white/25" />
        <div className="absolute right-0 top-[30%] h-[40%] w-[18%] border-y border-l border-white/25" />

        {home.map(player => (
          <div
            key={`home-${player.role}-${player.number}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
          >
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-yellow-300 text-xs font-black text-gray-950">{player.number}</div>
            <p className="mt-1 max-w-[72px] truncate text-[10px] font-black text-white">{player.name}</p>
          </div>
        ))}

        {away.map(player => (
          <div
            key={`away-${player.role}-${player.number}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${100 - player.x}%`, top: `${100 - player.y}%` }}
          >
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-gray-950">{player.number}</div>
            <p className="mt-1 max-w-[72px] truncate text-[10px] font-black text-white">{player.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [allMatches, setAllMatches] = useState([])
  const [articles, setArticles] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3000/api/worldcup/matches'),
      axios.get('http://localhost:3000/api/news/worldcup')
    ])
      .then(([matchRes, newsRes]) => {
        setMatch(matchRes.data.find(m => m.id === id))
        setAllMatches(matchRes.data)
        setArticles(newsRes.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-yellow-300 border-t-transparent" />
          <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">Loading match centre</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4 text-white">
        <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Missing match</p>
          <h1 className="mt-3 text-3xl font-black">Match not found.</h1>
          <button onClick={() => navigate('/worldcup')} className="mt-5 rounded-xl bg-yellow-300 px-5 py-3 text-sm font-black text-gray-950">
            Back to World Cup
          </button>
        </div>
      </main>
    )
  }

  const homeScorers = parseScorers(match.home_scorers)
  const awayScorers = parseScorers(match.away_scorers)
  const goals = [
    ...homeScorers.map(goal => ({ ...goal, team: match.home_team_name_en, flag: match.home_team?.flag, side: 'home' })),
    ...awayScorers.map(goal => ({ ...goal, team: match.away_team_name_en, flag: match.away_team?.flag, side: 'away' }))
  ]
  const isFinished = match.finished === 'TRUE'
  const homeGoals = Number(match.home_score || 0)
  const awayGoals = Number(match.away_score || 0)
  const totalGoals = homeGoals + awayGoals
  const homeGoalPct = pct(homeGoals, totalGoals)
  const awayGoalPct = 100 - homeGoalPct
  const winner = !isFinished
    ? 'Kickoff pending'
    : homeGoals === awayGoals
      ? 'Match drawn'
      : `${homeGoals > awayGoals ? match.home_team_name_en : match.away_team_name_en} controlled the result`

  const demoStats = makeDemoStats(match, homeGoals, awayGoals)
  const homeLineup = makeLineup(match.home_team_name_en, homeScorers, 1)
  const awayLineup = makeLineup(match.away_team_name_en, awayScorers, 12)
  const groupMatches = allMatches
    .filter(m => m.group === match.group && m.id !== match.id && m.finished === 'TRUE')
    .sort((a, b) => new Date(b.local_date) - new Date(a.local_date))
    .slice(0, 4)
  const matchArticles = articles
    .filter(article => {
      const text = `${article.title || ''} ${article.content || ''}`.toLowerCase()
      return text.includes(match.home_team_name_en.toLowerCase()) ||
        text.includes(match.away_team_name_en.toLowerCase()) ||
        text.includes('world cup') ||
        text.includes('fifa')
    })
    .slice(0, 4)
  const tabs = [
    ['overview', 'Overview'],
    ['timeline', 'Timeline'],
    ['lineups', 'Lineups'],
    ['stats', 'Stats'],
    ['highlights', 'Highlights']
  ]

  const renderTab = () => {
    if (activeTab === 'timeline') {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Timeline</p>
          <h2 className="mt-1 text-3xl font-black">Key events</h2>
          <div className="mt-6 space-y-3">
            {goals.length ? goals.map((goal, index) => (
              <div key={`${goal.raw}-${index}`} className={`flex items-center gap-3 ${goal.side === 'away' ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-12 text-sm font-black text-yellow-300">{goal.minute}</div>
                {goal.flag && <img src={goal.flag} alt="" className="h-7 w-10 rounded-lg object-cover" />}
                <div className="flex-1 rounded-xl bg-black/25 px-4 py-3">
                  <p className="font-black">{goal.name}</p>
                  <p className="mt-1 text-xs font-bold text-white/40">{goal.team}</p>
                </div>
              </div>
            )) : (
              <div className="rounded-xl bg-black/25 p-5 text-sm font-bold text-white/45">No goal events recorded.</div>
            )}
          </div>
        </div>
      )
    }

    if (activeTab === 'lineups') {
      return (
        <div className="space-y-5">
          <Pitch home={homeLineup} away={awayLineup} homeFlag={match.home_team?.flag} awayFlag={match.away_team?.flag} />
          <div className="grid gap-4 md:grid-cols-2">
            {[{ name: match.home_team_name_en, flag: match.home_team?.flag, lineup: homeLineup }, { name: match.away_team_name_en, flag: match.away_team?.flag, lineup: awayLineup }].map(team => (
              <div key={team.name} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <div className="mb-4 flex items-center gap-3">
                  {team.flag && <img src={team.flag} alt="" className="h-8 w-11 rounded object-cover" />}
                  <h3 className="font-black">{team.name}</h3>
                </div>
                <div className="grid gap-2">
                  {team.lineup.map(player => (
                    <div key={`${team.name}-${player.number}`} className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2 text-sm">
                      <span className="font-bold text-white/65">{player.role}</span>
                      <span className="font-black">{player.number}. {player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeTab === 'stats') {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {match.home_team?.flag && <img src={match.home_team.flag} alt="" className="h-8 w-11 rounded object-cover" />}
            <h2 className="text-center text-2xl font-black">Team stats</h2>
            {match.away_team?.flag && <img src={match.away_team.flag} alt="" className="ml-auto h-8 w-11 rounded object-cover" />}
          </div>
          <div className="space-y-4">
            {demoStats.map(stat => {
              const homeRaw = stat.homeRaw ?? Number(stat.home)
              const awayRaw = stat.awayRaw ?? Number(stat.away)
              const total = Math.max(homeRaw + awayRaw, 1)
              return (
                <div key={stat.label}>
                  <div className="mb-2 grid grid-cols-[64px_1fr_64px] items-center gap-3 text-sm font-bold">
                    <span>{stat.home}</span>
                    <span className="text-center text-white/55">{stat.label}</span>
                    <span className="text-right">{stat.away}</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="bg-yellow-300" style={{ width: `${(homeRaw / total) * 100}%` }} />
                    <div className="bg-cyan-300" style={{ width: `${(awayRaw / total) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    if (activeTab === 'highlights') {
      const cards = ['Full highlights', 'Goals replay', 'Post-match reaction']
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map(label => (
              <a
                key={label}
                href={searchUrl(`${match.home_team_name_en} ${match.away_team_name_en} ${label} World Cup`)}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition hover:-translate-y-0.5 hover:border-yellow-300/40"
              >
                <div className="relative h-36 overflow-hidden bg-[#10130f]">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),transparent_45%),linear-gradient(35deg,rgba(16,185,129,0.14),transparent_38%)]" />
                  {match.home_team?.flag && <img src={match.home_team.flag} alt="" className="absolute left-5 top-5 h-12 w-16 -rotate-6 rounded-xl object-cover shadow-xl" />}
                  {match.away_team?.flag && <img src={match.away_team.flag} alt="" className="absolute bottom-5 right-5 h-12 w-16 rotate-6 rounded-xl object-cover shadow-xl" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-gray-950">Play</div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-black">{label}</p>
                  <p className="mt-1 text-xs text-white/45">YouTube search</p>
                </div>
              </a>
            ))}
          </div>

          {matchArticles.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {matchArticles.map(article => (
                <a key={article.link} href={article.link} target="_blank" rel="noreferrer" className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition hover:-translate-y-0.5 hover:border-yellow-300/40">
                  {article.image ? <img src={article.image} alt="" className="h-36 w-full object-cover" /> : <div className="h-36 bg-white/5" />}
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">BBC Sport</p>
                    <h3 className="mt-2 line-clamp-2 min-h-[48px] text-base font-black leading-6">{article.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/50">{article.content}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Match story</p>
            <h2 className="mt-2 text-3xl font-black">{winner}</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              {isFinished
                ? `${match.home_team_name_en} and ${match.away_team_name_en} produced ${totalGoals} goals in Group ${match.group}. Use the tabs for timeline, lineup preview, stats and highlights.`
                : `${match.home_team_name_en} meet ${match.away_team_name_en} in Group ${match.group}. Use the tabs for preview, lineup and match context.`}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Momentum</p>
            <h2 className="mt-1 text-3xl font-black">Score balance</h2>
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm font-bold text-white/55">
                <span>{match.home_team_name_en} {homeGoals}</span>
                <span>{match.away_team_name_en} {awayGoals}</span>
              </div>
              <div className="flex h-4 overflow-hidden rounded-full bg-white/10">
                <div className="bg-yellow-300" style={{ width: `${homeGoalPct}%` }} />
                <div className="bg-cyan-300" style={{ width: `${awayGoalPct}%` }} />
              </div>
            </div>
          </div>
        </div>
        <aside className="space-y-6 lg:col-span-4">
          <TeamMiniCard teamName={match.home_team_name_en} flag={match.home_team?.flag} matches={allMatches} />
          <TeamMiniCard teamName={match.away_team_name_en} flag={match.away_team?.flag} matches={allMatches} />
          {groupMatches.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Group {match.group}</p>
              <div className="mt-4 space-y-2">
                {groupMatches.map(m => (
                  <button key={m.id} onClick={() => navigate(`/match/${m.id}`)} className="w-full rounded-xl bg-black/25 p-3 text-left transition hover:bg-white/10">
                    <div className="flex items-center justify-between gap-3 text-sm font-black">
                      <span className="truncate">{m.home_team_name_en}</span>
                      <span>{m.home_score}-{m.away_score}</span>
                      <span className="truncate text-right">{m.away_team_name_en}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#06070a] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(16,185,129,0.14),transparent_32%),linear-gradient(135deg,#100d05_0%,#0d1320_48%,#050608_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <button onClick={() => navigate('/worldcup')} className="mb-6 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/65 hover:border-yellow-300 hover:text-white">
            Back to World Cup
          </button>

          <div className="rounded-[32px] border border-white/10 bg-black/25 p-5 sm:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-950">
                Group {match.group} · Matchday {match.matchday}
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/60">
                {isFinished ? 'Full time' : safeDate(match.local_date)}
              </span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
              <div className="min-w-0">
                {match.home_team?.flag && <img src={match.home_team.flag} alt="" className="mb-4 h-12 w-16 rounded-xl object-cover sm:h-16 sm:w-24" />}
                <h1 className="truncate text-2xl font-black sm:text-5xl">{match.home_team_name_en}</h1>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-center text-gray-950 sm:px-7 sm:py-4">
                {isFinished ? (
                  <div className="text-3xl font-black sm:text-5xl">{homeGoals}<span className="mx-2 text-gray-400">-</span>{awayGoals}</div>
                ) : (
                  <div className="text-3xl font-black sm:text-5xl">VS</div>
                )}
              </div>
              <div className="min-w-0 text-right">
                {match.away_team?.flag && <img src={match.away_team.flag} alt="" className="ml-auto mb-4 h-12 w-16 rounded-xl object-cover sm:h-16 sm:w-24" />}
                <h1 className="truncate text-2xl font-black sm:text-5xl">{match.away_team_name_en}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[64px] z-30 border-b border-white/10 bg-[#06070a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 lg:px-6">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`min-w-max border-b-2 px-5 py-4 text-sm font-black transition ${
                activeTab === key
                  ? 'border-yellow-300 text-white'
                  : 'border-transparent text-white/45 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {renderTab()}
      </div>
    </main>
  )
}
