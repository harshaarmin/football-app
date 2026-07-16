import { useEffect, useState } from 'react'
import axios from 'axios'
import API_BASE_URL from '../utils/api'

export default function TournamentBracket() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE_URL}/worldcup/groups`)
      .then(res => { setGroups(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="text-yellow-400 animate-pulse text-sm">Loading standings...</div>
    </div>
  )



  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-gray-900 border border-yellow-500/20 rounded-2xl px-8 py-3">
          <span className="text-yellow-400 font-bold text-lg tracking-wide">🏆 FIFA World Cup 2026 — Group Stage</span>
        </div>
        <p className="text-gray-600 text-xs mt-2">Top 2 from each group advance · Live standings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {groups.map(group => (
          <div key={group.name} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500/30 transition-all">
            <div className="flex items-center justify-between px-3 py-2.5 bg-gray-800 border-b border-gray-700">
              <span className="text-yellow-400 font-bold text-sm">Group {group.name}</span>
              <span className="text-gray-500 text-xs tracking-widest">P W D L GD PTS</span>
            </div>

            <div className="divide-y divide-gray-800/60">
              {group.teams.map((entry, index) => {
                const isFirst = index === 0
                const isSecond = index === 1
                const isOut = index >= 2
                const gd = Number(entry.gd)
                const barColor = isFirst ? 'bg-yellow-400' : isSecond ? 'bg-green-500' : 'bg-gray-700'
                const numColor = isFirst ? 'text-yellow-400' : isSecond ? 'text-green-400' : 'text-gray-600'
                const ptsColor = isFirst ? 'text-yellow-400' : isSecond ? 'text-green-400' : 'text-gray-600'
                const gdColor = gd > 0 ? 'text-green-400' : gd < 0 ? 'text-red-400' : 'text-gray-500'
                const dotColor = isFirst ? 'bg-yellow-400' : 'bg-green-500'

                return (
                  <div key={entry.team_id} className={'flex items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-800/60 ' + (isOut ? 'opacity-60' : '')}>
                    <div className={'w-0.5 h-5 rounded-full flex-shrink-0 ' + barColor} />
                    <span className={'text-xs font-bold w-3 ' + numColor}>{index + 1}</span>

                    <div className="relative flex-shrink-0">
                      {entry.team?.flag ? (
                        <img src={entry.team.flag} alt={entry.team.name_en} className="w-7 h-[18px] object-cover rounded" />
                      ) : (
                        <div className="w-7 h-[18px] bg-gray-700 rounded" />
                      )}
                      {!isOut && (
                        <div className={'absolute -top-1 -right-1 w-2 h-2 rounded-full border border-gray-900 ' + dotColor} />
                      )}
                    </div>

                    <span className={'text-xs font-medium flex-1 truncate ' + (isOut ? 'text-gray-500' : 'text-white')}>
                      {entry.team?.name_en || 'Unknown'}
                    </span>

                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                      <span className="w-3 text-center">{entry.mp}</span>
                      <span className="w-3 text-center">{entry.w}</span>
                      <span className="w-3 text-center">{entry.d}</span>
                      <span className="w-3 text-center">{entry.l}</span>
                      <span className={'w-5 text-center ' + gdColor}>{gd > 0 ? '+' : ''}{gd}</span>
                      <span className={'w-5 text-center font-bold ' + ptsColor}>{entry.pts}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-3 py-2 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-yellow-400"><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block"></span>1st</span>
                <span className="flex items-center gap-1 text-green-400"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>2nd</span>
                <span className="flex items-center gap-1 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-700 rounded-full inline-block"></span>Out</span>
              </div>
              <span className="text-xs text-gray-700">MD {group.teams[0]?.mp || 0}/3</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center justify-between text-xs text-gray-600">
        <span>48 teams · 12 groups · Top 2 per group advance to Round of 32</span>
        <span>🔄 Live</span>
      </div>
    </div>
  )
}
