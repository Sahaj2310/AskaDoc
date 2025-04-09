#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
const debug = require('debug')('server:server');
const http = require('http');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

// Chat handler
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
  },
})

io.use((socket, next) => {
  let username = socket.handshake.auth.username;
  socket.username = username;
  socket.to = socket.handshake.auth.to;
  next();
})

let users = [];
io.on('connection', (socket) => {
  for (let [id, socket] of io.of("/").sockets) {
    if ((socket.username)&&(!(users.find(user =>  user.username === socket.username)))) {
      users.push({
        userID: id,
        username: socket.username,
        to: socket.to
      });
    }
  }
  // console.log(users);

  socket.on('doctorConnected', ({ username, id }) => {
    let arr = users.filter((val) => {
      return (val.to === username)
    }).map(val => val.username);

    socket.emit("senderList", {
      arr,
      username
    });
  })

  socket.on('messageSent', ({ senderUsername, message, reciever }) => {
    console.log(users);
    for (let user of users) {
      if (user.username === reciever) {
        socket.broadcast.emit('messageRecieved', { SenderUsername:senderUsername, message, reciever });
        break;
      }
    }
  })

  socket.on('disconnect', () => {
    let idx = users.indexOf(users.find(user =>  user.username === socket.username));
    if(idx > -1){
      users.splice(idx,1);
    }
  })
})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
