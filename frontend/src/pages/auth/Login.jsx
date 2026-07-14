import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
    FaEye,
    FaEyeSlash,
    FaEnvelope,
    FaLock,
} from "react-icons/fa";


import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function Login({ switchScreen }) {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);


    const handleLogin = async () => {
        try {
            setLoading(true);
            const data = await loginUser(email, password);
            login(data);

            navigate("/", {
                replace: true,
            });

            navigate("/");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#07111F] px-4 py-8">
            <div className="grid w-full max-w-[980px] overflow-hidden rounded-3xl border border-white/10 bg-[#08101E] shadow-[0_25px_80px_rgba(0,0,0,.5)] lg:grid-cols-[1.1fr_1fr]">

                {/* ================= LEFT ================= */}
                <div className="relative hidden overflow-hidden lg:flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#04101C] via-[#07111F] to-[#07111F]" />
                    <div className="absolute -left-20 top-[-40px] h-[220px] w-[220px] rounded-full bg-cyan-500/20 blur-[100px]" />
                    <div className="absolute bottom-[-50px] right-[-30px] h-[200px] w-[200px] rounded-full bg-blue-700/20 blur-[100px]" />

                    <div className="relative flex flex-col justify-center px-10 py-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10">
                                <span className="text-2xl">⚽</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-tight">KickOff</h1>
                                <p className="text-xs text-cyan-300">Live · Fixtures · News</p>
                            </div>
                        </div>

                        <h2 className="text-4xl font-black leading-tight text-white">
                            NEVER MISS<br />ANOTHER<br />MATCH.
                        </h2>
                        <p className="mt-5 text-sm leading-6 text-slate-400 max-w-[340px]">
                            Follow every competition with live scores, fixtures, standings and breaking football news, all in one place.
                        </p>

                        <div className="flex gap-3 mt-8">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                                <h3 className="text-xl font-black text-white">1200+</h3>
                                <p className="mt-1 text-xs text-slate-400">Live Matches</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                                <h3 className="text-xl font-black text-white">45+</h3>
                                <p className="mt-1 text-xs text-slate-400">Competitions</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                    <X size={18} />
                </button>

                {/* ================= RIGHT ================= */}
                <div className="relative flex items-center justify-center bg-[#08111F] p-8 sm:p-10">



                    <div className="w-full max-w-[380px]">

                        <button
                            onClick={() => navigate("/")}
                            className="mb-6 flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                            ← Back
                        </button>

                        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[3px] text-cyan-300">
                            Welcome Back
                        </span>

                        <h1 className="mt-4 text-3xl font-black leading-tight text-white">
                            Sign in to KickOff
                        </h1>

                        {/* EMAIL */}
                        <div className="mt-8">
                            <label className="mb-2 block text-xs font-semibold text-slate-300">
                                Email Address
                            </label>
                            <div className="group flex h-11 items-center rounded-xl border border-white/10 bg-white/5 px-4 transition-all duration-300 hover:border-cyan-400/40 focus-within:border-cyan-400">
                                <FaEnvelope className="mr-3 text-sm text-slate-400 group-focus-within:text-cyan-400" />
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="mt-4">
                            <label className="mb-2 block text-xs font-semibold text-slate-300">
                                Password
                            </label>
                            <div className="group flex h-11 items-center rounded-xl border border-white/10 bg-white/5 px-4 transition-all duration-300 hover:border-cyan-400/40 focus-within:border-cyan-400">
                                <FaLock className="mr-3 text-sm text-slate-400 group-focus-within:text-cyan-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-sm text-slate-400 transition hover:text-cyan-400"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* OPTIONS */}
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 text-slate-400">
                                <input type="checkbox" className="accent-cyan-500" />
                                Remember me
                            </label>
                            <button className="font-semibold text-cyan-400 hover:text-cyan-300">
                                Forgot Password?
                            </button>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="group mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-sm font-bold text-white shadow-[0_10px_30px_rgba(14,165,233,.3)] transition duration-300 hover:scale-[1.01] disabled:opacity-60"
                        >
                            {loading ? "Signing In..." : "Continue"}
                            <span className="ml-2 transition group-hover:translate-x-1">→</span>
                        </button>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-[10px] uppercase tracking-[3px] text-slate-500">or</span>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        {/* Google */}
                        <button className="flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10">
                            Continue with Google
                        </button>

                        {/* Register */}
                        <p className="mt-6 text-center text-sm text-slate-400">
                            Don't have an account?
                            <button
                                onClick={switchScreen}
                                className="ml-1.5 font-semibold text-cyan-400 hover:text-cyan-300"
                            >
                                Create one
                            </button>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;