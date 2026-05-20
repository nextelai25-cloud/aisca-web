export default function AdminPage() {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Total Associates', value: '0', description: 'Registered members' },
        { label: 'Total Schools', value: '0', description: 'Registered societies' },
        { label: 'Pending Approvals', value: '0', description: 'Awaiting review' },
      ].map((stat) => (
        <div key={stat.label} className="glass-card p-6">
          <p className="text-caption text-xs mb-2">{stat.label}</p>
          <p className="text-3xl font-display font-bold text-white mb-1">{stat.value}</p>
          <p className="text-xs text-white/30">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
