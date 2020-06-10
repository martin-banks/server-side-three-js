const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const { createCanvas, loadImage } = require('canvas')

let width = 500
let height = 500
const textPos = { x: 10, y: 10 }
const mousePos = { x: 100, y: 100 }
let textValue = ''


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce (func, wait, immediate) {
  let timeout = null
  return function () {
    let context = this
    let args = arguments
    let later = function () {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}


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

let canvas = null
let ctx = null

function updateImage () {
  ctx.clearRect(0, 0, width, height)
  ctx.fillText(textValue, textPos.x, textPos.y)
  ctx.beginPath()
  ctx.rect(mousePos.x, mousePos.y, 20, 20)
  ctx.stroke()
  io.emit('test-canvas', canvas.toDataURL())
}

// Start io connection
io.on('connection', socket => {
  textPos.x = 20
  textPos.y = 20
  mousePos.x = 100
  mousePos.y = 100
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  // io.emit('test-canvas', canvas.toDataURL())

  // const msgLoop = setInterval(() => {
  //   // io.emit('test-message', testMessage())
  //   ctx.clearRect(0, 0, width, height)
  //   ctx.fillText(testMessage(), 0, 100)
  //   io.emit('test-canvas', canvas.toDataURL())
  // }, 16)

  // setTimeout(() => {
  //   clearInterval(msgLoop)
  // }, 10 * 1000)

  canvas = createCanvas(width, height)
  ctx = canvas.getContext('2d')
  // ctx.fillRect(mousePos.x, mousePos.y, 20, 20)

  // Write "Awesome!"
  ctx.font = '24px Impact'
  // ctx.rotate(0.1)
  // ctx.fillText('Awesome!', 50, 100)

  // Draw line under text
  // const text = ctx.measureText('Awesome!')
  // ctx.strokeStyle = 'rgba(0,0,0, 0.5)'
  // ctx.beginPath()
  // ctx.lineTo(50, 102)
  // ctx.lineTo(50 + text.width, 102)
  // ctx.stroke()

  socket.on('screen-size', s => {
    width = s.width
    height = s.height
  })

  socket.on('move-left', x => {
    textPos.x -= 5
    updateImage()
  })
  socket.on('move-right', x => {
    textPos.x += 5
    updateImage()
  })
  socket.on('move-up', x => {
    textPos.y -= 5
    updateImage()
  })
  socket.on('move-down', x => {
    textPos.y += 5
    updateImage()
  })


  socket.on('typing', value => {
    textValue = value
    updateImage()
  })

  socket.on('mouse-move', m => {
    mousePos.x = m.clientX
    mousePos.y = m.clientY
    // console.log(JSON.stringify({ m, mousePos, width, height }, null, 2))
    // debounce(updateImage(), 32)
    updateImage()
  })
})




// Start server
http.listen(3000, () => {
  console.log('Listening on :3000')
})
