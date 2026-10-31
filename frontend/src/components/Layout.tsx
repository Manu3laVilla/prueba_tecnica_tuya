import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { CreditCard, History, LayoutDashboard, LogOut, Wallet } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const navItems = [
  { to: '/', label: 'Panel', end: true, Icon: LayoutDashboard },
  { to: '/cards', label: 'Tarjetas', Icon: CreditCard },
  { to: '/payments', label: 'Pagos', Icon: Wallet },
  { to: '/transactions', label: 'Historial', Icon: History },
]

const pageTitles: Record<string, string> = {
  '/': 'Resumen financiero',
  '/cards': 'Tus tarjetas',
  '/payments': 'Nuevo pago',
  '/transactions': 'Historial de movimientos',
}

export function Layout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'Credit Wallet'

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="logo">
          <div className="logo__icon">
            <CreditCard size={22} strokeWidth={2.2} />
          </div>
          <div>
            <p className="logo__title">Credit Wallet</p>
            <p className="logo__sub">Prueba técnica</p>
          </div>
        </div>

        <nav className="shell__nav">
          {navItems.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="shell__profile">
          <div className="avatar">{user?.displayName?.charAt(0) ?? 'U'}</div>
          <div className="shell__profile-text">
            <strong>{user?.displayName}</strong>
            <span>@{user?.username}</span>
          </div>
          <button type="button" className="icon-btn" onClick={logout} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="shell__main">
        <header className="top">
          <div>
            <p className="top__eyebrow">Gestión de tarjetas</p>
            <h1>{title}</h1>
          </div>
        </header>
        <main className="shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
