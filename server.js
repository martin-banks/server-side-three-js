const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const { createCanvas, loadImage } = require('canvas')

const width = 1000
const height = 200
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

// Write "Awesome!"
ctx.font = '24px Impact'
// ctx.rotate(0.1)
// ctx.fillText('Awesome!', 50, 100)

// Draw line under text
var text = ctx.measureText('Awesome!')
ctx.strokeStyle = 'rgba(0,0,0, 0.5)'
ctx.beginPath()
ctx.lineTo(50, 102)
ctx.lineTo(50 + text.width, 102)
ctx.stroke()

// // Draw cat with lime helmet
// loadImage('examples/images/lime-cat.jpg').then((image) => {
//   ctx.drawImage(image, 50, 0, 70, 70)
//   console.log('<img src="' + canvas.toDataURL() + '" />')
// })



// Handle home route
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/pages/index.html`)
})

function testMessage () {
  return `Testing -- ${new Date().getTime()}`
}



// Start io connection
io.on('connection', socket => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  io.emit('test-canvas', canvas.toDataURL())
  
  const msgLoop = setInterval(() => {
    // io.emit('test-message', testMessage())
    ctx.clearRect(0, 0, width, height)
    ctx.fillText(testMessage(), 0, 100)
    io.emit('test-canvas', canvas.toDataURL())
  }, 16)

  setTimeout(() => {
    clearInterval(msgLoop)
  }, 10 * 1000)

})


// Start server
http.listen(3000, () => {
  console.log('Listening on :3000')
})
