import { createClient } from '@/lib/supabase/server'

const BUCKET = 'photos'

// Upload a file to storage using the authenticated user session.
// Requires storage RLS policies that allow users to write to their own folder.
export async function uploadFile(
  userId: string,
  file: File
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const photoId = crypto.randomUUID()
  const path = `${userId}/${photoId}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type })

  if (uploadErr) return { error: uploadErr.message }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

// Delete a file from storage by its path segment (everything after /photos/)
export async function deleteFile(path: string): Promise<void> {
  const supabase = await createClient()
  await supabase.storage.from(BUCKET).remove([path])
}
