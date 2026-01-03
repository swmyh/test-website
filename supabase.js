import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://dkjnufxrxvnysfpqrdyp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRram51ZnhyeHZueXNmcHFyZHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODQ5MzksImV4cCI6MjA3Nzk2MDkzOX0.lvDBDg-inI2fj1cduvCKXPVHeSORJofQRsBKXfyWQAA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)