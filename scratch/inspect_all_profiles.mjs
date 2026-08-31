import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspectProfiles() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  console.log('Error:', error);
  console.log('Total profiles:', profiles?.length);
  if (profiles) {
    profiles.forEach((p, idx) => {
      console.log(`\n=== PROFILE ${idx + 1} (${p.id}) ===`);
      console.log(JSON.stringify(p, null, 2));
    });
  }
}
inspectProfiles().catch(console.error);
