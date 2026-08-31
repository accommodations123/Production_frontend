import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkReviews() {
  const { data: erData, error: erErr } = await supabase.from('event_reviews').select('*').limit(3);
  console.log('event_reviews:', erErr ? erErr.message : `OK (${erData.length} rows)`);

  const { data: prData, error: prErr } = await supabase.from('profile_reviews').select('*').limit(3);
  console.log('profile_reviews:', prErr ? prErr.message : `OK (${prData.length} rows)`);
}
checkReviews();
