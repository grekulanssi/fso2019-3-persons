const mongoose = require('mongoose')

if (process.argv.length < 3 || process.argv.length === 4 || process.argv.length > 5) {
    console.log('This app needs 1 or 3 arguments:')
    console.log('[password] OR [password, name, number]')
    console.log('Please try again')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://fullstack19:${password}@cluster0-8dujm.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 4) {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(p => {
            console.log(p.name + ' ' + p.number)
        })
        mongoose.connection.close()
        process.exit(1)
    })
}

if (process.argv.length === 5) {
    const newName = process.argv[3]
    const newNumber = process.argv[4]

    const newPerson = new Person({
        name: newName,
        number: newNumber
    })

    newPerson.save().then(() => {
        console.log('added ' + newName + ' number ' + newNumber + ' to phonebook')
        mongoose.connection.close()
        process.exit(1)
    })
}
