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

async function checkNewTables() {
  console.log("\n=== CHECKING NEW TABLES ===");
  
  // 1. check contact_messages
  const { data: contactData, error: contactError } = await supabase
    .from('contact_messages')
    .select('*')
    .limit(5);
    
  if (contactError) {
    console.log("❌ Table 'contact_messages' does NOT exist or query failed:", contactError.message);
  } else {
    console.log("✅ Table 'contact_messages' exists! Found rows:", contactData.length);
    console.log(contactData);
  }
  
  // 2. check newsletter_subscribers
  const { data: newsData, error: newsError } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .limit(5);
    
  if (newsError) {
    console.log("❌ Table 'newsletter_subscribers' does NOT exist or query failed:", newsError.message);
  } else {
    console.log("✅ Table 'newsletter_subscribers' exists! Found rows:", newsData.length);
    console.log(newsData);
  }
}

checkNewTables();
