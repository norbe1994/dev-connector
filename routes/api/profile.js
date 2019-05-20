const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { validationResult } = require('express-validator/check')

// models
const User = require('../../models/User')
const Profile = require('../../models/Profile')
// validations
const profileCreationValidations = require('../../validations/Profile')
	.profileCreation

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

// @route POST api/profile
// @desc Create or update user profile
// @access Private
router.post('/', [auth, profileCreationValidations], async (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	const {
		company,
		website,
		location,
		bio,
		status,
		githubusername,
		skills,
		youtube,
		facebook,
		twitter,
		instagram,
		linkedin,
	} = req.body

	// build profile object
	const profileFields = {}
	profileFields.user = req.user.id

	if (company) profileFields.company = company
	if (website) profileFields.website = website
	if (location) profileFields.location = location
	if (bio) profileFields.bio = bio
	if (status) profileFields.status = status
	if (githubusername) profileFields.githubusername = githubusername
	if (skills) {
		profileFields.skills = skills.split(',').map(skill => skill.trim())
	}

	// build social object
	profileFields.social = {}
	if (youtube) profileFields.social.youtube = youtube
	if (twitter) profileFields.social.twitter = twitter
	if (facebook) profileFields.social.facebook = facebook
	if (linkedin) profileFields.social.linkedin = linkedin
	if (instagram) profileFields.social.instagram = instagram

	try {
		let profile = await Profile.findOne({ user: req.user.id })

		if (profile) {
			// update
			profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true }
			)
			return res.json(profile)
		}

		// create
		profile = new Profile(profileFields)

		await profile.save()
		res.json(profile)
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server error')
	}
})

// @route GET api/profile
// @desc Get all profiles
// @access Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar'])
		res.json(profiles)
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server error')
	}
})

// @route GET api/profile/user/:user_id
// @desc Get profile by user ID
// @access Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar'])

		if (!profile)
			return res.status(400).json({ msg: 'There is no profile for this user' })

		res.json(profile)
	} catch (error) {
		console.error(error.message)
		if (error.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'There is no profile for this user' })
		}
		res.status(500).send('Server error')
	}
})

// @route DELETE api/profile
// @desc Delete profile, user & posts
// @access Private
router.delete('/', auth, async (req, res) => {
	try {
		// @todo - remove user's posts

		// remove profile
		await Profile.findOneAndRemove({ user: req.user.id })
		// remove user
		await User.findOneAndRemove({ _id: req.user.id })

		res.json({ msg: 'User deleted' })
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server error')
	}
})

module.exports = router
