const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator/check')
const auth = require('../../middleware/auth')
// models
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
// validations
const postValidations = require('../../validations/Post')

// @route POST api/posts
// @desc Create a post
// @access Private
router.post('/', [auth, postValidations.postCreation], async (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	try {
		const user = await User.findById(req.user.id).select('-password')

		const newPost = new Post({
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id,
		})

		const post = await newPost.save()

		res.json(post)
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server error')
	}
})

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 })
		res.json(posts)
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server error')
	}
})

// @route GET api/posts/:post_id
// @desc Get a post
// @access Private
router.get('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id)

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' })
		}

		res.json(post)
	} catch (error) {
		console.error(error.message)

		if (error.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Incorrect ID format' })
		}

		res.status(500).send('Server error')
	}
})

// @route DELETE api/posts/:post_id
// @desc Delete a post
// @access Private
router.delete('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id)
		// check if post exists
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' })
		}
		// if it does exist, check if the post does not belongs to the user
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' })
		}
		// if it does belong, remove it
		await post.remove()

		res.json({ msg: 'Post removed' })
	} catch (error) {
		console.error(error.message)

		if (error.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Incorrect ID format' })
		}

		res.status(500).send('Server error')
	}
})

module.exports = router
