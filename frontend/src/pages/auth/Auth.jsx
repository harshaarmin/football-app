import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function Auth() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-[#07111F] overflow-hidden relative">

            {/* Background Glow */}
            <div className="absolute top-[-200px] left-[-200px] h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[130px]" />

            <div className="absolute bottom-[-180px] right-[-150px] h-[380px] w-[380px] rounded-full bg-blue-700/20 blur-[140px]" />

            <div className="absolute top-[40%] right-[18%] h-[220px] w-[220px] rounded-full bg-sky-400/10 blur-[120px]" />

            <div className="relative z-10 flex min-h-screen items-center justify-center p-6">

                {isLogin ? (
                    <Login switchScreen={() => setIsLogin(false)} />
                ) : (
                    <Register switchScreen={() => setIsLogin(true)} />
                )}

            </div>

        </div>
    );
}

export default Auth;