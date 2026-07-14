import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Trophy, Shield, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const isWC = location.pathname.startsWith("/worldcup");
    const isPL = location.pathname.startsWith("/pl");

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09111F]/80 backdrop-blur-xl">

            <div className="mx-auto flex h-16 max-w-[1600px] items-center px-6">

                {/* Logo */}

                <NavLink
                    to="/"
                    className="text-2xl font-black text-white"
                >
                    ⚽ KickOff
                </NavLink>

                {/* Center Navigation */}

                <div className="ml-auto flex items-center gap-3">

                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `rounded-xl px-5 py-2.5 text-sm font-bold transition ${isActive
                                ? "bg-cyan-500 text-white"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/worldcup"
                        className={() =>
                            `rounded-xl px-5 py-2.5 text-sm font-bold transition ${isWC
                                ? "bg-yellow-500 text-black"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Trophy size={16} />
                            World Cup
                        </div>
                    </NavLink>

                    <NavLink
                        to="/pl"
                        className={() =>
                            `rounded-xl px-5 py-2.5 text-sm font-bold transition ${isPL
                                ? "bg-purple-600 text-white"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Shield size={16} />
                            Premier League
                        </div>
                    </NavLink>

                </div>

                {/* Right Side */}

                {!user ? (

                    <button
                        onClick={() => navigate("/login")}
                        className="ml-8 flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 font-bold text-white transition hover:bg-cyan-400"
                    >
                        <LogIn size={16} />
                        Login
                    </button>

                ) : (

                    <div className="ml-8 flex items-center gap-3">

                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
                                <User size={18} />
                            </div>

                            <div>

                                <p className="text-sm font-bold">
                                    {user.name}
                                </p>

                                <p className="text-[10px] text-white/45">
                                    Signed In
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>

                    </div>

                )}

            </div>
        </header>
    );
}

export default Navbar;