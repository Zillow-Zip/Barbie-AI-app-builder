import { createFileRoute, redirect } from '@tanstack/react-router'
import { getServerUser } from '@/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (user?.roles?.includes('admin')) {
      throw redirect({ to: '/builder' })
    }
    throw redirect({ to: '/login' })
  },
  component: () => null,
})
