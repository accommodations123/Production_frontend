import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('connection_requests').select('*').limit(1);
  console.log('connection_requests:', { data, error: error ? error.message : null });
  const { data: d2, error: e2 } = await supabase.from('connections').select('*').limit(1);
  console.log('connections:', { data: d2, error: e2 ? e2.message : null });
}
test();
