export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars')
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' })

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error || !data) return res.status(401).json({ error: error?.message || 'Invalid credentials' })

    res.status(200).json({ message: 'Login successful' })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
