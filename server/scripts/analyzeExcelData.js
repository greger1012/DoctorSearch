const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Read the Excel file
const excelPath = path.join(__dirname, '../../Greg Specifics.xlsx');

if (!fs.existsSync(excelPath)) {
  console.error('❌ Excel file not found at:', excelPath);
  console.log('Please make sure "Greg Specifics.xlsx" is in the project root directory.');
  process.exit(1);
}

console.log('📊 Analyzing Excel file: Greg Specifics.xlsx\n');

try {
  const workbook = XLSX.readFile(excelPath);
  
  console.log(`Found ${workbook.SheetNames.length} sheet(s):\n`);
  
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`${index + 1}. ${sheetName}`);
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Analyze each sheet
  workbook.SheetNames.forEach((sheetName, sheetIndex) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    
    console.log(`\n📋 Sheet: "${sheetName}"`);
    console.log(`   Rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`   Columns: ${Object.keys(data[0]).length}`);
      console.log(`\n   Column Names:`);
      Object.keys(data[0]).forEach((col, idx) => {
        console.log(`   ${idx + 1}. ${col}`);
      });
      
      // Show first few rows as sample
      console.log(`\n   Sample Data (first 3 rows):`);
      console.log('   ' + '-'.repeat(78));
      data.slice(0, 3).forEach((row, rowIdx) => {
        console.log(`\n   Row ${rowIdx + 1}:`);
        Object.entries(row).slice(0, 10).forEach(([key, value]) => {
          const displayValue = value !== null && value !== undefined 
            ? String(value).substring(0, 50) 
            : '(empty)';
          console.log(`     ${key}: ${displayValue}`);
        });
        if (Object.keys(row).length > 10) {
          console.log(`     ... and ${Object.keys(row).length - 10} more columns`);
        }
      });
      
      // Check for common doctor-related fields
      const allKeys = Object.keys(data[0]).map(k => k.toLowerCase());
      const doctorFields = ['npi', 'name', 'doctor', 'physician', 'provider', 'specialty', 'specialties'];
      const locationFields = ['location', 'address', 'city', 'phone', 'facility'];
      const medicalFields = ['condition', 'disease', 'procedure', 'treatment', 'diagnosis'];
      
      const foundDoctorFields = allKeys.filter(k => 
        doctorFields.some(df => k.includes(df))
      );
      const foundLocationFields = allKeys.filter(k => 
        locationFields.some(lf => k.includes(lf))
      );
      const foundMedicalFields = allKeys.filter(k => 
        medicalFields.some(mf => k.includes(mf))
      );
      
      console.log(`\n   Detected Field Types:`);
      if (foundDoctorFields.length > 0) {
        console.log(`   👨‍⚕️  Doctor/Provider fields: ${foundDoctorFields.join(', ')}`);
      }
      if (foundLocationFields.length > 0) {
        console.log(`   📍 Location fields: ${foundLocationFields.join(', ')}`);
      }
      if (foundMedicalFields.length > 0) {
        console.log(`   🏥 Medical fields: ${foundMedicalFields.join(', ')}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
  });
  
  // Summary
  console.log('\n\n📊 Summary:');
  console.log(`Total sheets: ${workbook.SheetNames.length}`);
  const totalRows = workbook.SheetNames.reduce((sum, sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return sum + data.length;
  }, 0);
  console.log(`Total rows across all sheets: ${totalRows}`);
  
  console.log('\n✅ Analysis complete!');
  console.log('\nNext steps:');
  console.log('1. Review the column names and sample data above');
  console.log('2. Determine how this data should enhance the search');
  console.log('3. Create an import script to integrate this data');
  
} catch (error) {
  console.error('❌ Error reading Excel file:', error.message);
  console.error(error.stack);
  process.exit(1);
}

