const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')
const Story = mongoose.model('Story')
const Comment = mongoose.model('Comment')

router.get('/', async (req, res) => {
  const stories = await Story
    .find()
    .limit(+req.query.limit || 10)
    .skip(+req.query.offset || 0)
    .sort(
      req.query.sort === 'top'
        ? { 'score': -1 }
        : { 'createdAt': -1 }
    )
  res.json({
    data: stories,
    totalCount: await Story.countDocuments()
  })
})

router.get('/:storyId', async (req, res) => {
  const story = await Story.findOne({ _id: req.params.storyId })
  res.json(story)
})

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const story = await (new Story({
      title: req.body.title,
      type: req.body.type,
      content: req.body.content,
      user: req.user._id
    }).save())
    res.json(story)
  }
)

router.put(
  '/:storyId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let story = await Story.findOne({ _id: req.params.storyId })
    if (!story.user.equals(req.user._id)) {
      res
        .status(401)
        .json({
          message: 'You cannot edit a story that you do not own!'
        })
      return
    }
    story.title = req.body.title
    story.content = req.body.content
    story = await story.save()
    res.json(story)
  }
)

router.delete(
  '/:storyId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let story = await Story.findOne({ _id: req.params.storyId })
    if (!story.user.equals(req.user._id)) {
      res
        .status(401)
        .json({
          message: 'You cannot delete a story that you do not own!'
        })
      return
    }
    await Story.deleteOne({ _id: story._id })
    res.json({
      message: 'deleted!'
    })
  }
)

router.post('/:storyId/upvote', async (req, res) => {
  let story = await Story.findOne({ _id: req.params.storyId })
  story.score = story.score + 1
  await story.save()
  res.json({
    message: 'upvoted!'
  })
})

router.get('/:storyId/comments', async (req, res) => {
  const comments = await Comment.find({ story: req.params.storyId, parent: null })
  res.json(comments)
})

router.post(
  '/:storyId/comments',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let comment = await (new Comment({
      content: req.body.content,
      story: req.params.storyId,
      parent: req.body.parent,
      user: req.user._id
    }).save())
    comment = await Comment.populate(comment, ['replies', 'user'])
    res.json(comment)
  }
)

router.post('/:storyId/comments/:commentId/upvote', async (req, res) => {
  let comment = await Comment.findOne({
    _id: req.params.commentId,
    story: req.params.storyId
  })
  comment.score = comment.score + 1
  await comment.save()
  res.json({
    message: 'upvoted!'
  })
})

module.exports = router
