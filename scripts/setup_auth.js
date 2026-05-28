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
  { email: 'marketing@aisca.lk', name: 'AISCA Marketing', role: 'marketing_manager' },
  { email: 'finance@aisca.lk', name: 'AISCA Finance', role: 'cfo' },
  { email: 'secretary@aisca.lk', name: 'AISCA Secretary', role: 'co_secretary' },
  { email: 'vishmi@aisca.lk', name: 'Vishmi Wijayamanne', role: 'co_secretary' }
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

  const emailsToKeep = ADMINS.map(a => a.email.toLowerCase());

  // Delete old auth users that are no longer admins
  for (const user of existingAuthUsers) {
    if (user.email.endsWith('@aisca.lk') && !emailsToKeep.includes(user.email.toLowerCase())) {
      console.log(`Deleting old auth user: ${user.email} (ID: ${user.id})...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Failed to delete auth user ${user.email}:`, deleteError.message);
      } else {
        console.log(`Successfully deleted auth user ${user.email}`);
      }
    }
  }

  // Delete old DB admins
  const { data: dbAdmins, error: dbFetchError } = await supabase
    .from('admin_users')
    .select('email');
  
  if (!dbFetchError && dbAdmins) {
    for (const dbAdmin of dbAdmins) {
      if (!emailsToKeep.includes(dbAdmin.email.toLowerCase())) {
        console.log(`Deleting old DB admin: ${dbAdmin.email}...`);
        const { error: dbDelErr } = await supabase.from('admin_users').delete().eq('email', dbAdmin.email);
        if (dbDelErr) {
          console.error(`Failed to delete old DB admin ${dbAdmin.email}:`, dbDelErr.message);
        }
      }
    }
  }

  for (const admin of ADMINS) {
    // 2. Ensure user exists in admin_users database table
    const { data: existingDbUsers, error: dbSelErr } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', admin.email);

    if (dbSelErr) {
      console.error(`Error checking DB for ${admin.email}:`, dbSelErr.message);
    }

    if (!existingDbUsers || existingDbUsers.length === 0) {
      console.log(`Inserting DB admin row for ${admin.email}...`);
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({ email: admin.email, name: admin.name, role: admin.role });
      
      if (insertError) {
        console.error(`Failed to insert DB admin ${admin.email}:`, insertError.message);
        continue;
      }
    } else {
      // Update name/role in DB in case they changed
      await supabase
        .from('admin_users')
        .update({ name: admin.name, role: admin.role })
        .eq('email', admin.email);
    }

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
    
    // 3. Link auth user ID to admin_users table
    if (userId) {
      console.log(`Linking auth user ID ${userId} to admin_users table for ${admin.email}...`);
      
      // Update admin_users table
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ id: userId })
        .eq('email', admin.email);
        
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
