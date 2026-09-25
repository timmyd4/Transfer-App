import { ATTACHMENTS_BUCKET, supabase } from './supabaseClient'

export async function deleteFile(file) {
  await supabase.storage.from(ATTACHMENTS_BUCKET).remove([file.file_path])
  const { error } = await supabase.from('messages').delete().eq('id', file.id)
  return { error }
}
