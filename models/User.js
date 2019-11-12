const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  }
})

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.getToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username
    },
    'yoursecretkey',
    { expiresIn: '12h' }
  )
}

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

module.exports = mongoose.model('User', userSchema)
