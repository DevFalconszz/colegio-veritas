import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fhyxeduxnevlnsobacdt.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_XO-8GgvrQ5kfPkqQ8lNK8w_xabJcU6x";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
