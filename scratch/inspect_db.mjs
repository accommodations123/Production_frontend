import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
  const tables = [
    'profiles', 'properties', 'events', 'buy_sell', 'travel_trips', 
    'stay_requests', 'jobs', 'connection_requests', 'connections', 
    'professional_profiles', 'reviews', 'professional_reviews', 'user_reviews', 
    'wishlists', 'favorites', 'educations', 'education'
  ];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(3);
    console.log(`Table: ${table} ->`, error ? `ERROR: ${error.message}` : `OK (${data?.length} rows)`);
    if (data && data.length > 0) {
      console.log(`  Columns for ${table}:`, Object.keys(data[0]));
      console.log(`  Sample row:`, JSON.stringify(data[0], null, 2));
    }
  }
}
inspect().catch(console.error);
