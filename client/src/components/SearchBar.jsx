
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="flex max-w-xl items-center gap-3 rounded-2xl bg-white p-2 text-slate-700 shadow-xl">
      <Search className="ml-2 shrink-0 text-slate-400" size={21} />

      <input
        aria-label="Search reports"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search a wallet, phone, bag..."
        className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <X size={17} />
        </button>
      )}
    </div>
  )
}
