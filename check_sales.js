import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data: sales, error: sErr, count } = await supabase
    .from('sales')
    .select('*', { count: 'exact' });
  
  console.log('Sales count:', sales?.length, 'Error:', sErr);
  if (sales?.length > 0) {
    console.log('First 3 sales:', JSON.stringify(sales.slice(0, 3), null, 2));
  }

  const { data: items, error: iErr } = await supabase
    .from('sale_items')
    .select('*', { count: 'exact' });
  
  console.log('Sale items count:', items?.length, 'Error:', iErr);

  // Check if the product exists
  const { data: prod } = await supabase
    .from('products')
    .select('id, name')
    .eq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('Excel product:', prod);

  // Check RLS policies
  const { data: allSales, error: allErr } = await supabase.rpc('get_all_sales_count');
  console.log('RPC result:', allSales, 'Error:', allErr);
}

check();
