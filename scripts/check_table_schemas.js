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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchemas() {
  console.log("=== INSPECTING COLUMNS VIA RPC OR SYSTEM TABLES ===");
  
  // We can query information_schema columns using sql query, but since we are using Supabase Client,
  // we can use supabase.rpc or a direct query to postgres if we have a custom function.
  // If we don't have a custom function, we can query information_schema through postgrest if allowed,
  // or we can test insertions with missing fields to see which fields are required.
  // Actually, we can check the error messages and see what columns are defined.
  // Let's run a query to see if we can get table columns from pg_attribute/information_schema via postgrest.
  
  const { data, error } = await supabase.from('associate_members').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("associate_members columns present in row:", Object.keys(data[0]));
  } else {
    console.log("No rows in associate_members to inspect columns.");
  }
  
  const { data: schoolData, error: schoolErr } = await supabase.from('school_registrations').select('*').limit(1);
  if (schoolData && schoolData.length > 0) {
    console.log("school_registrations columns present in row:", Object.keys(schoolData[0]));
  } else {
    console.log("No rows in school_registrations to inspect columns.");
  }
}

checkSchemas();
