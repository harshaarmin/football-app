import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function Register({ switchScreen }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await registerUser(name, email, password);
      login(data);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#07111F] px-4 py-8">
      <div className="relative w-full max-w-[520px] rounded-3xl border border-white/10 bg-[#08101E] p-8 shadow-[0_25px_80px_rgba(0,0,0,.5)] sm:p-10">
        <button
          onClick={() => navigate("/")}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[3px] text-cyan-300">
          Create account
        </span>

        <h1 className="mt-4 text-3xl font-black leading-tight text-white">
          Build your football dashboard
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Save favourite clubs, national teams and players, then see them first.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Field icon={FaUser} label="Name" value={name} onChange={setName} placeholder="Your name" />
          <Field icon={FaEnvelope} label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <Field icon={FaLock} label="Password" value={password} onChange={setPassword} placeholder="Minimum 6 characters" type="password" />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-sm font-bold text-white shadow-[0_10px_30px_rgba(14,165,233,.3)] transition hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?
          <button
            onClick={() => switchScreen ? switchScreen() : navigate("/login")}
            className="ml-1.5 font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-300">{label}</label>
      <div className="group flex h-11 items-center rounded-xl border border-white/10 bg-white/5 px-4 transition hover:border-cyan-400/40 focus-within:border-cyan-400">
        <Icon className="mr-3 text-sm text-slate-400 group-focus-within:text-cyan-400" />
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

export default Register;
