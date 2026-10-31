import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export function ApiStatusBanner() {
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/health')
      .then((r) => setOnline(r.ok))
      .catch(() => setOnline(false))
  }, [])

  if (online === null || online) {
    return null
  }

  return (
    <div className="api-banner">
      <AlertTriangle size={18} />
      <span>
        Backend apagado. Ejecuta <code>.\scripts\run-api.ps1</code> en la raíz del proyecto.
      </span>
    </div>
  )
}
