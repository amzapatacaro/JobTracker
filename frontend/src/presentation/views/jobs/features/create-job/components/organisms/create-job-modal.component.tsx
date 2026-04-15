'use client'

import { useEffect } from 'react'

import { MOCK_ASSIGNEE_OPTIONS } from '@/shared/mocks/mock-assignees'

import type { CreateJobFormState } from '../../hooks/use-create-job.hook'

type Props = {
  readonly open: boolean
  readonly submitting: boolean
  readonly error: string | null
  readonly state: CreateJobFormState
  readonly dispatch: (a: {
    type: 'update'
    field: keyof CreateJobFormState
    value: string
  }) => void
  readonly onClose: () => void
  readonly onSubmit: () => void
}

export function CreateJobModal({
  open,
  submitting,
  error,
  state,
  dispatch,
  onClose,
  onSubmit,
}: Readonly<Props>) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-job-dialog-title"
      className="jt-modal-shell"
    >
      <button
        type="button"
        className="jt-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2
          id="create-job-dialog-title"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          Create job
        </h2>
        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-4 grid gap-4">
          <Field
            label="Title"
            value={state.title}
            onChange={(v) =>
              dispatch({ type: 'update', field: 'title', value: v })
            }
          />
          <Field
            label="Description"
            value={state.description}
            onChange={(v) =>
              dispatch({ type: 'update', field: 'description', value: v })
            }
          />
          <Field
            label="Street"
            value={state.street}
            onChange={(v) =>
              dispatch({ type: 'update', field: 'street', value: v })
            }
          />
          <Field
            label="City"
            value={state.city}
            onChange={(v) =>
              dispatch({ type: 'update', field: 'city', value: v })
            }
          />
          <Field
            label="State"
            value={state.state}
            onChange={(v) =>
              dispatch({ type: 'update', field: 'state', value: v })
            }
          />
          <Field
            label="Zip"
            value={state.zipCode}
            onChange={(v) =>
              dispatch({ type: 'update', field: 'zipCode', value: v })
            }
          />
          <label className="flex flex-col">
            <span className="text-xs font-medium text-zinc-600">
              Assignee (optional)
            </span>
            <select
              value={state.assigneeId}
              onChange={(e) =>
                dispatch({
                  type: 'update',
                  field: 'assigneeId',
                  value: e.target.value,
                })
              }
              className="jt-form-input select-native"
            >
              <option value="">None</option>
              {MOCK_ASSIGNEE_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-xs font-medium text-zinc-600">
              Schedule (optional)
            </span>
            <input
              type="datetime-local"
              value={state.scheduledDateUtc}
              onChange={(e) =>
                dispatch({
                  type: 'update',
                  field: 'scheduledDateUtc',
                  value: e.target.value,
                })
              }
              className="jt-form-input"
            />
          </label>
          <Field
            label="Notes"
            value={state.notes}
            onChange={(v) =>
              dispatch({ type: 'update', field: 'notes', value: v })
            }
          />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="jt-btn-ghost min-w-0 flex-1"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="jt-btn-primary min-w-0 flex-1"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="jt-form-input"
      />
    </label>
  )
}
