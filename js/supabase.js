// Initialize Supabase client
const supabaseUrl = 'https://kqnylriexuhpryqebhsz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbnlscmlleHVocHJ5cWViaHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTc4NjksImV4cCI6MjA1OTYzMzg2OX0.YfaUPRQxtPtpKeazYFi9oNTBlmb46rDnvbPUN4UMqDw'

const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey)

// Export the client for use in other files
export { supabase } 