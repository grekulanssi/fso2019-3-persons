const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
    const auth = request.get('authorization')
    if(auth && auth.toLowerCase().startsWith('bearer ')) {
        return auth.substring(7)
    }
    return null
}

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1, id: 1 })
    if(blogs) {
        response.json(blogs)
    } else {
        response.status(404).end()
    }
})

blogsRouter.post('/', async (request, response) => {
    var body = request.body

    if(!body.title || !body.url) {
        response.status(400).end()
        return
    }

    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if(!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog(
        {
            title: body.title,
            author: body.author,
            url: body.url,
            likes: !body.likes ? 0 : body.likes,
            user: user._id
        }
    )

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const blog = {
        id: body.id,
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        __v: body.__v
    }
    if(!blog.title || !blog.url) {
        response.status(400).end()
        return
    }
    if(!blog.likes) blog.likes = 0
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(201).json(updatedBlog)
})

module.exports = blogsRouter