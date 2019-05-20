const { check } = require('express-validator/check')

module.exports = validations = {
	postCreation: [
		check('text', 'Text is required')
			.not()
			.isEmpty(),
	],
	commentCreation: [
		check('text', 'Text is required')
			.not()
			.isEmpty(),
	],
}
