const { app, BrowserWindow } = require('electron')
const path = require('path')
const express = require('express')

let server;

function createWindow (port) {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
  })

  mainWindow.loadURL(`http://localhost:${port}`)
}

app.whenReady().then(() => {
  // Start Express server
  const serverApp = express()
  const outPath = path.join(__dirname, 'out')
  
  // Serve static files
  serverApp.use(express.static(outPath))
  
  // Fallback to index.html for Next.js app router navigation
  serverApp.use((req, res) => {
    res.sendFile(path.join(outPath, 'index.html'))
  })

  // Start listening on a random port
  server = serverApp.listen(0, () => {
    const port = server.address().port
    console.log(`Local server started on port ${port}`)
    
    createWindow(port)
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (server) createWindow(server.address().port)
    }
  })
})

app.on('window-all-closed', function () {
  if (server) {
    server.close()
  }
  if (process.platform !== 'darwin') app.quit()
})


