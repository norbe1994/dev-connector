const express = require('express')
const router = express.Router()
const { validationResult } = require('express-validator/check')

// Validations
const userValidations = require('../../validations/User')

// @route GET api/users
// @desc Register user
// @access Public
router.post('/', userValidations, (req, res) => {
	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	res.send('User route')
})

module.exports = router
