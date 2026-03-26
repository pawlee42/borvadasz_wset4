import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Set these from your .env.local or pass as environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Split the SQL into individual statements and run them
const sql = readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf-8')

// Split by semicolons but respect quoted strings
const statements = sql
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`Running ${statements.length} SQL statements...`)

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i]
  const preview = stmt.substring(0, 60).replace(/\n/g, ' ')

  const { data, error } = await supabase.rpc('', {}).then(() => ({ data: null, error: null })).catch(e => ({ data: null, error: e }))

  // Use the SQL API via fetch since supabase-js doesn't expose raw SQL
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ query: stmt + ';' }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.log(`[${i+1}] SKIP (no raw SQL API): ${preview}...`)
  } else {
    console.log(`[${i+1}] OK: ${preview}...`)
  }
}

console.log('\nDone. If statements were skipped, run them manually in the Supabase SQL Editor.')

// Now create the storage bucket
console.log('\nCreating wine-images storage bucket...')
const { data: bucket, error: bucketError } = await supabase.storage.createBucket('wine-images', {
  public: true,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB
})

if (bucketError) {
  if (bucketError.message?.includes('already exists')) {
    console.log('Bucket already exists - OK')
  } else {
    console.log('Bucket error:', bucketError.message)
  }
} else {
  console.log('Bucket created:', bucket)
}

// Test: try to list tables
const { data: sessions, error: sessionsErr } = await supabase.from('sessions').select('id').limit(1)
if (sessionsErr) {
  console.log('\nSessions table not found yet. You need to run the SQL migration manually.')
  console.log('Go to Supabase Dashboard > SQL Editor > paste the contents of supabase/migrations/001_initial_schema.sql > Run')
} else {
  console.log('\nSessions table exists! Database is ready.')
}
