const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyPhase2() {
  console.log("=== VERIFYING PHASE 2 DATABASE ENTRIES ===\n");

  // 1. Verify Site Analytics
  const { data: analytics, error: analyticsErr } = await supabaseAdmin
    .from('site_analytics')
    .select('*')
    .eq('session_id', 'test_session_99999');
  
  if (analyticsErr) {
    console.error("❌ Analytics verification failed:", analyticsErr.message);
  } else if (analytics.length > 0) {
    console.log(`✅ Site Analytics entry verified! page: '${analytics[0].page}', device: '${analytics[0].device}'`);
  } else {
    console.warn("⚠️ Analytics entry not found.");
  }

  // 2. Verify School Registration
  const { data: schools, error: schoolErr } = await supabaseAdmin
    .from('school_registrations')
    .select('*')
    .eq('school_name', 'Mock Science College');
  
  if (schoolErr) {
    console.error("❌ School registration verification failed:", schoolErr.message);
  } else if (schools.length > 0) {
    console.log(`✅ School Registration verified! id: '${schools[0].id}', MIC: '${schools[0].master_in_charge_name}'`);
  } else {
    console.warn("⚠️ School registration entry not found.");
  }

  // 3. Verify Product Order
  const { data: orders, error: orderErr } = await supabaseAdmin
    .from('product_orders')
    .select('*')
    .eq('customer_name', 'Mock Buyer');
  
  if (orderErr) {
    console.error("❌ Product order verification failed:", orderErr.message);
  } else if (orders.length > 0) {
    console.log(`✅ Product Order verified! order_no: '${orders[0].order_number}', total: LKR ${orders[0].total_amount}`);
  } else {
    console.warn("⚠️ Product order entry not found.");
  }

  // 4. Verify Associate Member & Membership Card
  const { data: associates, error: associateErr } = await supabaseAdmin
    .from('associate_members')
    .select('*')
    .eq('full_name', 'Mock Associate Tester');
  
  if (associateErr) {
    console.error("❌ Associate verification failed:", associateErr.message);
  } else if (associates.length > 0) {
    console.log(`\n✅ Associate Member verified! id: '${associates[0].id}', membership_no: '${associates[0].membership_number}'`);
    console.log(`📂 Membership Card URL linked: '${associates[0].membership_card_url}'`);
    
    // Check if the file actually exists in Supabase Storage
    const fileName = `membership-cards/${associates[0].membership_number}.pdf`;
    const { data: list, error: listErr } = await supabaseAdmin.storage
      .from('aisca-assets')
      .list('membership-cards', {
        search: associates[0].membership_number
      });
      
    if (listErr) {
      console.error("❌ Storage verification failed:", listErr.message);
    } else if (list && list.length > 0) {
      console.log(`✅ Storage PDF verification verified! File found in bucket: 'membership-cards/${list[0].name}' (${list[0].metadata.size} bytes)`);
    } else {
      console.warn("⚠️ PDF not found in Supabase storage bucket.");
    }
  } else {
    console.warn("⚠️ Associate member entry not found.");
  }

  console.log("\n=== VERIFICATION COMPLETE ===");
}

verifyPhase2();
