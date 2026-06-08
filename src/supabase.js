import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://ljsinlxkqhrrhktnsccm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc2lubHhrcWhycmhrdG5zY2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4ODE4NjIsImV4cCI6MjA5NjQ1Nzg2Mn0.guJlgPhURQWeBxv-dGavjz-HZXSds7U9Equ019fvYAY'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
