import { useRef } from 'react'

export default function Toolbar({ onUpload, uploading, error }) {
  const inputRef = useRef(null)

  function handleChange(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow selecting the same file again later
    if (file) onUpload(file)
  }

  return (
    <div className="toolbar">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : '+ Upload File'}
      </button>
      <input ref={inputRef} type="file" onChange={handleChange} style={{ display: 'none' }} />
      <p className="toolbar-hint">or drag a file into the list</p>
      {error && <p className="auth-error toolbar-error">{error}</p>}
    </div>
  )
}
