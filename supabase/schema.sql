-- Admin users table
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('chairman', 'deputy_chairman', 'cfo', 'marketing_manager', 'co_secretary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Associate members table
CREATE TABLE associate_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  school TEXT NOT NULL,
  district TEXT NOT NULL,
  province TEXT NOT NULL,
  who_are_you TEXT NOT NULL,
  commerce_stream BOOLEAN DEFAULT FALSE,
  actively_participate BOOLEAN DEFAULT FALSE,
  how_heard TEXT,
  project_ideas TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  membership_card_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- School registrations table
CREATE TABLE school_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  commerce_society_name TEXT NOT NULL,
  commerce_society_email TEXT NOT NULL,
  master_in_charge_name TEXT NOT NULL,
  master_in_charge_email TEXT NOT NULL,
  master_in_charge_phone TEXT NOT NULL,
  student_president_name TEXT NOT NULL,
  student_president_email TEXT NOT NULL,
  student_president_phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product orders table
CREATE TABLE product_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  size TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('delivery', 'event_pickup')),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance ledger table
CREATE TABLE finance_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  recorded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site analytics table
CREATE TABLE site_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  session_id TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert admin users
INSERT INTO admin_users (email, name, role) VALUES
('chairman@aisca.lk', 'Isira Chirayu', 'chairman'),
('sathis@aisca.lk', 'Sathis Gangaboda', 'deputy_chairman'),
('risindi@aisca.lk', 'Risindi Gunesekara', 'deputy_chairman'),
('okitha@aisca.lk', 'Okitha Wijesiri', 'cfo'),
('imesh@aisca.lk', 'Imesh Weerasinghe', 'cfo'),
('janiru@aisca.lk', 'Janiru Wijekoon', 'co_secretary'),
('gavin@aisca.lk', 'Gavin Aluwihare', 'marketing_manager'),
('kovida@aisca.lk', 'Kovida Guwani', 'marketing_manager');

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE associate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only access)
CREATE POLICY "Admin full access" ON associate_members FOR ALL USING (true);
CREATE POLICY "Admin full access" ON school_registrations FOR ALL USING (true);
CREATE POLICY "Admin full access" ON product_orders FOR ALL USING (true);
CREATE POLICY "Admin full access" ON finance_ledger FOR ALL USING (true);
CREATE POLICY "Admin full access" ON site_analytics FOR ALL USING (true);

-- Contact messages table
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON contact_messages FOR ALL USING (true);
