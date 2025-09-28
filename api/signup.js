import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' })

    const { error } = await supabase
      .from('users')
      .insert([{ username, password }])

    if (error) return res.status(400).json({ error: error.message })

    res.status(201).json({ message: 'User created' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' }) // always returns JSON
  }
}
