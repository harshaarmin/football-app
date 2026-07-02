import { Link, useLocation } from 'react-router-dom'

function Navbar() {
    const location = useLocation()

    const links = [
        { to: '/', label: 'Live Scores' },
        { to: '/standings', label: 'PL Standings' },
        { to: '/fixtures', label: 'Fixtures' },
        { to: '/worldcup', label: '🏆 World Cup 2026' },
    ]

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <span className="text-green-400 font-bold text-xl">⚽ FootballApp</span>
                <div className="flex gap-6">
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`text-sm font-medium transition-colors ${location.pathname === link.to
                                ? 'text-green-400 border-b-2 border-green-400 pb-1'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    )
}

export default Navbar