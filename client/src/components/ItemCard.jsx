
import { CalendarDays, MapPin, Package, ArrowRight } from 'lucide-react'

export default function ItemCard({ item, onView }) {
  const isLost = item.type === 'lost'

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-slate-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package size={48} className="text-slate-300" />
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
            isLost
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {item.type} item
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">{item.title}</h3>
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">
            {item.category}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
          {item.description}
        </p>

        <div className="mt-4 space-y-2 text-xs text-slate-500">
          <p className="flex items-center gap-2">
            <MapPin size={15} />
            <span className="truncate">{item.location}</span>
          </p>

          <p className="flex items-center gap-2">
            <CalendarDays size={15} />
            {new Date(item.dateOccurred).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <button
          onClick={() => onView(item)}
          className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-indigo-600"
        >
          View report <ArrowRight size={17} />
        </button>
      </div>
    </article>
  )
}
