import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Serve static files from dist/client
app.use(express.static(path.join(__dirname, 'dist/client')))

// Serve the index.html for all routes (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/client/index.html')
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Not found')
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`)
})
