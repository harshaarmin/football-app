import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Trophy, Shield, LogIn, LogOut, User, House } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const { user, logout } = useAuth();

    const isWC = location.pathname.startsWith("/worldcup");
    const isPL = location.pathname.startsWith("/pl");

    const handleLogout = () => {
        logout();
        setProfileMenuOpen(false);
        navigate("/");
    };

    const navItems = [
        { to: "/", label: "Home", exact: true, icon: House, active: !isWC && !isPL },
        { to: "/worldcup", label: "World Cup", icon: Trophy, active: isWC },
        { to: "/pl", label: "Premier League", icon: Shield, active: isPL },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-white/10 bg-[#09111F]/80 backdrop-blur-xl">
                <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-5 lg:px-6">
                    <div className="flex min-h-16 items-center justify-between gap-3 py-3">
                        <NavLink
                            to="/"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex min-w-0 items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-xl shadow-lg shadow-cyan-500/20">
                                ⚽
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-lg font-black tracking-wide text-white sm:text-xl">
                                    KickOff
                                </p>
                                <p className="hidden text-[11px] font-bold uppercase tracking-[0.24em] text-white/35 sm:block">
                                    Football Control Room
                                </p>
                            </div>
                        </NavLink>

                        {/* Desktop Navigation */}
                        <nav className="max-lg:hidden flex items-center gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.exact}
                                        className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                                            item.active
                                                ? item.to === "/worldcup"
                                                    ? "bg-yellow-500 text-black"
                                                    : item.to === "/pl"
                                                        ? "bg-cyan-500 text-slate-950"
                                                        : "bg-white text-slate-950"
                                                : "text-white/60 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon size={16} />
                                            {item.label}
                                        </span>
                                    </NavLink>
                                );
                            })}
                        </nav>

                        {/* Desktop Auth */}
                        <div className="max-lg:hidden flex items-center gap-3">
                            {!user ? (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                                >
                                    <LogIn size={16} />
                                    Login
                                </button>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{user.name}</p>
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                                                Signed In
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Navigation Header Actions */}
                        <div className="relative flex items-center gap-3 lg:hidden">
                            {!user ? (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 shadow-md shadow-cyan-500/10"
                                >
                                    <LogIn size={14} />
                                    Login
                                </button>
                            ) : (
                                <div className="relative">
                                    <button 
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-md transition hover:scale-105 focus:outline-none"
                                    >
                                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </button>

                                    {profileMenuOpen && (
                                        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-white/10 bg-[#0B1528] p-4 shadow-2xl">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-black text-white shadow-md mb-2">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                                </div>
                                                <p className="text-sm font-bold text-white truncate max-w-full">{user.name}</p>
                                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-4">
                                                    Signed In
                                                </p>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500 hover:text-white"
                                                >
                                                    <LogOut size={14} />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* FLOATING BOTTOM NAV BAR FOR MOBILE */}
            <div className="fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-[360px] -translate-x-1/2 items-center justify-between gap-1 rounded-full border border-white/10 bg-[#09111F]/80 p-1.5 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 lg:hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            onClick={() => setProfileMenuOpen(false)}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 text-xs font-bold transition ${
                                item.active
                                    ? item.to === "/worldcup"
                                        ? "bg-yellow-500 text-black shadow-md"
                                        : item.to === "/pl"
                                            ? "bg-cyan-500 text-slate-950 shadow-md"
                                            : "bg-white text-slate-950 shadow-md"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <Icon size={18} />
                            <span className="text-[10px] tracking-wide text-center">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </>
    );
}

export default Navbar;
