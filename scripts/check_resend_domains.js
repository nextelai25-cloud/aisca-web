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

const resendKey = env.RESEND_API_KEY;
if (!resendKey) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

async function checkDomains() {
  console.log("Fetching domains from Resend API...");
  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API returned status ${response.status}: ${errText}`);
    }
    
    const data = await response.json();
    console.log("Domains response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to fetch Resend domains:", error.message);
  }
}

checkDomains();
