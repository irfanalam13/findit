
import { useState } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import { createItem } from '../features/items/services/itemService'
import useApi from '../hooks/useApi'
import ReportAccess from './ReportAccess';

const categories = [
  'electronics',
  'wallet',
  'keys',
  'documents',
  'clothing',
  'bags',
  'accessories',
  'other',
]

const emptyForm = () => ({
  title: '',
  description: '',
  type: 'lost',
  category: 'electronics',
  color: '',
  location: '',
  dateOccurred: new Date().toISOString().slice(0, 10),
})

export default function ItemFormModal({ onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm)

  const { execute, loading, error } = useApi()

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const result = await execute(
      () => createItem(form),
      {
        successMessage: 'Item reported successfully!',
        errorMessage: 'Could not report the item.',
      }
    )

    if (!result) return

    onCreated()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="report-title" className="text-2xl font-bold">
              Report an item
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Help someone identify a lost or found belonging.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close report form"
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        <ReportAccess>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {['lost', 'found'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField('type', type)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize ${
                  form.type === type
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {type} item
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium">
            Item name *
            <input
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Black leather wallet"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm font-medium">
            Description *
            <textarea
              required
              maxLength={2000}
              rows={3}
              value={form.description}
              onChange={(e) =>
                updateField('description', e.target.value)
              }
              placeholder="Describe the item's appearance..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Category *
              <select
                required
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 capitalize"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Color
              <input
                maxLength={50}
                value={form.color}
                onChange={(e) => updateField('color', e.target.value)}
                placeholder="e.g. Black"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
              />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Location *
            <input
              required
              maxLength={200}
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="e.g. College library"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>

          <label className="block text-sm font-medium">
            Date lost or found *
            <input
              type="date"
              required
              max={new Date().toISOString().slice(0, 10)}
              value={form.dateOccurred}
              onChange={(e) =>
                updateField('dateOccurred', e.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle size={18} className="animate-spin" />
            )}
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </ReportAccess>
      </div>
    </div>
  )
}
