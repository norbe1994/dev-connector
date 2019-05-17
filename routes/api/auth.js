const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const { validationResult } = require('express-validator/check')
// Validations
const userLoginValidations = require('../../validations/User').userLogin

const User = require('../../models/User')

// @route GET api/auth
// @desc Test route
// @access Private
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password')
		res.json(user)
	} catch (error) {
		console.log(error.message)
		res.status(500).send('Server error')
	}
})

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public
router.post('/', userLoginValidations, async (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	const { email, password } = req.body

	try {
		// see if user does not exist or incorrect password
		let user = await User.findOne({ email })
		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
		}

		const isMatch = await bcrypt.compare(password, user.password)

		if (!isMatch) {
			return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
		}

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
