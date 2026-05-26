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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function testFlow() {
  console.log("=== TESTING CONTACT MESSAGES ===");
  const testMsg = {
    name: 'Audit Test User',
    email: 'audit-test@example.com',
    subject: 'Production Audit',
    message: 'Testing database tables'
  };

  // Try inserting with anon key
  console.log("1. Inserting contact_message with anon client...");
  const { data: anonInsertData, error: anonInsertErr } = await anonClient
    .from('contact_messages')
    .insert([testMsg])
    .select();
    
  if (anonInsertErr) {
    console.log("❌ Anon insert failed (might be expected if RLS blocks write without policy):", anonInsertErr.message);
  } else {
    console.log("✅ Anon insert succeeded! ID:", anonInsertData[0]?.id);
  }

  // Try querying with anon key
  console.log("2. Querying contact_messages with anon client...");
  const { data: anonSelectData, error: anonSelectErr } = await anonClient
    .from('contact_messages')
    .select('*');
    
  if (anonSelectErr) {
    console.log("❌ Anon select failed:", anonSelectErr.message);
  } else {
    console.log(`✅ Anon select succeeded! Found ${anonSelectData.length} rows.`);
  }

  // Clean up any test records
  console.log("3. Deleting test contact_messages with service client...");
  const { data: delData, error: delErr } = await serviceClient
    .from('contact_messages')
    .delete()
    .eq('email', 'audit-test@example.com');
  if (delErr) {
    console.log("❌ Cleanup failed:", delErr.message);
  } else {
    console.log("✅ Cleanup succeeded.");
  }


  console.log("\n=== TESTING NEWSLETTER SUBSCRIBERS ===");
  const testSub = {
    email: 'audit-test-sub@example.com',
    name: 'Audit Sub'
  };

  // Try inserting with anon key
  console.log("1. Inserting newsletter_subscriber with anon client...");
  const { data: anonSubInsert, error: anonSubInsertErr } = await anonClient
    .from('newsletter_subscribers')
    .insert([testSub])
    .select();
    
  if (anonSubInsertErr) {
    console.log("❌ Anon sub insert failed:", anonSubInsertErr.message);
  } else {
    console.log("✅ Anon sub insert succeeded! ID:", anonSubInsert[0]?.id);
  }

  // Try querying with anon key
  console.log("2. Querying newsletter_subscribers with anon client...");
  const { data: anonSubSelect, error: anonSubSelectErr } = await anonClient
    .from('newsletter_subscribers')
    .select('*');
    
  if (anonSubSelectErr) {
    console.log("❌ Anon sub select failed:", anonSubSelectErr.message);
  } else {
    console.log(`✅ Anon sub select succeeded! Found ${anonSubSelect.length} rows.`);
  }

  // Clean up
  console.log("3. Deleting test subscriber with service client...");
  const { error: delSubErr } = await serviceClient
    .from('newsletter_subscribers')
    .delete()
    .eq('email', 'audit-test-sub@example.com');
  if (delSubErr) {
    console.log("❌ Sub cleanup failed:", delSubErr.message);
  } else {
    console.log("✅ Sub cleanup succeeded.");
  }
}

testFlow();
