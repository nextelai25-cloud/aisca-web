/**
 * AISCA Admin Dashboard
 * 
 * This layout provides the foundation for a future admin panel.
 * Currently a placeholder shell - will be expanded with:
 * - Authentication (Supabase Auth)
 * - Associate management
 * - School approvals
 * - Event & gallery uploads
 * - Announcement system
 * - Analytics dashboard
 * - Product management
 * - Member database
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar - future implementation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/[0.04] bg-black/80 backdrop-blur-xl hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <svg width="24" height="28" viewBox="0 0 72 86" fill="none">
              <path
                d="M36 2L4 18V44C4 62 18 78 36 84C54 78 68 62 68 44V18L36 2Z"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
                fill="rgba(255,255,255,0.02)"
              />
            </svg>
            <span className="text-sm font-medium tracking-wider">AISCA Admin</span>
          </div>

          <nav className="space-y-1">
            {[
              'Dashboard',
              'Associates',
              'Schools',
              'Events',
              'Gallery',
              'Products',
              'Orders',
              'Announcements',
              'Analytics',
              'Settings',
            ].map((item) => (
              <div
                key={item}
                className="px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
              >
                {item}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 p-6 md:p-10">
        <div className="glass-card p-8 text-center">
          <h1 className="text-headline text-white mb-4">Admin Dashboard</h1>
          <p className="text-body">
            The admin dashboard is currently under development. 
            This architecture is ready for future expansion with authentication, 
            data management, and analytics capabilities.
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
