import { downloadFile } from '../lib/downloadFile'
import { formatBytes, formatDateShort, getFileKind } from '../lib/fileMeta'
import FileIcon from './FileIcon'

const COLUMNS = [
  { key: 'name', label: 'Name', className: 'col-name' },
  { key: 'device', label: 'From', className: 'col-device' },
  { key: 'date', label: 'Date Uploaded', className: 'col-date' },
  { key: 'type', label: 'Type', className: 'col-type' },
  { key: 'size', label: 'Size', className: 'col-size' },
]

export default function FileTable({ files, selectedId, onSelect, sort, onSort }) {
  return (
    <table className="file-table">
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th key={col.key} className={col.className} onClick={() => onSort(col.key)}>
              {col.label}
              {sort.key === col.key && (
                <span className="sort-arrow">{sort.dir === 'asc' ? ' ▲' : ' ▼'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {files.map((file) => {
          const kind = getFileKind(file.file_type, file.file_name)
          return (
            <tr
              key={file.id}
              className={file.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(file.id)}
              onDoubleClick={() => downloadFile(file)}
            >
              <td className="col-name">
                <FileIcon category={kind.category} />
                <span className="file-name-text" title={file.file_name}>
                  {file.file_name}
                </span>
              </td>
              <td className="col-device">
                <span className={`device-tag device-tag-${file.device?.toLowerCase()}`}>
                  {file.device}
                </span>
              </td>
              <td className="col-date">{formatDateShort(file.created_at)}</td>
              <td className="col-type">{kind.label}</td>
              <td className="col-size">{formatBytes(file.file_size)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
