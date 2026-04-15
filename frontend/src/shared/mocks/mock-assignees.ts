export type MockAssigneeOption = {
  id: string
  label: string
}

/** Stable random-looking UUIDs so list/create flows stay consistent across reloads. */
export const MOCK_ASSIGNEE_OPTIONS: MockAssigneeOption[] = [
  {
    id: '7f2c9a1e-4b83-4d91-a7e3-8f6c2d1e9b40',
    label: 'Fred Flintstone — Superintendent',
  },
  {
    id: 'a384f22c-9e61-4f8b-bc12-073d5e8a4c91',
    label: 'Barney Rubble — Crew lead',
  },
  {
    id: 'e91b5d73-2a0f-4c6e-9b8d-4f1e6c2a7b55',
    label: 'Wilma Flintstone — Foreman',
  },
]
