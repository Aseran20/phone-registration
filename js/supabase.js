import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://kqnylriexuhpryqebhsz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbnlscmlleHVocHJ5cWViaHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTc4NjksImV4cCI6MjA1OTYzMzg2OX0.YfaUPRQxtPtpKeazYFi9oNTBlmb46rDnvbPUN4UMqDw';

DEBUG.log('Initializing Supabase client', { url: supabaseUrl });

try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    DEBUG.info('Supabase client initialized successfully');
} catch (error) {
    DEBUG.error('Failed to initialize Supabase client', error);
    throw error;
} 