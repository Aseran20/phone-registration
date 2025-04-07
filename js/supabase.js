// Initialize Supabase client
const supabaseUrl = 'https://kqnylrieuxhprqehbsz.supabase.co'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY' // Replace with your actual anon key

export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Export the client for use in other files
export { supabase } 