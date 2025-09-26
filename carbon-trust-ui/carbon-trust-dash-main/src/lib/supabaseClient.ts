// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bmguahzcrtlihhavtenu.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZ3VhaHpjcnRsaWhoYXZ0ZW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTg3NTcsImV4cCI6MjA3Mzc5NDc1N30.8hNgvGOaokaqSIV9YEnexj3ra1yQrhuHxG7LW_wllfs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
