import { ATTACHMENTS_BUCKET, supabase } from './supabaseClient'

// The bucket is private, so every download needs a short-lived signed URL.
export async function downloadFile(file) {
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(file.file_path, 60)

  if (error) {
    alert(`Could not download file: ${error.message}`)
    return
  }

  window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
}
