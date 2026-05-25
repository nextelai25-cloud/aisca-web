export const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#mission' },
  { label: 'Products', href: '#products' },
  { label: 'Officials', href: '#board' },
  { label: 'Gallery', href: '#gallery' },
] as const;

export const STATS = [
  {
    value: 2000,
    suffix: '+',
    label: 'Students Joined',
  },
  {
    value: 80,
    suffix: '+',
    label: 'Schools Joined',
  },
  {
    value: 1.5,
    suffix: '+',
    label: 'Years of Growth',
    isDecimal: true,
  },
] as const;

export const PROBLEMS = [
  {
    number: '01',
    title: 'No Inter School Networking',
    description:
      'Commerce society leaders and members had no structured platform to communicate, collaborate, or build meaningful relationships beyond their own school community.',
  },
  {
    number: '02',
    title: 'Missed Talent Opportunities',
    description:
      'Students with real commerce related skills, ideas, leadership qualities, and ambitions had no national level platform to showcase their talents.',
  },
] as const;

export const TRIPLE_MISSION = [
  {
    title: 'CENTRALIZE',
    description: 'Bringing scattered commerce societies together to form one strong, island-wide network.',
    icon: '◉',
  },
  {
    title: 'NETWORK',
    description: 'Creating direct lines of communication between Presidents, Secretaries, and future leaders across Sri Lanka.',
    icon: '⬡',
  },
  {
    title: 'SHOWCASE',
    description: 'Giving national-level recognition to the incredible talent hiding in schools across the country.',
    icon: '◈',
  },
] as const;

export const PRODUCTS = [
  {
    id: 'tshirt',
    name: 'AISCA Official T-Shirt Black Edition | Sizes: XS – XXXL',
    price: 'LKR 2,500',
    description: 'Heavyweight premium cotton blend tee with the embroidered AISCA crest. Worn by commerce society leaders across the island.',
    whatsappMessage: 'Hello AISCA, I would like to order the Official T-Shirt Black Edition.',
    img: '/products/AISCA T SHIRT.webp',
    status: 'Pre-order available soon',
  },
  {
    id: 'pin',
    name: 'AISCA Gold Blazer Pin',
    price: 'LKR 1,500',
    description: 'Die-cast metallic shield pin. A polished mark of community leadership for formal school academic assemblies.',
    whatsappMessage: 'Hello AISCA, I would like to order the Gold Blazer Pin.',
    img: '/products/Blazer pin.webp',
    status: 'Pre-order available soon',
  },
  {
    id: 'wristband',
    name: 'AISCA Wristband Black Edition',
    price: 'LKR 400',
    description: 'Matte black silicone band representing islandwide student unity across all 25 educational districts.',
    whatsappMessage: 'Hello AISCA, I would like to order the Wristband Black Edition.',
    img: '/products/Wrist band.webp',
    status: 'Pre-order available soon',
  },
] as const;

export const boardTeams = [
  {
    id: 'core',
    label: 'Core Leadership',
    members: [
      { initials: 'RG', name: 'Risindi Gunesekara', role: 'Deputy Chairwoman', photo: '/board/Risindi.webp' },
      { initials: 'SG', name: 'Sathis Gangaboda', role: 'Deputy Chairman', photo: '/board/Sathis.webp' },
      { initials: 'NB', name: 'Nipun Baranage', role: 'Co Secretary', photo: '/board/nipun.webp' },
      { initials: 'JW', name: 'Janiru Wijekoon', role: 'Co Secretary', photo: '/board/Janiru.webp' },
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing Team',
    members: [
      { initials: 'GA', name: 'Gavin Aluwihare', role: 'Marketing Manager', photo: '/board/Gavin.webp' },
      { initials: 'KN', name: 'Kaviesha Navinan', role: 'Marketing Manager', photo: '/board/Kaviesha.webp' },
      { initials: 'RP', name: 'Risandu Pethiyagoda', role: 'Digital Media Manager', photo: '/board/Risandu.webp' },
      { initials: 'KG', name: 'Kovida Guwani', role: 'Digital Media Manager', photo: '/board/Kovida.webp' },
    ]
  },
  {
    id: 'finance',
    label: 'Finance Team',
    members: [
      { initials: 'IW', name: 'Imeesh Weerasinghe', role: 'Chief Financial Officer', photo: '/board/imesh.webp' },
      { initials: 'OW', name: 'Okitha Wijesiri', role: 'Chief Financial Officer', photo: '/board/Okitha.webp' },
      { initials: 'TG', name: 'Thesanya Gamage', role: 'Finance Manager', photo: '/board/Thesanya.webp' },
      { initials: 'MR', name: 'Matheesha Ranasinghe', role: 'Finance Manager', photo: '/board/Matheesha.webp' },
    ]
  },
  {
    id: 'admin',
    label: 'Administration Team',
    members: [
      { initials: 'VW', name: 'Vishmi Wijayamanne', role: 'Administration Manager', photo: '/board/Vishmi.webp' },
      { initials: 'SG2', name: 'Sehandu Ganganath', role: 'Administration Manager', photo: '/board/Sehandu.webp' },
    ]
  },
  {
    id: 'hr',
    label: 'HR Team',
    members: [
      { initials: 'DS', name: 'Dileepa Sandaras', role: 'Human Resource Manager', photo: '/board/dileepa.webp' },
      { initials: 'JC', name: 'Jayan Chandupa', role: 'Human Resource Manager', photo: '/board/Jayan.webp' },
      { initials: 'CA', name: 'Chathuni Abeysinghe', role: 'Human Resource Manager', photo: '/board/Chathuni.webp' },
      { initials: 'ID', name: 'Imandi De Almeida', role: 'Human Resource Manager', photo: '/board/Imandi.webp' },
    ]
  },
  {
    id: 'operations',
    label: 'Operations Team',
    members: [
      { initials: 'UN', name: 'Udula Nimsara', role: 'Operations Manager', photo: '/board/Udula.webp' },
      { initials: 'SR', name: 'Sachindra Ratnayake', role: 'Operations Manager', photo: '/board/Sachindra.webp' },
      { initials: 'MS', name: 'Marisha Samaratunge', role: 'Operations Manager', photo: '/board/Marisha.jpg' },
    ]
  },
  {
    id: 'pr',
    label: 'Public Relations Team',
    members: [
      { initials: 'TI', name: 'Thulja Imandi', role: 'Public Relations Manager', photo: '/board/Thulja.webp' },
      { initials: 'PY', name: 'Pawani Yashoda', role: 'Public Relations Manager', photo: '/board/Pawani.webp' },
      { initials: 'RT', name: 'Ranuth Thewmitha', role: 'Public Relations Manager', photo: '/board/Ranuth.webp' },
      { initials: 'LR', name: 'Lehara Rajapakse', role: 'Public Relations Manager', photo: '/board/Lehara.webp' },
    ]
  },
  {
    id: 'events',
    label: 'Events Team',
    members: [
      { initials: 'ON', name: 'Ometh Nethdula', role: 'Event Manager', photo: '/board/Ometh.webp' },
      { initials: 'RD', name: 'Risin Dissanayake', role: 'Event Manager', photo: '/board/risin.webp' },
    ]
  },
];

export const SOCIAL_LINKS = [
  { platform: 'Instagram', url: 'https://www.instagram.com/aisca.lk/', icon: 'instagram' },
  { platform: 'Facebook', url: 'https://web.facebook.com/profile.php?id=61586432106049', icon: 'facebook' },
  { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/all-island-schools-commerce-association-aisca/', icon: 'linkedin' },
  { platform: 'WhatsApp', url: 'https://whatsapp.com/channel/0029Vak5dvg4IBhIrk1DsK3i', icon: 'whatsapp' },
] as const;

export const WHATSAPP_NUMBER = '94XXXXXXXXXX'; // Replace with actual AISCA WhatsApp number

export const CHAIRMAN = {
  name: 'Isira Chirayu',
  position: 'Chairman',
  message:
    'When we first thought of AISCA, the goal was simple: stop working in isolation. Every school in Sri Lanka has brilliant commerce students, but we were all disconnected. I wanted to build a space where a student from Kandy could collaborate with a student from Colombo, where we could share resources, host national events, and actually grow together. Today, that idea is a reality. We aren\'t just a network; we are the next generation of Sri Lanka\'s commerce sector, and we are starting right now.',
};

export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Puttalam', 'Kurunegala', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle',
] as const;

export const POSITIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Committee Member',
  'Member',
  'Other',
] as const;

// Legacy constants to support unused components
export const DEPUTY_CHAIRS: { name: string; position: string; message: string }[] = [];
export const BOARD_MEMBERS: { name: string; position: string }[] = [];


