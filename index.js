console.log('Warming up the server engine...')

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

const bodyParser = require('body-parser')

app.use(express.static('build'))
app.use(bodyParser.json())

/* As posted by Julio Coco in TKTL Full Stack Telegram group: */
morgan.token('body', function (req, res) { 
    return JSON.stringify(req.body)
})

/* As posted by Julio Coco in TKTL Full Stack Telegram group: */
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req,res)
  ].join(' ')
}))

app.use(cors())

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons.map(p => p.toJSON()))
    })
})

app.get('/info', (req, res) => {
    res.send('<p>Phonebook has info for ' + persons.length + ' people</p>' + new Date() + '<p>')
})

app.get('/api/persons/:id', (req, res, next) => {
    console.log('trying to find someone...')
    Person.findById(req.params.id).then(p => {
        if (p) {
            res.json(p.toJSON())
        } else {
            next()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    console.log('trying to remove someone...')
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
/* the old way:

    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
    */
})

   

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (body.name === undefined) {
        return res.status(400).json({
            error: 'name missing'
        })
    } else if (persons.some(p => p.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }
    if (body.number === undefined) {
        return res.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person ({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        res.json(savedPerson.toJSON())
    })
})

const unknownEndpoint = (req, res) => {
    console.log('Error: unknown endpoint')
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server now running on port ${PORT}`)
})