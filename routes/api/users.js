const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { validationResult } = require('express-validator/check')
// Models
const User = require('../../models/User')
// Validations
const userRegistrationValidations = require('../../validations/User')
	.userRegistration

// @route GET api/users
// @desc Register user
// @access Public
router.post('/', userRegistrationValidations, async (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	const { name, email, password } = req.body

	try {
		// see if user exists
		let user = await User.findOne({ email })
		if (user) {
			return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
		}
		// get user's grvatar
		const avatar = gravatar.url(email, {
			s: '200',
			r: 'pg',
			d: 'mm',
		})
		// create user and encrypt password
		user = new User({
			name,
			email,
			avatar,
			password,
		})

		const salt = await bcrypt.genSalt(10)
		user.password = await bcrypt.hash(password, salt)
		await user.save()

		// return jswonwebtoken
		const payload = {
			user: {
				id: user.id,
			},
		}

		jwt.sign(
			payload,
			config.get('jwtSecret'),
			{ expiresIn: 360000 },
			(err, token) => {
				if (err) throw err
				res.json({ token })
			}
		)
	} catch (err) {
		console.log(err)
		res.status(500).send('Server error')
	}
})

module.exports = router
