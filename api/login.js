import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' })

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error || !data) return res.status(401).json({ error: 'Invalid credentials' })

    res.status(200).json({ message: 'Login successful' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' }) // always returns JSON
  }
}
