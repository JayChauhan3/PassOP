const express = require('express')
const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')
const bodyparser = require('body-parser')
const cors = require('cors')

dotenv.config()

// Connecting to Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'NOT SET')
console.log('Supabase Key:', supabaseKey ? 'Set' : 'NOT SET')

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables!')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// App & Database
const app = express()
const port = 3000 

// Middleware
app.use(bodyparser.json())
app.use(cors())


// Get all the passwords
app.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('passwords')
        .select('*')
    
    if (error) {
        res.status(500).json({ error: error.message })
    } else {
        res.json(data)
    }
})

// Save a password
app.post('/', async (req, res) => { 
    console.log('POST request received:', req.body)
    console.log('Environment check:', {
        'SUPABASE_URL': process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
        'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
    })
    
    const password = req.body
    const { data, error } = await supabase
        .from('passwords')
        .insert([password])
    
    console.log('Supabase insert result:', { data, error })
    
    if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2))
        res.status(500).json({ error: error.message, details: error })
    } else {
        console.log('Password saved successfully:', data)
        res.send({success: true, result: data})
    }
})

// Delete a password by id
app.delete('/', async (req, res) => { 
    const password = req.body
    const { data, error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', password.id)
    
    if (error) {
        res.status(500).json({ error: error.message })
    } else {
        res.send({success: true, result: data})
    }
})


app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})
     