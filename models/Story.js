const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['link', 'text'],
    required: true
  },
  content: String,
  score: {
    type: Number,
    default: 0
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

storySchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'story',
  count: true
})

function autoPopulate (next) {
  this.populate('commentsCount')
  this.populate('user')
  next()
}

storySchema.pre('find', autoPopulate)
storySchema.pre('findOne', autoPopulate)

module.exports = mongoose.model('Story', storySchema)
