import XLSX from 'xlsx';
import fs from 'fs';

const filename = 'Ventas 5inco indumentaria.xlsx';

if (!fs.existsSync(filename)) {
  console.error('File not found:', filename);
  process.exit(1);
}

const workbook = XLSX.readFile(filename);
console.log('Sheets found:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n--- Data from sheet: ${sheetName} ---`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Print headers
  if (data.length > 0) {
    console.log('Headers:', data[0]);
    // Print first 3 data rows
    data.slice(1, 4).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });
    console.log(`Total rows in ${sheetName}: ${data.length - 1}`);
  }
});
