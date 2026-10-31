import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/cards', label: 'Tarjetas' },
  { to: '/payments', label: 'Pagos' },
  { to: '/transactions', label: 'Historial' },
]

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Credit Cards</p>
          <h1>Hola, {user?.displayName ?? 'Usuario'}</h1>
        </div>
        <button type="button" className="ghost-button" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <nav className="nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
