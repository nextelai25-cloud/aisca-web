const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';
try { envContent = fs.readFileSync(envPath, 'utf8'); } catch (e) {}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) { value = value.slice(1, -1); }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, supabaseAnonKey);

const ADMINS = [
  'chairman@aisca.lk',
  'sathis@aisca.lk',
  'risindi@aisca.lk',
  'okitha@aisca.lk',
  'imesh@aisca.lk',
  'janiru@aisca.lk',
  'gavin@aisca.lk',
  'kovida@aisca.lk'
];

const DEFAULT_PASSWORD = 'AISCA@2026!';

async function testLogins() {
  console.log("=== TESTING ADMIN LOGINS WITH DEFAULT PASSWORD ===");
  for (const email of ADMINS) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password: DEFAULT_PASSWORD
      });
      if (error) {
        console.log(`❌ ${email}: Login failed with default password. Error:`, error.message);
      } else {
        console.log(`⚠️ ${email}: Login succeeded! STILL USING DEFAULT PASSWORD. User ID:`, data.user?.id);
        // Sign out to clean up session
        await client.auth.signOut();
      }
    } catch (err) {
      console.log(`❌ ${email}: Unexpected error:`, err.message);
    }
  }
}

testLogins();
