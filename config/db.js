const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
		})
		console.log('Successful connection to MongoDB')
	} catch (err) {
		console.log(err.message)
		// exit process
		process.exit(1)
	}
}

module.exports = connectDB
