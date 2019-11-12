const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  story: {
    type: mongoose.Schema.ObjectId,
    ref: 'Story'
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true }
})

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent'
})

function autoPopulate (next) {
  this.populate('replies')
  this.populate('user')
  next()
}

commentSchema.pre('find', autoPopulate)
commentSchema.pre('findOne', autoPopulate)

module.exports = mongoose.model('Comment', commentSchema)
