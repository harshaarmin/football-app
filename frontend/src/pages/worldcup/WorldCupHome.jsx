import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../../utils/api'

const flagUrl = (code) => code ? 'https://flagcdn.com/w80/' + code + '.png' : ''

export default function WorldCupHome() {
  const [matches, setMatches] = useState([])
  const [groups, setGroups] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE_URL}/worldcup/home`),
      axios.get(`${API_BASE_URL}/news/worldcup`)
    ]).then(([homeRes, newsRes]) => {
      setMatches(homeRes.data.matches || [])
      setGroups(homeRes.data.groups || [])
      setArticles(newsRes.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const finished = matches.filter(m => m.finished === 'TRUE').sort((a, b) => new Date(b.local_date) - new Date(a.local_date))
  const upcoming = matches.filter(m => m.finished !== 'TRUE').sort((a, b) => new Date(a.local_date) - new Date(b.local_date))
  const lastMatch = finished[0]
  const nextMatch = upcoming[0]

  const scorerMap = {}
  matches.forEach(match => {
    const add = (str, team, flag) => {
      if (!str || str === 'null') return
      str.replace(/[{}"]/g, '').split(',').forEach(s => {
        const name = s.trim().replace(/\s\d+[''+].*/, '').trim()
        if (!name) return
        if (!scorerMap[name]) scorerMap[name] = { name: name, goals: 0, team: team, flag: flag }
        scorerMap[name].goals++
      })
    }
    add(match.home_scorers, match.home_team_name_en, match.home_team && match.home_team.flag)
    add(match.away_scorers, match.away_team_name_en, match.away_team && match.away_team.flag)
  })
  const topScorers = Object.values(scorerMap).sort((a, b) => b.goals - a.goals).slice(0, 5)

  const teamPoints = []
  groups.forEach(g => {
    g.teams.forEach(t => {
      teamPoints.push({
        name: (t.team && t.team.name_en) || 'Unknown',
        flag: t.team && t.team.flag,
        pts: Number(t.pts),
        gd: Number(t.gd),
        mp: Number(t.mp),
        w: Number(t.w),
        d: Number(t.d),
        l: Number(t.l),
        group: g.name
      })
    })
  })
  const topTeams = teamPoints.sort((a, b) => b.pts - a.pts || b.gd - a.gd).slice(0, 8)

  const totalGoals = finished.reduce((a, m) => a + Number(m.home_score || 0) + Number(m.away_score || 0), 0)
  const avgGoals = finished.length > 0 ? (totalGoals / finished.length).toFixed(1) : 0
  const liveMatch = matches.find(m => m.finished !== 'TRUE' && String(m.local_date || '').includes(new Date().toISOString().slice(0, 10)))
  const heroMatch = liveMatch || nextMatch || lastMatch
  const heroTitle = liveMatch
    ? `${liveMatch.home_team_name_en} vs ${liveMatch.away_team_name_en} takes over the spotlight.`
    : nextMatch
      ? `Next up: ${nextMatch.home_team_name_en} against ${nextMatch.away_team_name_en}.`
      : lastMatch
        ? `${lastMatch.home_team_name_en} ${lastMatch.home_score}-${lastMatch.away_score} ${lastMatch.away_team_name_en} changed the rhythm.`
        : 'The road to the World Cup starts here.'
  const heroCopy = liveMatch
    ? `Live context, group pressure and tournament movement around Group ${liveMatch.group}.`
    : nextMatch
      ? `Group ${nextMatch.group} is next on the board. Track the build-up, table pressure and match flow.`
      : lastMatch
        ? `Latest result from Group ${lastMatch.group}, with scorers, standings movement and match review.`
        : 'USA, Mexico and Canada host 48 teams across the biggest World Cup yet.'
  const highScoring = finished
    .slice()
    .sort((a, b) => (Number(b.home_score || 0) + Number(b.away_score || 0)) - (Number(a.home_score || 0) + Number(a.away_score || 0)))
    .slice(0, 3)
  const cleanSearch = (value) => encodeURIComponent(value)
  const highlightUrl = (match) =>
    `https://www.youtube.com/results?search_query=${cleanSearch(`${match.home_team_name_en} ${match.away_team_name_en} World Cup highlights`)}`
  const tickerItems = finished.slice(0, 5).map(m => m.home_team_name_en + ' ' + m.home_score + '-' + m.away_score + ' ' + m.away_team_name_en)
    .concat(['Group stage in progress · 48 teams · 104 matches · Updated live'])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#06070a] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center">
          <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-yellow-300 border-t-transparent animate-spin" />
          <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">Loading World Cup</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-clip bg-[#06070a] text-white">

      <section className="relative overflow-x-clip overflow-y-visible">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(250,204,21,0.16),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(16,185,129,0.18),transparent_32%),linear-gradient(135deg,#100d05_0%,#0d1320_48%,#050608_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#06070a] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:pb-12 sm:pt-8 lg:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/65">
              Tournament hub
            </span>
            <button onClick={() => navigate('/worldcup/fixtures')} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/70 hover:border-yellow-300 hover:text-white">
              Full fixtures
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d09] p-4 sm:rounded-[32px] sm:p-6 lg:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(250,204,21,0.10),transparent_45%),linear-gradient(20deg,rgba(16,185,129,0.10),transparent_34%)]" />
              <img src={flagUrl('us')} alt="" className="absolute left-4 top-5 h-10 w-16 rotate-[-8deg] rounded-xl object-cover opacity-20 shadow-xl sm:left-7 sm:top-8 sm:h-14 sm:w-24" />
              <img src={flagUrl('mx')} alt="" className="absolute right-4 top-7 h-10 w-16 rotate-[8deg] rounded-xl object-cover opacity-20 shadow-xl sm:right-8 sm:top-10 sm:h-14 sm:w-24" />
              <img src={flagUrl('ca')} alt="" className="absolute bottom-24 left-6 hidden h-14 w-24 rotate-[7deg] rounded-xl object-cover opacity-20 shadow-xl sm:block" />

              <div className="relative z-20 max-w-2xl">
                <span className="rounded-full bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-950">
                  FIFA World Cup 2026™
                </span>
                <h1 className="mt-5 max-w-3xl text-[2rem] font-black leading-[0.96] sm:mt-7 sm:text-5xl lg:text-6xl">
                  {heroTitle}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/62 sm:mt-6 sm:text-base sm:leading-8 lg:text-lg">
                  {heroCopy}
                </p>
              </div>

              {heroMatch && (
                <div className="relative z-20 mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:mt-8 sm:max-w-xl sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="min-w-0 flex items-center gap-3">
                    {heroMatch.home_team?.flag && <img src={heroMatch.home_team.flag} alt="" className="h-9 w-12 rounded-lg object-cover" />}
                    <span className="truncate text-sm font-black">{heroMatch.home_team_name_en}</span>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-gray-950">
                    {heroMatch.finished === 'TRUE' ? `${heroMatch.home_score}-${heroMatch.away_score}` : 'VS'}
                  </div>
                  <div className="min-w-0 flex items-center gap-3 sm:justify-end">
                    <span className="truncate text-sm font-black sm:text-right">{heroMatch.away_team_name_en}</span>
                    {heroMatch.away_team?.flag && <img src={heroMatch.away_team.flag} alt="" className="h-9 w-12 rounded-lg object-cover" />}
                  </div>
                </div>
              )}

              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { val: finished.length, label: 'Played', color: 'text-emerald-300' },
                  { val: upcoming.length, label: 'Remaining', color: 'text-blue-300' },
                  { val: totalGoals, label: 'Goals', color: 'text-yellow-300' },
                  { val: avgGoals, label: 'Avg/match', color: 'text-red-300' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center sm:p-4">
                    <div className={'text-xl font-black sm:text-2xl ' + s.color}>{s.val}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">
                    {lastMatch ? 'Latest score' : 'Tournament'}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Match center</h2>
                </div>
                {lastMatch && (
                  <button
                    onClick={() => navigate('/match/' + lastMatch.id)}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-black text-gray-950 transition hover:bg-yellow-300 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    View
                  </button>
                )}
              </div>

              {lastMatch ? (
                <div onClick={() => navigate('/match/' + lastMatch.id)} className="cursor-pointer rounded-2xl bg-black/30 p-5">
                  <p className="mb-3 text-xs text-white/45">Group {lastMatch.group} · Full time</p>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className="min-w-0">
                      {lastMatch.home_team && lastMatch.home_team.flag && <img src={lastMatch.home_team.flag} alt="" className="mb-2 h-10 w-14 rounded-lg object-cover" />}
                      <h3 className="truncate text-lg font-black">{lastMatch.home_team_name_en}</h3>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 text-center text-gray-950">
                      <div className="text-xl font-black">{lastMatch.home_score}<span className="mx-1 text-gray-400">-</span>{lastMatch.away_score}</div>
                    </div>
                    <div className="min-w-0 sm:text-right">
                      {lastMatch.away_team && lastMatch.away_team.flag && <img src={lastMatch.away_team.flag} alt="" className="ml-auto mb-2 h-10 w-14 rounded-lg object-cover" />}
                      <h3 className="truncate text-lg font-black">{lastMatch.away_team_name_en}</h3>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-black/30 p-6 text-center text-sm text-white/45">No results yet</div>
              )}

              {nextMatch && (
                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-emerald-200">Next kickoff</p>
                  <div className="grid gap-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="flex min-w-0 items-center gap-2">
                      {nextMatch.home_team && nextMatch.home_team.flag && <img src={nextMatch.home_team.flag} alt="" className="h-5 w-7 rounded object-cover" />}
                      <span className="truncate text-sm font-bold">{nextMatch.home_team_name_en}</span>
                      </div>
                      <span className="rounded-lg bg-black/25 px-3 py-1 text-xs font-black text-emerald-200">{(nextMatch.local_date || '').split(' ')[1] || 'TBC'}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <span className="min-w-0 truncate text-sm font-bold">{nextMatch.away_team_name_en}</span>
                      {nextMatch.away_team && nextMatch.away_team.flag && <img src={nextMatch.away_team.flag} alt="" className="h-5 w-7 rounded object-cover" />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-yellow-300 text-gray-950 overflow-hidden">
        <div className="kickoff-ticker flex overflow-hidden whitespace-nowrap py-3 text-xs font-black uppercase tracking-wider sm:text-sm">
          {tickerItems.concat(tickerItems).map((item, index) => (
            <span key={item + index} className="mx-6 inline-flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-gray-950" />
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          <div className="space-y-8 lg:col-span-8">
            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Standings</p>
                  <h2 className="mt-1 text-3xl font-black">Top teams by points</h2>
                </div>
                <button onClick={() => navigate('/worldcup/standings')} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65 hover:border-yellow-300 hover:text-white">
                  All groups
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
                <div className="hide-scrollbar overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-12 border-b border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
                      <span className="col-span-1">#</span>
                      <span className="col-span-4">Team</span>
                      <span className="col-span-1 text-center">Grp</span>
                      <span className="col-span-1 text-center">P</span>
                      <span className="col-span-1 text-center">W</span>
                      <span className="col-span-1 text-center">D</span>
                      <span className="col-span-1 text-center">L</span>
                      <span className="col-span-1 text-center">GD</span>
                      <span className="col-span-1 text-center text-white">Pts</span>
                    </div>
                    {topTeams.map((team, i) => (
                      <div key={team.name} className="grid grid-cols-12 items-center border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5">
                        <span className={'col-span-1 text-sm font-black ' + (i < 3 ? 'text-yellow-300' : 'text-white/40')}>{i + 1}</span>
                        <div className="col-span-4 flex min-w-0 items-center gap-2">
                          {team.flag ? <img src={team.flag} className="h-5 w-7 flex-shrink-0 rounded object-cover" alt={team.name} /> : <div className="h-5 w-7 flex-shrink-0 rounded bg-white/10" />}
                          <span className="truncate text-sm font-bold">{team.name}</span>
                        </div>
                        <span className="col-span-1 text-center text-xs text-white/40">{team.group}</span>
                        <span className="col-span-1 text-center text-sm text-white/60">{team.mp}</span>
                        <span className="col-span-1 text-center text-sm text-white/60">{team.w}</span>
                        <span className="col-span-1 text-center text-sm text-white/60">{team.d}</span>
                        <span className="col-span-1 text-center text-sm text-white/60">{team.l}</span>
                        <span className={'col-span-1 text-center text-sm ' + (team.gd > 0 ? 'text-emerald-300' : team.gd < 0 ? 'text-red-300' : 'text-white/40')}>
                          {team.gd > 0 ? '+' : ''}{team.gd}
                        </span>
                        <span className={'col-span-1 text-center text-sm font-black ' + (i < 3 ? 'text-yellow-300' : 'text-white')}>{team.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Results</p>
                  <h2 className="mt-1 text-3xl font-black">Recent matches</h2>
                </div>
                <button onClick={() => navigate('/worldcup/fixtures')} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65 hover:border-yellow-300 hover:text-white">
                  All results
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {finished.slice(0, 6).map((match, i) => (
                  <button
                    key={match._id || i}
                    onClick={() => navigate('/match/' + match.id)}
                    className="group rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:-translate-y-0.5 hover:border-yellow-300/40"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Group {match.group}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-black text-white/60">FT</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div className="min-w-0 flex items-center gap-2">
                        {match.home_team && match.home_team.flag && <img src={match.home_team.flag} alt="" className="h-5 w-7 rounded object-cover flex-shrink-0" />}
                        <span className="truncate text-sm font-bold">{match.home_team_name_en}</span>
                      </div>
                      <div className="rounded-lg bg-black/30 px-3 py-1.5 text-center text-sm font-black">
                        {match.home_score}<span className="mx-1 text-white/30">-</span>{match.away_score}
                      </div>
                      <div className="min-w-0 flex items-center gap-2 sm:justify-end">
                        <span className="truncate text-sm font-bold sm:text-right">{match.away_team_name_en}</span>
                        {match.away_team && match.away_team.flag && <img src={match.away_team.flag} alt="" className="h-5 w-7 rounded object-cover flex-shrink-0" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Golden Boot</p>
                  <h2 className="mt-1 text-2xl font-black">Top scorers</h2>
                </div>
                <button onClick={() => navigate('/worldcup/players')} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-gray-950 hover:bg-yellow-300">
                  All
                </button>
              </div>
              <div className="space-y-3">
                {topScorers.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3 rounded-xl bg-black/25 p-3">
                    <div className={'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ' + (i === 0 ? 'bg-yellow-300 text-gray-950' : 'bg-white/10 text-white')}>
                      {i + 1}
                    </div>
                    {s.flag ? <img src={s.flag} className="h-7 w-10 rounded-lg object-cover flex-shrink-0" alt={s.team} /> : <div className="h-7 w-10 bg-white/10 rounded-lg flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-black text-sm">{s.name}</div>
                      <div className="truncate text-xs text-white/45">{s.team}</div>
                    </div>
                    <div className="text-xl font-black text-yellow-300">{s.goals}</div>
                  </div>
                ))}
                {topScorers.length === 0 && <p className="text-sm text-white/40">No goals recorded yet</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Format</p>
              <h2 className="mt-1 text-2xl font-black">Tournament pulse</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { label: 'Teams', value: 48 },
                  { label: 'Groups', value: 12 },
                  { label: 'Stadiums', value: 16 },
                  { label: 'Total matches', value: 104 },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-black/25 p-3">
                    <div className="text-2xl font-black">{item.value}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/35">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Explore</p>
              <div className="mt-4 grid gap-2">
                {[
                  { label: 'Group standings', path: '/worldcup/standings' },
                  { label: 'All fixtures', path: '/worldcup/fixtures' },
                  { label: 'Top scorers', path: '/worldcup/players' },
                  { label: 'Premier League hub', path: '/pl' },
                ].map(link => (
                  <button key={link.path} onClick={() => navigate(link.path)} className="flex items-center justify-between rounded-xl bg-black/25 px-4 py-3 text-left text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">
                    {link.label}
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Highlights</p>
                <h2 className="mt-1 text-3xl font-black">Matches worth replaying</h2>
              </div>
              <button onClick={() => navigate('/worldcup/fixtures')} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65 hover:border-yellow-300 hover:text-white">
                All matches
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {highScoring.map(match => (
                <a
                  key={match.id}
                  href={highlightUrl(match)}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition hover:-translate-y-0.5 hover:border-yellow-300/40"
                >
                  <div className="relative h-36 overflow-hidden bg-[#10130f]">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),transparent_45%),linear-gradient(35deg,rgba(16,185,129,0.14),transparent_38%)]" />
                    {match.home_team?.flag && <img src={match.home_team.flag} alt="" className="absolute left-5 top-5 h-12 w-16 -rotate-6 rounded-xl object-cover shadow-xl" />}
                    {match.away_team?.flag && <img src={match.away_team.flag} alt="" className="absolute bottom-5 right-5 h-12 w-16 rotate-6 rounded-xl object-cover shadow-xl" />}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-gray-950 shadow-xl transition group-hover:scale-105">
                        Play
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-white/35">Group {match.group}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-gray-950">{match.home_score}-{match.away_score}</span>
                    </div>
                    <p className="truncate text-sm font-black">{match.home_team_name_en} vs {match.away_team_name_en}</p>
                    <p className="mt-2 text-xs font-bold text-white/45">YouTube highlight search</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Storylines</p>
              <h2 className="mt-1 text-2xl font-black">What to watch</h2>
              <div className="mt-5 space-y-3">
                {[
                  `${topTeams[0]?.name || 'Top team'} setting the pace with ${topTeams[0]?.pts || 0} points.`,
                  `${topScorers[0]?.name || 'Golden Boot leader'} leads the scorer race.`,
                  `${finished.length} matches complete, ${upcoming.length} still to shape the bracket.`
                ].map(item => (
                  <div key={item} className="rounded-xl bg-black/25 p-3 text-sm font-bold leading-6 text-white/65">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-white/45">Reads</p>
              <h2 className="mt-1 text-3xl font-black">World football notes</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {articles.slice(0, 6).map(article => (
              <a
                key={article.link}
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition hover:-translate-y-0.5 hover:border-yellow-300/40"
              >
                {article.image && <img src={article.image} alt="" className="h-36 w-full object-cover" />}
                <div className="p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-yellow-300">BBC Sport</p>
                  <h3 className="mt-2 line-clamp-2 min-h-[48px] text-base font-black leading-6">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/50">{article.content}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
