import { useState } from 'react'
import { downloadFile } from '../lib/downloadFile'
import { formatBytes, formatDateLong, getFileKind } from '../lib/fileMeta'
import FileIcon from './FileIcon'

export default function DetailsPane({ file, onClose, onDelete }) {
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const kind = getFileKind(file.file_type, file.file_name)
  const { date, time } = formatDateLong(file.created_at)

  async function handleDownload() {
    setDownloading(true)
    await downloadFile(file)
    setDownloading(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete()
    setDeleting(false)
  }

  return (
    <aside className="details-pane">
      <div className="details-pane-header">
        <h2>Details</h2>
        <button type="button" className="btn-link" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="details-icon-row">
        <FileIcon category={kind.category} size={40} />
        <p className="details-file-name">{file.file_name}</p>
      </div>

      <dl className="details-list">
        <div>
          <dt>Type</dt>
          <dd>{kind.label}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{formatBytes(file.file_size)}</dd>
        </div>
        <div>
          <dt>From</dt>
          <dd>{file.device}</dd>
        </div>
        <div>
          <dt>Uploaded</dt>
          <dd>{date}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{time}</dd>
        </div>
      </dl>

      <div className="details-actions">
        <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Preparing...' : 'Download'}
        </button>
        <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </aside>
  )
}
