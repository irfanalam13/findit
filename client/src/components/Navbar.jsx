
import { Package, Plus } from 'lucide-react'

export default function Navbar({ onReportClick }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Package size={23} />
          </span>

          <span>
            <span className="block text-xl font-bold tracking-tight">
              FindIt<span className="text-indigo-600">.</span>
            </span>
            <span className="block text-xs text-slate-500">
              Lost & Found Community
            </span>
          </span>
        </a>

        <button
          onClick={onReportClick}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Report an item</span>
          <span className="sm:hidden">Report</span>
        </button>
      </div>
    </header>
  )
}
