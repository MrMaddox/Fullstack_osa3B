require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')
const { response } = require('express')
/*
3.13: puhelinluettelo ja tietokanta, step1
Muuta backendin kaikkien puhelintietojen näyttämistä siten, että se hakee näytettävät puhelintiedot tietokannasta.

Varmista, että frontend toimii muutosten jälkeen.

Tee tässä ja seuraavissa tehtävissä Mongoose-spesifinen koodi omaan moduuliin samaan tapaan kuin luvussa Tietokantamäärittelyjen eriyttäminen moduuliksi.

3.14: puhelinluettelo ja tietokanta, step2
Muuta backendiä siten, että uudet numerot tallennetaan tietokantaan. Varmista, että frontend toimii muutosten jälkeen.
*/
morgan.token('daTa', function getResponse (res) {
    if (JSON.stringify(res.body) === '{}') {
        return ""
    }

    return JSON.stringify(res.body)
    
})

app.use(cors())
app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :daTa"))
app.use(express.static('build'))

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
        "name": "Mari Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      },
]

app.get('/', (req, res) => {
    res.send('<h1>Osa 3</h1>')
})

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}


app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    res.send(
        `<div>
        <p>Phonebook has info for ${Person.length} people</p>
        <p>${new Date()}</p>
        </div`)
    res.send()
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if (person) {
            res.json(person)
        } else {
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    //persons = persons.filter(person => person.id !== id)
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (body.name === undefined) {
        return res.status(400).json({
            error: 'name missing'
        })
    }
    if (body.number === undefined) {
        return res.status(400).json({
            error: 'number missing'
        })
    }

    for (let i = 0; i < persons.length; i++) {
        if (body.name === persons[i].name) {
            return res.status(400).json({
                error: 'name must be unique'
            })
        }
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        //id: generateId(),
    })
    
    //persons = persons.concat(person)

    person.save().then(savedPerson => {
        res.json(person)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatePerson => {
        res.json(updatePerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
  }
  app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})