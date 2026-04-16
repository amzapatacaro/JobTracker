'use client'

import { useCallback, useState } from 'react'

import { completeJobAction } from '@/app/jobs/actions'
import { DEMO_ORGANIZATION_ID } from '@/shared/config/demo-tenant-ids'

import { useJobsStore } from '../../../store'

/** `datetime-local` string for the current moment (local timezone). */
function localDatetimeInputValue(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

/** Complete-job modal: optional assignee picker, optimistic store update, server action. */
export function useCompleteJob() {
  const [open, setOpen] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  /** When false, assignee comes from the job and the modal does not show a picker. */
  const [assigneePickerRequired, setAssigneePickerRequired] = useState(false)
  const [assigneeId, setAssigneeId] = useState('')
  const [signatureUrl, setSignatureUrl] = useState('')
  const [completedAtUtc, setCompletedAtUtc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openForJob = useCallback((id: string, existingAssigneeId: string | null) => {
    setJobId(id)
    const hasAssignee = Boolean(existingAssigneeId?.trim())
    setAssigneePickerRequired(!hasAssignee)
    setAssigneeId(hasAssignee ? existingAssigneeId!.trim() : '')
    setSignatureUrl('https://example.com/signature.png')
    setCompletedAtUtc(localDatetimeInputValue())
    setError(null)
    setOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
    setJobId(null)
  }, [])

  const submit = useCallback(async () => {
    if (!jobId) return
    const trimmedAssignee = assigneeId.trim()
    if (assigneePickerRequired && !trimmedAssignee) {
      setError('Select an assignee to complete the job.')
      return
    }
    if (!trimmedAssignee) {
      setError('Assignee is required.')
      return
    }
    setSubmitting(true)
    setError(null)
    const iso = new Date(completedAtUtc).toISOString()
    const { rollback } = useJobsStore
      .getState()
      .applyOptimisticComplete(jobId)
    try {
      const result = await completeJobAction({
        jobId,
        organizationId: DEMO_ORGANIZATION_ID,
        assigneeId: trimmedAssignee,
        signatureUrl: signatureUrl.trim(),
        completedAtUtc: iso,
      })
      if (!result.ok) {
        rollback()
        setError(result.error)
        return
      }
      closeModal()
    } catch (e) {
      rollback()
      setError(e instanceof Error ? e.message : 'Could not complete the job.')
    } finally {
      setSubmitting(false)
    }
  }, [
    jobId,
    assigneeId,
    assigneePickerRequired,
    signatureUrl,
    completedAtUtc,
    closeModal,
  ])

  return {
    open,
    jobId,
    assigneePickerRequired,
    assigneeId,
    setAssigneeId,
    signatureUrl,
    setSignatureUrl,
    completedAtUtc,
    setCompletedAtUtc,
    submitting,
    error,
    openForJob,
    closeModal,
    submit,
  }
}
