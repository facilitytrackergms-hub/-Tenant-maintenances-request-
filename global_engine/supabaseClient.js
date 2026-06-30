
/* ================================================================
   NAME     : app_controls/supabaseClient.js
   PURPOSE  : Securely initializes the Supabase client.
   ================================================================ */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://yzsjkntfgiugyduxizzo.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_TKkIh2e_DHkJdhXiMq9lPA_k2jeVcug'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

