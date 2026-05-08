import { motion } from 'framer-motion'

// ── Stat Card ─────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, accent = false, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="card-hover rounded p-5 relative overflow-hidden"
      style={{
        background: 'var(--bg-muted)',
        border: accent ? '1px solid rgba(255,60,47,0.25)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {accent && (
        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-heading tracking-widest uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          <p className="font-display text-4xl" style={{ color: accent ? 'var(--accent)' : 'white' }}>{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded" style={{ background: accent ? 'rgba(255,60,47,0.1)' : 'rgba(255,255,255,0.05)' }}>
            <Icon size={20} style={{ color: accent ? 'var(--accent)' : 'var(--text-secondary)' }} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────
export function SkeletonCard({ height = 'h-24' }) {
  return (
    <div className={`skeleton rounded ${height}`} />
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton rounded h-16" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

// ── Section Header ─────────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="font-heading font-semibold text-2xl uppercase tracking-wide text-white">{title}</h2>
        {sub && <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: { background: 'rgba(255,255,255,0.08)', color: '#888' },
    accent: { background: 'rgba(255,60,47,0.12)', color: 'var(--accent)', border: '1px solid rgba(255,60,47,0.2)' },
    success: { background: 'rgba(57,255,20,0.08)', color: 'var(--success)', border: '1px solid rgba(57,255,20,0.2)' },
    warn: { background: 'rgba(255,184,0,0.08)', color: 'var(--warn)', border: '1px solid rgba(255,184,0,0.2)' },
  }
  return (
    <span className="px-2.5 py-0.5 rounded text-xs font-heading tracking-wider uppercase" style={styles[variant]}>
      {children}
    </span>
  )
}

// ── Empty State ────────────────────────────────────────
export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded flex items-center justify-center mb-4" style={{ background: 'var(--bg-muted-light)' }}>
          <Icon size={24} style={{ color: 'var(--text-secondary)' }} />
        </div>
      )}
      <p className="font-heading text-lg tracking-wide uppercase text-white mb-1">{title}</p>
      {sub && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-4 rounded p-6"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-semibold text-lg uppercase tracking-wide text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

// ── Input ─────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-heading tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <input className="input-dark rounded" {...props} />
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-heading tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <select
        className="input-dark rounded"
        style={{ background: 'var(--bg-muted)', cursor: 'pointer' }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-heading tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <textarea className="input-dark rounded resize-none" rows={4} {...props} />
    </div>
  )
}

// ── Page Wrapper with animation ────────────────────────
export function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  )
}
