import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center px-6">
        <div className="text-6xl font-black text-gray-800 mb-4">403</div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
        <p className="text-gray-400 mb-8">Your account does not have the admin role needed to access this area.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors text-sm"
        >
          Sign in with a different account
        </Link>
      </div>
    </div>
  )
}
