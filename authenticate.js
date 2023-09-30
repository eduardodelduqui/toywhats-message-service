const env = require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports.authenticate = (socket, next) => {
  const token = socket.handshake.auth.token
  const SECRET_KEY = process.env.SECRET_KEY
  if (!token) {
    return next(new Error('Token not provided'))
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(new Error('Invalid token'))
    }

    socket.user = {
      name: decoded.name,
      phone: decoded.phone,
      salt: decoded.salt
    }
    next()
  })
}

