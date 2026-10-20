
export default function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>

      <span className={`rounded-xl p-3 ${color}`}>
        <Icon size={23} />
      </span>
    </div>
  )
}
