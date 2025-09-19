
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ebuifmauncgfjplsrmfb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidWlmbWF1bmNnZmpwbHNybWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwOTk2ODAsImV4cCI6MjA0MTY3NTY4MH0.dC-zbdRCnlZF-1Ndp6QnSu1IYdphVdrY3NvDg2xitFY'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase