import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardContent from '../../components/DashboardContent'
import { getIssues } from '@/lib/dal'
import { ISSUE_STATUS, ISSUE_PRIORITY } from '@/db/schema'
import { Status, Priority } from '@/lib/types'

// Mock the dependencies
vi.mock('@/lib/dal', () => ({
  getIssues: vi.fn(),
  getCurrentUser: vi.fn(),
}))

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, 'data-testid': 'next-link' }, children),
}))

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(true),
}))

// Mock the formatRelativeTime function
vi.mock('@/lib/utils', () => ({
  formatRelativeTime: vi.fn(() => '2 days ago'),
  cn: vi.fn((...args) => args.join(' ')),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('it renders the issue list when issue are available', async () => {
    // Mock data
    const mockIssues = [
      {
        id: 1,
        title: 'Test Issue 1',
        description: 'Test description',
        status: 'todo' as Status,
        priority: 'medium' as Priority,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1',
        user: {
          id: 'user1',
          email: 'user1@example.com',
          password: 'hashed-password',
          createdAt: new Date(),
        },
      },
      {
        id: 2,
        title: 'Test Issue 2',
        description: null,
        status: 'in_progress' as Status,
        priority: 'high' as Priority,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user2',
        user: {
          id: 'user2',
          email: 'user2@example.com',
          password: 'hashed-password',
          createdAt: new Date(),
        },
      },
    ]

    // Setup the mock
    vi.mocked(getIssues).mockResolvedValue(mockIssues)

    // Resolve the async Server Component before rendering it in the client test.
    const Component = await DashboardContent()
    render(Component)

    // Assertions
    expect(screen.getByText('Issues')).toBeTruthy()
    expect(screen.getByText('Test Issue 1')).toBeTruthy()
    expect(screen.getByText('Test Issue 2')).toBeTruthy()
    expect(screen.getByText(ISSUE_STATUS.todo.label)).toBeTruthy()
    expect(screen.getByText(ISSUE_STATUS.in_progress.label)).toBeTruthy()
    expect(screen.getByText(ISSUE_PRIORITY.medium.label)).toBeTruthy()
    expect(screen.getByText(ISSUE_PRIORITY.high.label)).toBeTruthy()
    expect(screen.getAllByText('2 days ago')).toHaveLength(2)
  })
})
