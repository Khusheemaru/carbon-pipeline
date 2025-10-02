// src/context/AuthContext.tsx
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

// Define the shape of our Profile data
interface Profile {
  role: "Buyer" | "Aggregator" | "Platform Admin";
  // You can add other profile fields here later, like company_name
}

// Define the shape of the context's value
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session Error:", sessionError);
      } else if (session) {
        setUser(session.user);
        setSession(session);

        // Fetch the user's role from the 'profiles' table
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(userProfile);
        }
      }
      setLoading(false);
    };

    fetchData();

    // Listen for changes in authentication state
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Re-fetch profile when auth state changes (e.g., on login/logout)
        fetchData();
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = { session, user, profile, loading };

  // Don't render the rest of the app until the initial auth check is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to easily use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
