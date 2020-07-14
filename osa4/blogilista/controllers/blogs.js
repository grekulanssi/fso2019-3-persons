const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1, id: 1 })
    if(blogs) {
        return response.json(blogs)
    } else {
        return response.status(404).end()
    }
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    if(!body.title || !body.url) {
        return response.status(400).end()
    }

    const token = request.token
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
    return response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {

    const reqToken = request.token
    const decodedToken = jwt.verify(reqToken, process.env.SECRET)
    if(!reqToken || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const blogId = request.params.id
    const blog = await Blog.findById(blogId)
    const user = await User.findById(decodedToken.id)
    if(blog.user.toString() === user._id) {
        await Blog.remove(blogId)
        return response.status(204).end()
    } else {
        return response.status(401).json({ error: 'blog can be deleted only by user who has added it' })
    }
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
        return response.status(400).end()
    }
    if(!blog.likes) blog.likes = 0
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    return response.status(201).json(updatedBlog)
})

module.exports = blogsRouter