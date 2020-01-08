const mongoose = require('mongoose')

/* These settings to avoid deprecation warnings, see:
https://mongoosejs.com/docs/deprecations.html */
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true })
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)

