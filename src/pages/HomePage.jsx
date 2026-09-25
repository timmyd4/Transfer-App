import { useState } from 'react'
import DetailsPane from '../components/DetailsPane'
import FileTable from '../components/FileTable'
import Header from '../components/Header'
import Toolbar from '../components/Toolbar'
import { deleteFile } from '../lib/deleteFile'
import { DEVICE_OPTIONS, getDeviceName, setDeviceName } from '../lib/device'
import { useFiles } from '../lib/useFiles'
import { useUpload } from '../lib/useUpload'

export default function HomePage() {
  const [device, setDevice] = useState(getDeviceName())
  const [selectedId, setSelectedId] = useState(null)
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const [isDragging, setIsDragging] = useState(false)

  const { files, loading, error, removeFile } = useFiles(sort)
  const { upload, uploading, error: uploadError } = useUpload()

  // First visit on this device: ask once which device it is before showing files.
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

  const selectedFile = files.find((f) => f.id === selectedId) ?? null

  function handleSort(key) {
    setSort((current) =>
      current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    )
  }

  async function handleDeleteSelected() {
    if (!selectedFile) return
    if (!confirm(`Delete "${selectedFile.file_name}"?`)) return

    const { error: deleteError } = await deleteFile(selectedFile)
    if (deleteError) {
      alert(`Could not delete file: ${deleteError.message}`)
      return
    }
    removeFile(selectedFile.id)
    setSelectedId(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  return (
    <div className="page home-page">
      <Header />
      <Toolbar onUpload={upload} uploading={uploading} error={uploadError} />

      <div
        className={`file-explorer ${isDragging ? 'file-explorer-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === 'Delete' && selectedFile) handleDeleteSelected()
        }}
      >
        <div className="file-list-panel">
          {loading && <p className="page-loading">Loading files...</p>}
          {error && <p className="auth-error">{error}</p>}
          {!loading && !error && files.length === 0 && (
            <p className="empty-state">No files yet. Upload one above, or drag it in.</p>
          )}
          {!loading && !error && files.length > 0 && (
            <FileTable
              files={files}
              selectedId={selectedId}
              onSelect={setSelectedId}
              sort={sort}
              onSort={handleSort}
            />
          )}
        </div>

        {selectedFile && (
          <DetailsPane
            file={selectedFile}
            onClose={() => setSelectedId(null)}
            onDelete={handleDeleteSelected}
          />
        )}
      </div>
    </div>
  )
}
