// src/pages/Index.tsx (Improved Version with Demo Login)
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else if (data.session) navigate("/");
    setLoading(false);
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email for the confirmation link!");
    setLoading(false);
  };

  const handleDemoLogin = async (role: "Buyer" | "Admin") => {
    setDemoLoading(true);
    const demoEmail = role === "Buyer" ? "buyer@demo.com" : "admin@demo.com";
    const demoPassword = "demo123456";
    const profileRole = role === "Buyer" ? "Buyer" : "Platform Admin";

    try {
      // First, try to sign in
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      // If sign-in fails (user doesn't exist), create the user
      if (signInError) {
        console.log("Demo user doesn't exist, creating...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        });

        if (signUpError) {
          alert(`Failed to create demo user: ${signUpError.message}`);
          setDemoLoading(false);
          return;
        }

        signInData = signUpData;
      }

      // Now update/insert the profile with the correct role
      if (signInData?.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            user_id: signInData.user.id,
            role: profileRole,
          }, {
            onConflict: "user_id"
          });

        if (profileError) {
          console.error("Profile update error:", profileError);
        }

        // Navigate to the appropriate dashboard
        navigate(role === "Buyer" ? "/dashboard" : "/admin");
      }
    } catch (error) {
      console.error("Demo login error:", error);
      alert("An error occurred during demo login.");
    }

    setDemoLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-green-400">
          CarbonTrust AI
        </h1>
        <p className="text-center text-gray-400">
          Sign in to access your dashboard
        </p>
        <form className="space-y-6">
          <div>
            <input
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
              type="email"
              placeholder="Your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
              type="password"
              placeholder="Your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? <span>Loading...</span> : <span>Login</span>}
            </button>
            <button
              onClick={handleSignUp}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? <span>...</span> : <span>Sign Up</span>}
            </button>
          </div>
        </form>

        {/* Demo Login Section */}
        <div className="pt-6 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm mb-4">
            Quick Demo Access (For Presentations)
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleDemoLogin("Buyer")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded shadow-lg transition-all"
              disabled={demoLoading}
            >
              {demoLoading ? <span>Loading...</span> : <span>🛒 Demo Buyer Login</span>}
            </button>
            <button
              onClick={() => handleDemoLogin("Admin")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded shadow-lg transition-all"
              disabled={demoLoading}
            >
              {demoLoading ? <span>Loading...</span> : <span>👨‍💼 Demo Admin Login</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
