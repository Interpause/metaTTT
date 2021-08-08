import express from 'express'
import { createServer } from 'http'
import { Server as ioServer } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new ioServer(server)

const motd = 'Welcome to NEO JHChat'

app.use(express.static('static'))

app.get('/', (_, res) => {
	res.redirect('./index.html')
})

io.on('connection', (sock) => {
	console.log('a user connected')

	sock.emit('chat', { msg: `MOTD: ${motd}` })
	sock.broadcast.emit('chat', { msg: `A user joined` })

	sock.on('disconnect', () => {
		console.log('a user disconnected')
		sock.broadcast.emit('chat', { msg: `A user left` })
	})

	sock.on('chat', ({ msg }) => {
		console.log(`message: ${msg}`)
		io.emit('chat', { msg })
	})
})

server.listen(3000, () => {
	console.info('Listening on: ', server.address() || 'unknown')
})
