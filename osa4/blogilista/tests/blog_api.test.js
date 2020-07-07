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

describe('blog api GET tests', () => {
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
        expect(contents).toContain('TEST Go To Statement Considered Harmful')
    })
    test('added blog has a field id insted of _id', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].id).toBeDefined()
        expect(response.body[0]._id).not.toBeDefined()
    })
})

describe('blog api POST tests', () => {
    test('amount of blogs is increased by one', async () => {
        await api
            .post('/api/blogs')
            .send(helper.newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const contents = blogsAtEnd.map(b => b.title)
        expect(contents).toContain('TEST TDD harms architecture')
    })
    test('if added blog has no value in likes, it will be set to 0', async () => {
        await api
            .post('/api/blogs')
            .send(helper.newBlogWithoutLikes)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd[blogsAtEnd.length-1].likes).toBe(0)
    })

})

describe('blog api DELETE tests', () => {
    test('amount of blogs is decreased by one', async () => {
        await api
            .delete('/api/blogs/5a422a851b54a676234d17f7')
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
    })

})

afterAll(() => {
    mongoose.connection.close()
})