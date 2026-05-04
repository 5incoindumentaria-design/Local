import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

const PROFILES = {
  'Flor': 'da1a7dd7-f4d7-433f-93a7-347c7c9c246c',
  'Tomi': '90033256-3a24-41ce-8206-3740f4bbbf7d',
  'An, Ru, Em, Go.': 'dcaadd48-2549-46d8-b7e9-ec0852ad2026'
};

function excelDateToISO(serial) {
  if (!serial || isNaN(serial)) return new Date().toISOString();
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return date.toISOString();
}

async function upload() {
  console.log('Starting upload...');
  
  // 1. Ensure "Varios" product exists
  let { data: product } = await supabase.from('products').select('id').eq('name', 'Venta Manual (Excel)').maybeSingle();
  if (!product) {
    console.log('Creating Varios product...');
    const { data: newProd, error: prodErr } = await supabase.from('products').insert({
      name: 'Venta Manual (Excel)',
      price: 0,
      category: 'otros',
      gender: 'unisex',
      is_active: false
    }).select().single();
    if (prodErr) throw prodErr;
    product = newProd;
  }

  // 2. Ensure variant exists
  let { data: variant } = await supabase.from('product_variants').select('id').eq('product_id', product.id).maybeSingle();
  if (!variant) {
    const { data: newVar, error: varErr } = await supabase.from('product_variants').insert({
      product_id: product.id,
      stock: 9999
    }).select().single();
    if (varErr) throw varErr;
    variant = newVar;
  }

  const workbook = XLSX.readFile('Ventas 5inco indumentaria.xlsx');
  
  for (const sheetName of workbook.SheetNames) {
    const userId = PROFILES[sheetName];
    if (!userId) {
      console.log(`Skipping unknown sheet/user: ${sheetName}`);
      continue;
    }

    console.log(`Processing sheet: ${sheetName} for user: ${userId}`);
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Find header row (it contains 'Prenda' or 'Fecha')
    let headerIdx = -1;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      if (rawData[i].includes('Prenda') || rawData[i].includes('Fecha')) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) {
      console.log(`Could not find headers in ${sheetName}`);
      continue;
    }

    const headers = rawData[headerIdx];
    const dataRows = rawData.slice(headerIdx + 1);

    const salesToInsert = [];
    
    for (const row of dataRows) {
      const rowObj = {};
      headers.forEach((h, i) => { if (h) rowObj[h.trim()] = row[i]; });

      const total = parseFloat(rowObj['Total']) || 0;
      const prenda = rowObj['Prenda'] || 'Varios';
      const fecha = excelDateToISO(rowObj['Fecha']);

      if (total <= 0) continue;

      // Determine payment method
      let method = 'efectivo';
      if ((rowObj['Deb o cred.'] || 0) > 0) method = 'tarjeta';
      else if ((rowObj['Cta Cte.'] || 0) > 0) method = 'transferencia';

      salesToInsert.push({
        user_id: userId,
        total: total,
        payment_method: method,
        created_at: fecha,
        items: [{
          product_id: product.id,
          variant_id: variant.id,
          product_name: prenda,
          quantity: 1,
          unit_price: total,
          subtotal: total
        }]
      });
    }

    console.log(`Inserting ${salesToInsert.length} sales from ${sheetName}...`);
    
    // Batch insert (Supabase limit is usually 1000 rows, but we have items too)
    // We'll do it in chunks of 50 to be safe with the nested logic if we were using a function, 
    // but here we have to do separate inserts for sales and then items.
    
    for (let i = 0; i < salesToInsert.length; i += 100) {
      const chunk = salesToInsert.slice(i, i + 100);
      const { data: insertedSales, error: sErr } = await supabase.from('sales').insert(
        chunk.map(s => ({
          user_id: s.user_id,
          total: s.total,
          payment_method: s.payment_method,
          created_at: s.created_at
        }))
      ).select();

      if (sErr) {
        console.error('Error inserting sales:', sErr);
        continue;
      }

      const itemsToInsert = [];
      insertedSales.forEach((sale, idx) => {
        const originalSale = chunk[idx];
        originalSale.items.forEach(item => {
          itemsToInsert.push({
            ...item,
            sale_id: sale.id,
            created_at: sale.created_at
          });
        });
      });

      const { error: iErr } = await supabase.from('sale_items').insert(itemsToInsert);
      if (iErr) console.error('Error inserting sale items:', iErr);
    }
  }

  console.log('Upload finished!');
}

upload().catch(console.error);
