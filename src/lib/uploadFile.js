import { ATTACHMENTS_BUCKET, supabase } from './supabaseClient'

// Keep attachments small - this is meant for small files, not large media.
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024 // 20MB

export async function uploadFile({ user, file, device }) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: new Error('That file is too big (max 20MB).') }
  }

  const filePath = `${user.id}/${crypto.randomUUID()}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(filePath, file)

  if (uploadError) return { error: uploadError }

  const { error: insertError } = await supabase.from('messages').insert({
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type || null,
    device,
  })

  return { error: insertError }
}
