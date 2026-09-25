import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This usually means the .env file is missing or the GitHub secrets
  // were not passed into the build. See the README for setup steps.
  console.error(
    'Missing Supabase environment variables. Did you create a .env file from .env.example?'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Name of the private Storage bucket used for message attachments.
// Must match the bucket created in supabase/schema.sql.
export const ATTACHMENTS_BUCKET = 'attachments'
