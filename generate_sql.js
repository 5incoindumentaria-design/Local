import XLSX from 'xlsx';
import fs from 'fs';

const PROFILES = {
  'Flor': 'da1a7dd7-f4d7-433f-93a7-347c7c9c246c',
  'Tomi': '90033256-3a24-41ce-8206-3740f4bbbf7d',
  'An, Ru, Em, Go.': 'dcaadd48-2549-46d8-b7e9-ec0852ad2026'
};

function excelDateToISO(serial) {
  if (!serial || isNaN(serial)) return new Date().toISOString();
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

function escape(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function generateSQL() {
  let sql = `-- SCRIPT DE CARGA DE VENTAS HISTORICAS\n\n`;
  
  // 1. Create Product
  sql += `-- 1. Crear producto base para ventas externas\n`;
  sql += `INSERT INTO public.products (id, name, price, category, gender, is_active, is_new) \n`;
  sql += `VALUES ('00000000-0000-0000-0000-000000000000', 'Venta Manual (Excel)', 0, 'otros', 'unisex', false, false)\n`;
  sql += `ON CONFLICT (id) DO NOTHING;\n\n`;

  // 2. Create Variant
  sql += `-- 2. Crear variante base\n`;
  sql += `INSERT INTO public.product_variants (id, product_id, stock) \n`;
  sql += `VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 9999)\n`;
  sql += `ON CONFLICT (id) DO NOTHING;\n\n`;

  const workbook = XLSX.readFile('Ventas 5inco indumentaria.xlsx');
  
  sql += `-- 3. Insertar ventas e items\n`;
  sql += `DO $$\nDECLARE\n  sale_id_var uuid;\nBEGIN\n`;

  for (const sheetName of workbook.SheetNames) {
    const userId = PROFILES[sheetName];
    if (!userId) continue;

    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    let headerIdx = -1;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      if (rawData[i].includes('Prenda') || rawData[i].includes('Fecha')) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) continue;

    const headers = rawData[headerIdx];
    const dataRows = rawData.slice(headerIdx + 1);

    for (const row of dataRows) {
      const rowObj = {};
      headers.forEach((h, i) => { if (h) rowObj[h.trim()] = row[i]; });

      const total = parseFloat(rowObj['Total']) || 0;
      const prenda = rowObj['Prenda'] || 'Varios';
      const fecha = excelDateToISO(rowObj['Fecha']);

      if (total <= 0) continue;

      let method = 'efectivo';
      if ((rowObj['Deb o cred.'] || 0) > 0) method = 'tarjeta';
      else if ((rowObj['Cta Cte.'] || 0) > 0) method = 'transferencia';

      sql += `  INSERT INTO public.sales (user_id, total, payment_method, created_at) \n`;
      sql += `  VALUES ('${userId}', ${total}, '${method}', '${fecha}') RETURNING id INTO sale_id_var;\n`;
      
      sql += `  INSERT INTO public.sale_items (sale_id, product_id, variant_id, product_name, quantity, unit_price, subtotal, created_at) \n`;
      sql += `  VALUES (sale_id_var, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', ${escape(prenda)}, 1, ${total}, ${total}, '${fecha}');\n\n`;
    }
  }

  sql += `END $$;`;
  
  fs.writeFileSync('cargar_ventas.sql', sql);
  console.log('SQL generated: cargar_ventas.sql');
}

generateSQL().catch(console.error);
