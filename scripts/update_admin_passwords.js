const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

const ADMINS = [
  { email: 'chairman@aisca.lk', name: 'Isira Chirayu' },
  { email: 'sathis@aisca.lk', name: 'Sathis Gangaboda' },
  { email: 'risindi@aisca.lk', name: 'Risindi Gunesekara' },
  { email: 'okitha@aisca.lk', name: 'Okitha Wijesiri' },
  { email: 'imesh@aisca.lk', name: 'Imesh Weerasinghe' },
  { email: 'janiru@aisca.lk', name: 'Janiru Wijekoon' },
  { email: 'gavin@aisca.lk', name: 'Gavin Aluwihare' },
  { email: 'kovida@aisca.lk', name: 'Kovida Guwani' }
];

function generatePassword() {
  // Generates a 16-character secure random password with letters, numbers, and symbols
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  let password = '';
  // Ensure at least one lowercase, uppercase, number, and special character
  password += 'abcdefghijklmnopqrstuvwxyz'[crypto.randomInt(26)];
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.randomInt(26)];
  password += '0123456789'[crypto.randomInt(10)];
  password += '!@#$%^&*()_+-='[crypto.randomInt(14)];
  for (let i = 4; i < 16; i++) {
    password += chars[crypto.randomInt(chars.length)];
  }
  // Shuffle the password
  return password.split('').sort(() => crypto.randomBytes(1)[0] - 128).join('');
}

async function updatePasswords() {
  console.log("=== UPDATING ADMIN PASSWORDS ===");
  
  // Fetch existing auth users to match IDs
  const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list auth users:", listError.message);
    process.exit(1);
  }

  const credentials = [];

  for (const admin of ADMINS) {
    const userObj = users.find(u => u.email.toLowerCase() === admin.email.toLowerCase());
    if (!userObj) {
      console.log(`❌ Auth user not found for ${admin.email}`);
      continue;
    }

    const newPass = generatePassword();
    console.log(`Updating password for ${admin.email} (ID: ${userObj.id})...`);
    
    const { data: updateData, error: updateError } = await serviceClient.auth.admin.updateUserById(
      userObj.id,
      { password: newPass }
    );

    if (updateError) {
      console.log(`❌ Failed to update ${admin.email}:`, updateError.message);
    } else {
      console.log(`✅ Updated password for ${admin.email}`);
      
      // Test log in
      const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
        email: admin.email,
        password: newPass
      });

      if (loginError) {
        console.log(`❌ Verification failed for ${admin.email}:`, loginError.message);
      } else {
        console.log(`✅ Verified login for ${admin.email}!`);
        await anonClient.auth.signOut();
        credentials.push({
          email: admin.email,
          name: admin.name,
          password: newPass
        });
      }
    }
  }

  // Save the credentials to a markdown file
  const credsDir = path.join(__dirname, '..', '..', 'credentials');
  if (!fs.existsSync(credsDir)) {
    fs.mkdirSync(credsDir, { recursive: true });
  }
  
  const credsPath = path.join(credsDir, 'admin_credentials.md');
  
  let mdContent = `# AISCA Admin Credentials (Generated ${new Date().toLocaleDateString()})\n\n`;
  mdContent += "| Name | Email | Secure Password |\n";
  mdContent += "| --- | --- | --- |\n";
  for (const c of credentials) {
    mdContent += `| ${c.name} | ${c.email} | \`${c.password}\` |\n`;
  }
  
  fs.writeFileSync(credsPath, mdContent, 'utf8');
  console.log(`\n🔒 Credentials saved securely to: ${credsPath}`);
}

updatePasswords();
