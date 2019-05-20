const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')

// models
const User = require('../../models/User')
const Profile = require('../../models/Profile')

// @route GET api/profile/me
// @desc Get current user
// @access Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			'user',
			['name', 'avatar']
		)

		if (!profile) {
			return res.json({ msg: 'There is no profile for this user' })
		}

		res.json(profile)
	} catch (error) {
		console.log(error)
		res.status(500).send('Server error')
	}
})

module.exports = router
