import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { DEVICE_OPTIONS, getDeviceName, setDeviceName } from '../lib/device'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [device, setDevice] = useState(getDeviceName() ?? DEVICE_OPTIONS[0])

  function handleSave() {
    setDeviceName(device)
    navigate('/')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="page">
      <header className="page-header">
        <Link to="/" className="btn-link">
          &larr; Back
        </Link>
        <h1>Settings</h1>
      </header>

      <section className="settings-section">
        <h2>This device</h2>
        <p className="settings-hint">
          Choose what this device should be labelled as on messages you send from here.
        </p>
        <div className="device-choice">
          {DEVICE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`device-option ${device === option ? 'device-option-active' : ''}`}
              onClick={() => setDevice(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
      </section>

      <section className="settings-section">
        <h2>Account</h2>
        <p className="settings-hint">Logged in as {user?.email}</p>
        <button type="button" className="btn btn-danger" onClick={handleSignOut}>
          Log Out
        </button>
      </section>
    </div>
  )
}
