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

const ADMINS = [
  { email: 'chairman@aisca.lk', name: 'Isira Chirayu', role: 'chairman' },
  { email: 'sathis@aisca.lk', name: 'Sathis Gangaboda', role: 'deputy_chairman' },
  { email: 'risindi@aisca.lk', name: 'Risindi Gunesekara', role: 'deputy_chairman' },
  { email: 'okitha@aisca.lk', name: 'Okitha Wijesiri', role: 'cfo' },
  { email: 'imesh@aisca.lk', name: 'Imesh Weerasinghe', role: 'cfo' },
  { email: 'janiru@aisca.lk', name: 'Janiru Wijekoon', role: 'co_secretary' },
  { email: 'gavin@aisca.lk', name: 'Gavin Aluwihare', role: 'marketing_manager' },
  { email: 'kovida@aisca.lk', name: 'Kovida Guwani', role: 'marketing_manager' }
];

const TEMP_PASSWORD = 'AISCA@2026!';

async function setupAuth() {
  console.log("Starting Supabase Auth setup for admins...");
  
  // 1. Fetch all existing auth users first (for idempotency and robust linking)
  let existingAuthUsers = [];
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.warn("Could not list auth users (might be okay if none exist):", listError.message);
    } else {
      existingAuthUsers = users || [];
      console.log(`Found ${existingAuthUsers.length} existing auth users.`);
    }
  } catch (err) {
    console.warn("Could not list auth users:", err.message);
  }

  for (const admin of ADMINS) {
    let userId = null;
    
    // Check if user already exists in auth.users
    const existing = existingAuthUsers.find(u => u.email.toLowerCase() === admin.email.toLowerCase());
    
    if (existing) {
      console.log(`Auth user already exists for ${admin.email}. ID: ${existing.id}`);
      userId = existing.id;
    } else {
      // Create new auth user
      console.log(`Creating auth user for ${admin.email}...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: TEMP_PASSWORD,
        email_confirm: true,
        user_metadata: { name: admin.name, role: admin.role }
      });
      
      if (error) {
        console.error(`Failed to create auth user for ${admin.email}:`, error.message);
        continue;
      }
      
      userId = data.user.id;
      console.log(`Successfully created auth user for ${admin.email}. ID: ${userId}`);
    }
    
    // 2. Link auth user ID to admin_users table
    if (userId) {
      console.log(`Linking auth user ID ${userId} to admin_users table for ${admin.email}...`);
      
      // Update admin_users table
      const { data: updateResult, error: updateError } = await supabase
        .from('admin_users')
        .update({ id: userId })
        .eq('email', admin.email)
        .select();
        
      if (updateError) {
        console.error(`Failed to link ${admin.email} in admin_users:`, updateError.message);
      } else {
        console.log(`Successfully linked ${admin.email} in admin_users table!`);
      }
    }
  }
  
  console.log("Auth setup completed!");
}

setupAuth();
