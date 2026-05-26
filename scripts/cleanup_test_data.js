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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupData() {
  console.log("=== CHECKING AUDIT / TEST DATA ===");

  // 1. associate_members
  const { data: assocCheck1 } = await serviceClient.from('associate_members').select('id, full_name, email').ilike('full_name', '%TEST%');
  const { data: assocCheck2 } = await serviceClient.from('associate_members').select('id, full_name, email').ilike('full_name', '%AUDIT%');
  const { data: assocCheck3 } = await serviceClient.from('associate_members').select('id, full_name, email').ilike('email', '%test.com%');
  const { data: assocCheck4 } = await serviceClient.from('associate_members').select('id, full_name, email').ilike('email', '%audit%');
  
  const assocIds = new Set();
  const assocRows = [];
  [...(assocCheck1 || []), ...(assocCheck2 || []), ...(assocCheck3 || []), ...(assocCheck4 || [])].forEach(r => {
    if (!assocIds.has(r.id)) {
      assocIds.add(r.id);
      assocRows.push(r);
    }
  });
  console.log(`Found ${assocRows.length} test associate_members rows.`);

  // 2. school_registrations
  const { data: schoolCheck1 } = await serviceClient.from('school_registrations').select('id, school_name').ilike('school_name', '%TEST%');
  const { data: schoolCheck2 } = await serviceClient.from('school_registrations').select('id, school_name').ilike('school_name', '%AUDIT%');
  const schoolRows = [];
  const schoolIds = new Set();
  [...(schoolCheck1 || []), ...(schoolCheck2 || [])].forEach(r => {
    if (!schoolIds.has(r.id)) {
      schoolIds.add(r.id);
      schoolRows.push(r);
    }
  });
  console.log(`Found ${schoolRows.length} test school_registrations rows.`);

  // 3. product_orders
  const { data: orderCheck1 } = await serviceClient.from('product_orders').select('id, customer_name').ilike('customer_name', '%Test%');
  const { data: orderCheck2 } = await serviceClient.from('product_orders').select('id, customer_name').ilike('customer_name', '%Audit%');
  const orderRows = [];
  const orderIds = new Set();
  [...(orderCheck1 || []), ...(orderCheck2 || [])].forEach(r => {
    if (!orderIds.has(r.id)) {
      orderIds.add(r.id);
      orderRows.push(r);
    }
  });
  console.log(`Found ${orderRows.length} test product_orders rows.`);

  // 4. site_analytics
  const { data: analyticsCheck1 } = await serviceClient.from('site_analytics').select('id, session_id').ilike('session_id', '%test%');
  const { data: analyticsCheck2 } = await serviceClient.from('site_analytics').select('id, session_id').ilike('session_id', '%audit%');
  const analyticsRows = [];
  const analyticsIds = new Set();
  [...(analyticsCheck1 || []), ...(analyticsCheck2 || [])].forEach(r => {
    if (!analyticsIds.has(r.id)) {
      analyticsIds.add(r.id);
      analyticsRows.push(r);
    }
  });
  console.log(`Found ${analyticsRows.length} test site_analytics rows.`);

  if (assocRows.length > 0 || schoolRows.length > 0 || orderRows.length > 0 || analyticsRows.length > 0) {
    console.log("\n=== EXECUTING CLEANUP ===");
    
    if (assocRows.length > 0) {
      const ids = assocRows.map(r => r.id);
      const { error } = await serviceClient.from('associate_members').delete().in('id', ids);
      if (error) console.log("Error deleting associate_members:", error.message);
      else console.log(`Deleted ${ids.length} associate_members rows.`);
    }

    if (schoolRows.length > 0) {
      const ids = schoolRows.map(r => r.id);
      const { error } = await serviceClient.from('school_registrations').delete().in('id', ids);
      if (error) console.log("Error deleting school_registrations:", error.message);
      else console.log(`Deleted ${ids.length} school_registrations rows.`);
    }

    if (orderRows.length > 0) {
      const ids = orderRows.map(r => r.id);
      const { error } = await serviceClient.from('product_orders').delete().in('id', ids);
      if (error) console.log("Error deleting product_orders:", error.message);
      else console.log(`Deleted ${ids.length} product_orders rows.`);
    }

    if (analyticsRows.length > 0) {
      const ids = analyticsRows.map(r => r.id);
      const { error } = await serviceClient.from('site_analytics').delete().in('id', ids);
      if (error) console.log("Error deleting site_analytics:", error.message);
      else console.log(`Deleted ${ids.length} site_analytics rows.`);
    }
    
    console.log("=== CLEANUP FINISHED ===");
  } else {
    console.log("No test/audit data found. Clean.");
  }
}

cleanupData();
