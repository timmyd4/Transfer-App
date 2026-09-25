import { Link } from 'react-router-dom'
import { getDeviceName } from '../lib/device'

export default function Header() {
  const device = getDeviceName()

  return (
    <header className="app-header">
      <h1 className="app-title">Transfer App</h1>
      <div className="app-header-right">
        {device && <span className="device-badge">This device: {device}</span>}
        <Link to="/settings" className="btn-link" aria-label="Settings">
          Settings
        </Link>
      </div>
    </header>
  )
}
