const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log("Reading env from:", envPath);
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
  console.error("Missing Supabase credentials in parsed env. Keys found:", Object.keys(env));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log("Checking tables in schema using supabase service key...");
  
  // Query actual rows from admin_users
  const { data: adminUsers, error: adminError } = await supabase
    .from('admin_users')
    .select('email, name, role');
    
  if (adminError) {
    console.log("admin_users query failed:", adminError.message);
  } else {
    console.log("admin_users rows successfully fetched:", adminUsers.length);
    adminUsers.forEach((u, i) => {
      console.log(`[Admin ${i+1}] Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });
  }
  
  // Try querying associate_members
  const { data: assocData, error: assocError } = await supabase
    .from('associate_members')
    .select('*');
    
  if (assocError) {
    console.log("associate_members query failed:", assocError.message);
  } else {
    console.log("associate_members exists! Count:", assocData.length);
  }
}

checkTables();
