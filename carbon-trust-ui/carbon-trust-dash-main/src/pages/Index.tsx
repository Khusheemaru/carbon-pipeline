// src/pages/Index.tsx (Improved Version)
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (event: React.FormEvent) => {
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

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email for the confirmation link!");
    setLoading(false);
  };

  // Demo Login Handler (auto-provisions if user doesn't exist)
  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    const demoPassword = "demoPassword123!"; // Strong enough for Supabase
    
    // First try to login
    let { data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (error && error.message.includes("Invalid login")) {
      // User likely doesn't exist, try signing up
      console.log(`Demo user ${demoEmail} not found, creating one...`);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email: demoEmail, 
        password: demoPassword 
      });
      
      if (signUpError) {
        alert(`Auto-provisioning failed: ${signUpError.message}`);
      } else {
        // Assign role if it's the admin demo user
        if (signUpData.user && demoEmail === "admin@carbontrust.com") {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({ user_id: signUpData.user.id, role: "Platform Admin" });
          if (profileError) {
             console.error("Failed to assign Platform Admin role:", profileError);
          }
        }

        // Signed up successfully. 
        if (signUpData.session) {
           navigate("/");
        } else {
           // Some setups require a manual sign in after sign up if autoConfirm is off
           const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: demoEmail,
              password: demoPassword,
           });
           if (signInData.session) navigate("/");
           else alert("Created demo user but couldn't log in automatically. Check Supabase settings.");
        }
      }
    } else if (error) {
       alert(`Demo login failed: ${error.message}`);
    } else if (data.session) {
      navigate("/");
    }
    setLoading(false);
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
              type="button"
            >
              {loading ? <span>Loading...</span> : <span>Login</span>}
            </button>
            <button
              onClick={handleSignUp}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
              type="button"
            >
              {loading ? <span>...</span> : <span>Sign Up</span>}
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-700 space-y-4">
             <p className="text-center text-xs text-gray-500 uppercase tracking-wider">Fast Access (Presentation Mode)</p>
             <button
                onClick={() => handleDemoLogin("demo@carbontrust.com")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors"
                disabled={loading}
                type="button"
              >
                {loading ? <span>...</span> : <span>Demo Login (Buyer)</span>}
              </button>
              <button
                onClick={() => handleDemoLogin("admin@carbontrust.com")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors"
                disabled={loading}
                type="button"
              >
                {loading ? <span>...</span> : <span>Demo Login (Admin)</span>}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
