import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Trophy, Shield, LogIn, LogOut, User, House, Compass, Search, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Menu Dropdown states
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        setProfileMenuOpen(false);
        setDesktopMenuOpen(false);
        navigate("/");
    };

    // Nav Items definition
    const navItems = [
        { 
            to: "/", 
            label: "Home", 
            exact: true, 
            icon: House, 
            active: location.pathname === "/" 
        },
        { 
            to: "/matches", 
            label: "Matches", 
            icon: Trophy, 
            active: location.pathname.startsWith("/matches") || location.pathname.startsWith("/match") 
        },
        { 
            to: "/competitions", 
            label: "Explore", 
            icon: Compass, 
            active: location.pathname.startsWith("/competitions") || location.pathname.startsWith("/teams") 
        },
        { 
            to: "/search", 
            label: "Search", 
            icon: Search, 
            active: location.pathname.startsWith("/search") 
        }
    ];

    // Mobile bottom nav bar items
    const mobileItems = user
        ? [...navItems, { to: "/dashboard", label: "You", icon: LayoutDashboard, active: location.pathname.startsWith("/dashboard") }]
        : navItems;

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09111F]/80 backdrop-blur-xl">
                <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
                    <div className="flex min-h-16 items-center justify-between gap-3 py-3">
                        {/* Brand Logo */}
                        <NavLink
                            to="/"
                            onClick={() => { setProfileMenuOpen(false); setDesktopMenuOpen(false); }}
                            className="flex items-center gap-2.5"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm shadow-md shadow-cyan-500/10">
                                ⚽
                            </div>
                            <div>
                                <p className="text-base font-semibold tracking-wide text-white">
                                    KickOff
                                </p>
                                <p className="hidden text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 sm:block">
                                    Football Control Room
                                </p>
                            </div>
                        </NavLink>

                        {/* Desktop Navigation Links */}
                        <nav className="max-lg:hidden flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.exact}
                                        className={`rounded-xl px-4 py-2 text-xs font-medium transition duration-200 ${
                                            item.active
                                                ? "bg-white/10 text-white"
                                                : "text-white/50 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon size={13} />
                                            {item.label}
                                        </span>
                                    </NavLink>
                                );
                            })}
                        </nav>

                        {/* Desktop Auth Controls */}
                        <div className="max-lg:hidden flex items-center gap-3">
                            {!user ? (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="flex items-center gap-2 rounded-xl bg-white px-4.5 py-2 text-xs font-semibold text-gray-950 transition hover:bg-white/90"
                                >
                                    <LogIn size={13} />
                                    Login
                                </button>
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                                        className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 transition hover:bg-white/[0.06]"
                                    >
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
                                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                        </div>
                                        <span className="text-xs font-medium text-white/80">{user.name}</span>
                                        <ChevronDown size={13} className="text-white/40" />
                                    </button>

                                    {/* Desktop Profile Dropdown */}
                                    {desktopMenuOpen && (
                                        <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-white/5 bg-[#0B1528] p-2.5 shadow-2xl">
                                            <button
                                                onClick={() => { navigate("/dashboard"); setDesktopMenuOpen(false); }}
                                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white"
                                            >
                                                <LayoutDashboard size={13} />
                                                Dashboard
                                            </button>
                                            <div className="my-1.5 h-px bg-white/5" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200"
                                            >
                                                <LogOut size={13} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Auth Button (Top Right Header) */}
                        <div className="relative flex items-center gap-3 lg:hidden">
                            {!user ? (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-950 transition hover:bg-white/90"
                                >
                                    <LogIn size={13} />
                                    Login
                                </button>
                            ) : (
                                <div className="relative">
                                    <button 
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-semibold text-white shadow-md"
                                    >
                                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </button>

                                    {/* Mobile Dropdown from Top Header */}
                                    {profileMenuOpen && (
                                        <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-white/5 bg-[#0B1528] p-2.5 shadow-2xl">
                                            <div className="px-2 py-1 text-center">
                                                <p className="text-xs font-semibold text-white truncate max-w-full">{user.name}</p>
                                                <p className="text-[9px] uppercase tracking-wider text-white/30 mt-0.5 mb-2">Signed In</p>
                                            </div>
                                            <button
                                                onClick={() => { navigate("/dashboard"); setProfileMenuOpen(false); }}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white"
                                            >
                                                <LayoutDashboard size={13} />
                                                Dashboard
                                            </button>
                                            <div className="my-1.5 h-px bg-white/5" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200"
                                            >
                                                <LogOut size={13} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* FLOATING BOTTOM NAV BAR FOR MOBILE */}
            <div className="fixed bottom-5 left-1/2 z-50 flex w-[90%] max-w-[350px] -translate-x-1/2 items-center justify-between gap-1 rounded-2xl border border-white/5 bg-[#09111F]/80 p-1.5 backdrop-blur-xl shadow-xl shadow-cyan-500/5 lg:hidden">
                {mobileItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            onClick={() => { setProfileMenuOpen(false); setDesktopMenuOpen(false); }}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium transition duration-200 ${
                                item.active
                                    ? "bg-white text-gray-950 shadow-md font-semibold"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Icon size={15} />
                            <span className="text-[9px] tracking-wide text-center">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </>
    );
}

export default Navbar;
