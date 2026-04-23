import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Determine the correct path for static files
const distPath = path.join(__dirname, 'dist', 'client')
const indexPath = path.join(distPath, 'index.html')

console.log('Server starting...')
console.log('Dist path:', distPath)
console.log('Index path:', indexPath)
console.log('Dist exists:', fs.existsSync(distPath))
console.log('Index exists:', fs.existsSync(indexPath))

// Serve static files from dist/client
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: false
}))

// Serve the index.html for all routes (SPA routing)
app.get('*', (req, res) => {
  console.log('Request:', req.path)
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    console.error('Index.html not found at:', indexPath)
    res.status(404).send('Not found - index.html missing')
  }
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).send('Server error')
})

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`)
  console.log(`📍 Visit http://localhost:${port}`)
})
