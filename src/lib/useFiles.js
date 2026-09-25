import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

function rawCompare(a, b, key) {
  switch (key) {
    case 'name':
      return (a.file_name ?? '').localeCompare(b.file_name ?? '')
    case 'type':
      return (a.file_type ?? '').localeCompare(b.file_type ?? '')
    case 'size':
      return (a.file_size ?? 0) - (b.file_size ?? 0)
    case 'device':
      return (a.device ?? '').localeCompare(b.device ?? '')
    case 'date':
    default:
      return new Date(a.created_at) - new Date(b.created_at)
  }
}

function compareFiles(a, b, { key, dir }) {
  const result = rawCompare(a, b, key)
  return dir === 'asc' ? result : -result
}

// Fetches the file list once, then keeps it live via Supabase Realtime.
export function useFiles(sort) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadFiles() {
      const { data, error: fetchError } = await supabase.from('messages').select('*')
      if (!isMounted) return
      if (fetchError) setError(fetchError.message)
      else setFiles(data)
      setLoading(false)
    }

    loadFiles()

    const channel = supabase
      .channel('files-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setFiles((current) => {
            if (current.some((f) => f.id === payload.new.id)) return current
            return [...current, payload.new]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          setFiles((current) => current.filter((f) => f.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  const sortedFiles = useMemo(
    () => [...files].sort((a, b) => compareFiles(a, b, sort)),
    [files, sort]
  )

  function removeFile(id) {
    setFiles((current) => current.filter((f) => f.id !== id))
  }

  return { files: sortedFiles, loading, error, removeFile }
}
