import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json') // always JSON

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' })
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password }])
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({ message: 'User created', user: data[0] })

  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
