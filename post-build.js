import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distClientPath = path.join(__dirname, 'dist', 'client')
const indexPath = path.join(distClientPath, 'index.html')

// Create dist/client if it doesn't exist
if (!fs.existsSync(distClientPath)) {
  fs.mkdirSync(distClientPath, { recursive: true })
  console.log('Created dist/client directory')
}

// Generate index.html if it doesn't exist
if (!fs.existsSync(indexPath)) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Barbie AI - Autonomous App Builder</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <script type="module" src="/assets/index-DtqBFgK5.js"><\/script>
    <link rel="stylesheet" href="/assets/index-DXzKsGgW.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

  fs.writeFileSync(indexPath, html)
  console.log('✅ Generated index.html')
} else {
  console.log('✅ index.html already exists')
}

console.log('Post-build complete!')
