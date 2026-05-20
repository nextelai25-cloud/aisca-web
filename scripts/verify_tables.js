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
  console.error("Missing Supabase credentials in parsed env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TABLES = [
  'admin_users',
  'associate_members',
  'school_registrations',
  'product_orders',
  'finance_ledger',
  'site_analytics'
];

async function verifyAll() {
  console.log("\n=== VERIFYING DATABASE TABLES ===");
  for (const table of TABLES) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log(`❌ Table '${table}' does NOT exist or failed to query:`, error.message);
    } else {
      console.log(`✅ Table '${table}' exists successfully! Count: ${count}`);
    }
  }
  
  console.log("\n=== VERIFYING ADMIN USERS ===");
  const { data: admins, error: adminError } = await supabase
    .from('admin_users')
    .select('email, name, role, id');
    
  if (adminError) {
    console.log("❌ Failed to query admin_users table:", adminError.message);
  } else {
    console.log(`✅ Successfully queried 'admin_users' table. Row count: ${admins.length}`);
    admins.forEach((admin, i) => {
      console.log(`[Admin ${i+1}] ${admin.name} (${admin.email}) - Role: ${admin.role}, UUID: ${admin.id}`);
    });
  }
  
  console.log("\n=== VERIFYING AUTH USERS ===");
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.log("❌ Failed to list auth users:", authError.message);
  } else {
    console.log(`✅ Successfully fetched auth users. Count: ${users.length}`);
    users.forEach((u, i) => {
      console.log(`[Auth User ${i+1}] Email: ${u.email}, ID: ${u.id}, Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}`);
    });
  }
}

verifyAll();
