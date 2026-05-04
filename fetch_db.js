import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function main() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  const { data: products } = await supabase.from('products').select('*');
  const { data: variants } = await supabase.from('product_variants').select('*, colors(name), sizes(name)');
  
  console.log(JSON.stringify({ profiles, products, variants }, null, 2));
}

main();
