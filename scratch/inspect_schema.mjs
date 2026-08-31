import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspectSchema() {
  console.log('--- PROFILES ---');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(5);
  if (pErr) console.error('Profiles err:', pErr);
  else {
    console.log(`Profiles count: ${profiles?.length}`);
    if (profiles?.length) console.log('Profile columns:', Object.keys(profiles[0]));
    console.log('Sample profiles:', JSON.stringify(profiles, null, 2));
  }

  console.log('--- PROPERTIES ---');
  const { data: properties, error: propErr } = await supabase.from('properties').select('*').limit(2);
  if (propErr) console.error('Properties err:', propErr);
  else console.log('Properties columns:', properties?.[0] ? Object.keys(properties[0]) : 'empty');

  console.log('--- EVENTS ---');
  const { data: events, error: eErr } = await supabase.from('events').select('*').limit(5);
  if (eErr) console.error('Events err:', eErr);
  else {
    console.log(`Events count: ${events?.length}`);
    if (events?.length) {
      console.log('Events columns:', Object.keys(events[0]));
      console.log('Events images/banner:', events.map(e => ({ id: e.id, title: e.title, banner_image: e.banner_image, images: e.images, status: e.status })));
    }
  }

  console.log('--- BUY_SELL ---');
  const { data: buySell, error: bsErr } = await supabase.from('buy_sell').select('*').limit(5);
  if (bsErr) console.error('BuySell err:', bsErr);
  else {
    console.log(`BuySell count: ${buySell?.length}`);
    if (buySell?.length) {
      console.log('BuySell columns:', Object.keys(buySell[0]));
      console.log('BuySell sample:', JSON.stringify(buySell, null, 2));
    }
  }

  console.log('--- TRAVEL_TRIPS ---');
  const { data: trips, error: ttErr } = await supabase.from('travel_trips').select('*').limit(5);
  if (ttErr) console.error('Trips err:', ttErr);
  else {
    console.log(`Trips count: ${trips?.length}`);
    if (trips?.length) {
      console.log('Trips columns:', Object.keys(trips[0]));
      console.log('Trips sample:', JSON.stringify(trips, null, 2));
    }
  }
}
inspectSchema().catch(console.error);
