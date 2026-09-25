import { useState } from 'react'
import { ATTACHMENTS_BUCKET, supabase } from '../lib/supabaseClient'

function formatTime(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MessageItem({ message, onDelete }) {
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    // The bucket is private, so we need a short-lived signed URL to fetch the file.
    const { data, error } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .createSignedUrl(message.file_path, 60)

    setDownloading(false)

    if (error) {
      alert(`Could not download file: ${error.message}`)
      return
    }

    // Open in a new tab; the browser will download it (or preview it) from there.
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleDelete() {
    if (!confirm('Delete this message?')) return
    setDeleting(true)

    if (message.file_path) {
      await supabase.storage.from(ATTACHMENTS_BUCKET).remove([message.file_path])
    }

    const { error } = await supabase.from('messages').delete().eq('id', message.id)

    setDeleting(false)

    if (error) {
      alert(`Could not delete message: ${error.message}`)
      return
    }

    onDelete?.(message.id)
  }

  return (
    <li className="message-item">
      <div className="message-meta">
        <span className={`device-tag device-tag-${message.device?.toLowerCase()}`}>
          {message.device}
        </span>
        <span className="message-time">{formatTime(message.created_at)}</span>
      </div>

      {message.content && <p className="message-content">{message.content}</p>}

      {message.file_path && (
        <button
          type="button"
          className="attachment-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Preparing...' : `Download ${message.file_name}`}
        </button>
      )}

      <button
        type="button"
        className="delete-btn"
        onClick={handleDelete}
        disabled={deleting}
        aria-label="Delete message"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </li>
  )
}
