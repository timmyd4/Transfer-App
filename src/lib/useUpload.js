import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { getDeviceName } from './device'
import { uploadFile } from './uploadFile'

export function useUpload() {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function upload(file) {
    if (!file) return
    setUploading(true)
    setError('')

    const { error: uploadError } = await uploadFile({
      user,
      file,
      device: getDeviceName() ?? 'Unknown',
    })

    setUploading(false)
    if (uploadError) setError(uploadError.message)
  }

  return { upload, uploading, error }
}
