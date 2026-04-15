'use client'

import { useCallback, useReducer, useState } from 'react'

import { createJobAction } from '@/app/jobs/actions'
import {
  DEMO_CUSTOMER_ID,
  DEMO_ORGANIZATION_ID,
} from '@/shared/config/demo-tenant-ids'

export type CreateJobFormState = {
  title: string
  description: string
  street: string
  city: string
  state: string
  zipCode: string
  latitude: string
  longitude: string
  assigneeId: string
  scheduledDateUtc: string
  notes: string
}

type FormAction =
  | { type: 'update'; field: keyof CreateJobFormState; value: string }
  | { type: 'reset'; initial: CreateJobFormState }

function formReducer(
  state: CreateJobFormState,
  action: FormAction
): CreateJobFormState {
  switch (action.type) {
    case 'update':
      return { ...state, [action.field]: action.value }
    case 'reset':
      return action.initial
    default:
      return state
  }
}

const emptyForm = (): CreateJobFormState => ({
  title: '',
  description: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  latitude: '0',
  longitude: '0',
  assigneeId: '',
  scheduledDateUtc: '',
  notes: '',
})

export function useCreateJob() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, dispatch] = useReducer(formReducer, emptyForm())

  const openModal = useCallback(() => {
    setError(null)
    dispatch({ type: 'reset', initial: emptyForm() })
    setOpen(true)
  }, [])

  const closeModal = useCallback(() => setOpen(false), [])

  const submit = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    const result = await createJobAction({
      organizationId: DEMO_ORGANIZATION_ID,
      title: state.title.trim(),
      description: state.description.trim(),
      street: state.street.trim(),
      city: state.city.trim(),
      state: state.state.trim(),
      zipCode: state.zipCode.trim(),
      latitude: Number(state.latitude) || 0,
      longitude: Number(state.longitude) || 0,
      customerId: DEMO_CUSTOMER_ID,
      assigneeId: state.assigneeId.trim() ? state.assigneeId.trim() : null,
      scheduledDateUtc: state.scheduledDateUtc
        ? new Date(state.scheduledDateUtc).toISOString()
        : null,
      notes: state.notes.trim() ? state.notes.trim() : null,
    })
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setOpen(false)
  }, [state])

  return {
    open,
    openModal,
    closeModal,
    submitting,
    error,
    state,
    dispatch,
    submit,
  }
}
