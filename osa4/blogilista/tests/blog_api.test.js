const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('blog api tests', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('correct amount of blogs is returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
    test('one correct blog is found within the response', async () => {
        const response = await api.get('/api/blogs')
        const contents = response.body.map(r => r.title)
        expect(contents).toContain('Test Go To Statement Considered Harmful')
    })
})

afterAll(() => {
    mongoose.connection.close()
})