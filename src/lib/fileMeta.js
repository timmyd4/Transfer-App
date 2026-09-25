// Formatting helpers for the File Explorer-style list and details pane.

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return '—'
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = -1
  do {
    value /= 1024
    unitIndex++
  } while (value >= 1024 && unitIndex < units.length - 1)

  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`
}

// Turns a MIME type + filename into a friendly type label and an icon
// category, similar to what Windows Explorer shows in its "Type" column.
export function getFileKind(fileType, fileName) {
  const ext = (fileName?.split('.').pop() || '').toUpperCase()

  if (fileType?.startsWith('image/')) return { label: `${ext} Image`, category: 'image' }
  if (fileType?.startsWith('video/')) return { label: `${ext} Video`, category: 'video' }
  if (fileType?.startsWith('audio/')) return { label: `${ext} Audio`, category: 'audio' }
  if (fileType === 'application/pdf') return { label: 'PDF Document', category: 'document' }
  if (fileType?.startsWith('text/')) return { label: 'Text Document', category: 'document' }
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(ext)) {
    return { label: `${ext} Archive`, category: 'archive' }
  }
  if (['DOC', 'DOCX'].includes(ext)) return { label: 'Word Document', category: 'document' }
  if (['XLS', 'XLSX', 'CSV'].includes(ext)) return { label: 'Spreadsheet', category: 'document' }
  if (['PPT', 'PPTX'].includes(ext)) return { label: 'Presentation', category: 'document' }

  return { label: ext ? `${ext} File` : 'File', category: 'generic' }
}

// Compact date for the table column, e.g. "9/24/2026, 11:32 PM".
export function formatDateShort(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Full date + time for the details pane.
export function formatDateLong(isoString) {
  const date = new Date(isoString)
  return {
    date: date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }),
  }
}
