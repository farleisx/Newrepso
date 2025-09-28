export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars')
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'Missing username' })

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !data) return res.status(401).json({ error: 'Invalid session' })

    res.status(200).json({ message: 'Session valid', username: data.username })
  } catch (err) {
    console.error('Check-session error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
