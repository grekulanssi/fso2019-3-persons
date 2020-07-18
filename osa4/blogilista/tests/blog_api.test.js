const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
    await User.deleteMany({})
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
    /* The test implementation here is following user Nick's approach as
    posted by him in the Telegram support channel on July 10, 2020 at 8:42:15 PM.
    Similar logic is used in all tests that require user authentication. */
    test('amount of blogs is increased by one', async () => {
        // create new simple user
        const newUser = {
            username: 'tittelintuure',
            password: 'salaisuus'
        }
        // post the user to db to make it "real"
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        // log in with this fresh user
        const response = await api
            .post('/api/login')
            .send({
                username: newUser.username, password: newUser.password
            })

        // post a blog with this user authenticated
        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${response.body.token}`)
            .send(helper.newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const contents = blogsAtEnd.map(b => b.title)
        expect(contents).toContain('TEST TDD harms architecture')
    })
    test('if added blog has no value in likes, it will be set to 0', async () => {
        const newUser = {
            username: 'tittelintuure',
            password: 'salaisuus'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api
            .post('/api/login')
            .send({
                username: newUser.username, password: newUser.password
            })

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${response.body.token}`)
            .send(helper.newBlogWithoutLikes)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd[blogsAtEnd.length-1].likes).toBe(0)
    })
    test('if added blog lacks title and url, we get HTTP 400', async () => {
        const newUser = {
            username: 'tittelintuure',
            password: 'salaisuus'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api
            .post('/api/login')
            .send({
                username: newUser.username, password: newUser.password
            })

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${response.body.token}`)
            .send(helper.newBlogWithoutTitleAndUrl)
            .expect(400)
    })
})

describe('blog api DELETE tests', () => {
    test('DELETE fails with HTTP 401 and correct message if no user logged in', async () => {
        const result = await api
            .delete('/api/blogs/5a422a851b54a676234d17f7')
            .expect(401)
            .expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain('authentication token missing')
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
    test('amount of blogs is decreased by one', async () => {
        // create new user and post it to database
        const newUser = {
            username: 'tittelintuure',
            password: 'salaisuus'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        // log in with this new user
        const response = await api
            .post('/api/login')
            .send({
                username: newUser.username, password: newUser.password
            })

        // post a new blog entry with this user
        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${response.body.token}`)
            .send(helper.newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAfterAddition = await helper.blogsInDb()
        expect(blogsAfterAddition).toHaveLength(helper.initialBlogs.length + 1)

        // delete the new blog entry with the same user
        await api
            .delete(`/api/blogs/${blogsAfterAddition[2].id}`)
            .set('Authorization', `bearer ${response.body.token}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

})

describe('blog api PUT tests', () => {
    test('amount of blogs remains the same', async () => {
        await api
            .put('/api/blogs/5a422a851b54a676234d17f7')
            .send(helper.updatedBlog)
            .expect(201)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

})

afterAll(() => {
    mongoose.connection.close()
})