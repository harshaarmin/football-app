import { useEffect, useState } from 'react'
import axios from 'axios'
import API_BASE_URL from '../utils/api'

function Standings() {
    const [table, setTable] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API_BASE_URL}/standings/pl`)
            .then(res => {
                setTable(res.data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-green-400 animate-pulse">Loading standings...</div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">
                🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League Standings
            </h2>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 text-xs text-gray-500 uppercase tracking-wide px-4 py-3 border-b border-gray-800">
                    <span className="col-span-1">#</span>
                    <span className="col-span-5">Team</span>
                    <span className="col-span-1 text-center">P</span>
                    <span className="col-span-1 text-center">W</span>
                    <span className="col-span-1 text-center">D</span>
                    <span className="col-span-1 text-center">L</span>
                    <span className="col-span-1 text-center">GD</span>
                    <span className="col-span-1 text-center font-bold text-white">Pts</span>
                </div>

                {/* Rows */}
                {table.map((row, index) => (
                    <div
                        key={row.team.id}
                        className={`grid grid-cols-12 items-center px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors ${index < 4 ? 'border-l-2 border-l-blue-500' :
                            index < 6 ? 'border-l-2 border-l-orange-500' :
                                index >= 17 ? 'border-l-2 border-l-red-500' : ''
                            }`}
                    >
                        <span className="col-span-1 text-gray-400 text-sm">{row.position}</span>
                        <div className="col-span-5 flex items-center gap-3">
                            <img src={row.team.crest} alt={row.team.name} className="w-6 h-6 object-contain" />
                            <span className="text-white text-sm font-medium">{row.team.shortName}</span>
                        </div>
                        <span className="col-span-1 text-center text-gray-300 text-sm">{row.playedGames}</span>
                        <span className="col-span-1 text-center text-gray-300 text-sm">{row.won}</span>
                        <span className="col-span-1 text-center text-gray-300 text-sm">{row.draw}</span>
                        <span className="col-span-1 text-center text-gray-300 text-sm">{row.lost}</span>
                        <span className="col-span-1 text-center text-gray-300 text-sm">{row.goalDifference}</span>
                        <span className="col-span-1 text-center text-white font-bold text-sm">{row.points}</span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-4 text-xs text-gray-500">
                <span><span className="inline-block w-2 h-2 bg-blue-500 rounded-sm mr-1"></span>Champions League</span>
                <span><span className="inline-block w-2 h-2 bg-orange-500 rounded-sm mr-1"></span>Europa League</span>
                <span><span className="inline-block w-2 h-2 bg-red-500 rounded-sm mr-1"></span>Relegation</span>
            </div>
        </div>
    )
}

export default Standings
