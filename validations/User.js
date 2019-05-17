const { check, validationResult } = require('express-validator/check')

module.exports = validations = {
	userRegistration: [
		check('name', 'Name is required')
			.not()
			.isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 }),
	],
	userLogin: [
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
}
