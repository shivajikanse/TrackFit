import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '../../store'

const routeTitles = {
  '/trainer': 'Dashboard',
  '/trainer/members': 'Members',
  '/trainer/plans': 'Assign Plans',
  '/trainer/broadcast': 'Broadcast',
  '/member': 'Dashboard',
  '/member/workout': 'My Workout',
  '/member/diet': 'My Diet',
  '/member/progress': 'Progress Tracker',
  '/member/ai-feedback': 'AI Feedback',
  '/member/notes': 'My Notes',
  '/member/inbox': 'Inbox',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const title = routeTitles[pathname] || 'TrackFit'

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(12px)' }}
    >
      <div>
        <h1 className="font-heading font-semibold text-lg tracking-wide uppercase text-white">{title}</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
          <Search size={18} />
        </button>
        <button className="p-2 rounded transition-colors hover:bg-white/5 relative" style={{ color: 'var(--text-secondary)' }}>
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-heading font-semibold text-sm"
            style={{ background: 'var(--accent)' }}
          >
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">{user?.name || 'User'}</p>
            <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--accent)' }}>{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
