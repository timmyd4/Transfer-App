import { useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { getDeviceName } from '../lib/device'
import { ATTACHMENTS_BUCKET, supabase } from '../lib/supabaseClient'

// Keep attachments small - this is meant for notes, links and small files,
// not large media. Adjust if you need bigger uploads.
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024 // 20MB

export default function MessageInput() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const selected = e.target.files?.[0] ?? null
    if (selected && selected.size > MAX_FILE_SIZE_BYTES) {
      setError('That file is too big (max 20MB).')
      e.target.value = ''
      setFile(null)
      return
    }
    setError('')
    setFile(selected)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed && !file) return

    setSending(true)
    setError('')

    const device = getDeviceName() ?? 'Unknown'
    let filePath = null
    let fileName = null

    if (file) {
      filePath = `${user.id}/${crypto.randomUUID()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .upload(filePath, file)

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setSending(false)
        return
      }
      fileName = file.name
    }

    const { error: insertError } = await supabase.from('messages').insert({
      content: trimmed || null,
      file_path: filePath,
      file_name: fileName,
      device,
    })

    setSending(false)

    if (insertError) {
      setError(`Could not send message: ${insertError.message}`)
      return
    }

    setText('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      {error && <p className="auth-error">{error}</p>}
      {file && (
        <div className="file-preview">
          <span>{file.name}</span>
          <button type="button" onClick={() => {
            setFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
          }}>
            Remove
          </button>
        </div>
      )}
      <div className="message-input-row">
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
          title="Attach file"
        >
          +
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  )
}
