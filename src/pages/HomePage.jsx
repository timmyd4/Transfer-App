import { useState } from 'react'
import Header from '../components/Header'
import MessageInput from '../components/MessageInput'
import MessageList from '../components/MessageList'
import { DEVICE_OPTIONS, getDeviceName, setDeviceName } from '../lib/device'

export default function HomePage() {
  const [device, setDevice] = useState(getDeviceName())

  // First visit on this device: ask once which device it is before showing messages.
  if (!device) {
    return (
      <div className="device-prompt">
        <h1>Which device is this?</h1>
        <p>You can change this later in Settings.</p>
        <div className="device-choice">
          {DEVICE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className="device-option"
              onClick={() => {
                setDeviceName(option)
                setDevice(option)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page home-page">
      <Header />
      <main className="messages-area">
        <MessageList />
      </main>
      <MessageInput />
    </div>
  )
}
