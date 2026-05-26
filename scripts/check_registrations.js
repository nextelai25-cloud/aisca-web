const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error("Failed to read env file", e);
}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in parsed env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRegistrations() {
  console.log("\n=== CHECKING REGISTRATIONS ===");
  
  // 1. Check associate_members
  const { data: assocData, error: assocError } = await supabase
    .from('associate_members')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (assocError) {
    console.log("❌ Table 'associate_members' query failed:", assocError.message);
  } else {
    console.log("✅ Table 'associate_members' exists! Found recent rows:", assocData.length);
    assocData.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.full_name}, Email: ${row.email}, CreatedAt: ${row.created_at}, Status: ${row.status}`);
    });
  }
  
  // 2. Check school_registrations
  const { data: schoolData, error: schoolError } = await supabase
    .from('school_registrations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (schoolError) {
    console.log("❌ Table 'school_registrations' query failed:", schoolError.message);
  } else {
    console.log("✅ Table 'school_registrations' exists! Found recent rows:", schoolData.length);
    schoolData.forEach(row => {
      console.log(`- ID: ${row.id}, School Name: ${row.school_name}, Master Email: ${row.master_in_charge_email}, CreatedAt: ${row.created_at}, Status: ${row.status}`);
    });
  }
}

checkRegistrations();
