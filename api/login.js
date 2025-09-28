import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' })

    // Attempt to find user
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error || !data) return res.status(401).json({ error: 'Invalid username or password' })

    res.status(200).json({ message: 'Login successful' })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
