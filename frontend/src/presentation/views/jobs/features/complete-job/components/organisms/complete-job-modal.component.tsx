'use client'

import { useEffect } from 'react'

import { MOCK_ASSIGNEE_OPTIONS } from '@/shared/mocks/mock-assignees'

type Props = {
  readonly open: boolean
  readonly submitting: boolean
  readonly error: string | null
  readonly assigneePickerRequired: boolean
  readonly assigneeId: string
  readonly onAssigneeIdChange: (v: string) => void
  readonly signatureUrl: string
  readonly onSignatureUrlChange: (v: string) => void
  readonly completedAtUtc: string
  readonly onCompletedAtChange: (v: string) => void
  readonly onClose: () => void
  readonly onSubmit: () => void
}

export function CompleteJobModal({
  open,
  submitting,
  error,
  assigneePickerRequired,
  assigneeId,
  onAssigneeIdChange,
  signatureUrl,
  onSignatureUrlChange,
  completedAtUtc,
  onCompletedAtChange,
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
      aria-labelledby="complete-job-dialog-title"
      className="jt-modal-shell"
    >
      <button
        type="button"
        className="jt-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2
          id="complete-job-dialog-title"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          Complete job
        </h2>
        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {assigneePickerRequired ? (
          <label className="mt-4 flex flex-col">
            <span className="text-xs font-medium text-zinc-600">
              Assignee{' '}
              <span className="text-red-600" aria-hidden>
                *
              </span>
            </span>
            <select
              required
              value={assigneeId}
              onChange={(e) => onAssigneeIdChange(e.target.value)}
              disabled={submitting}
              className="jt-form-input select-native"
              aria-label="Assignee completing the job"
              aria-required="true"
            >
              <option value="">Select assignee</option>
              {MOCK_ASSIGNEE_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="mt-4 flex flex-col">
          <span className="text-xs font-medium text-zinc-600">
            Signature URL{' '}
            <span className="text-red-600" aria-hidden>
              *
            </span>
          </span>
          <input
            value={signatureUrl}
            onChange={(e) => onSignatureUrlChange(e.target.value)}
            className="jt-form-input"
            required
            aria-required="true"
          />
        </label>
        <label className="mt-4 flex flex-col">
          <span className="text-xs font-medium text-zinc-600">
            Completed at (local){' '}
            <span className="text-red-600" aria-hidden>
              *
            </span>
          </span>
          <input
            type="datetime-local"
            value={completedAtUtc}
            onChange={(e) => onCompletedAtChange(e.target.value)}
            className="jt-form-input"
            required
            aria-required="true"
          />
        </label>
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
            {submitting ? 'Saving…' : 'Complete'}
          </button>
        </div>
      </div>
    </div>
  )
}
