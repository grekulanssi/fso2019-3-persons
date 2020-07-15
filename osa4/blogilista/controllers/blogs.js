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

    const reqToken = request.token
    if(!reqToken) return response.status(401).json({ error: 'authentication token missing' })

    const decodedToken = jwt.verify(reqToken, process.env.SECRET)
    if(!decodedToken.id) return response.status(401).json({ error: 'authentication token verification failed' })

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
    if(!reqToken) return response.status(401).json({ error: 'authentication token missing' })

    const decodedToken = jwt.verify(reqToken, process.env.SECRET)
    if(!decodedToken.id) return response.status(401).json({ error: 'authentication token verification failed' })

    const blogId = request.params.id
    const blog = await Blog.findById(blogId)
    if(!blog) {
        console.log('NO BLOGGY BLOGG')
        response.status(404).json({ error: 'blog you tried to delete was not found' })
        return
    }
    if(!blog.user) {
        console.log('NO BLOG.USER')
        response.status(401).json({ error: 'blog does not have a user field' })
        return
    }

    const user = await User.findById(decodedToken.id)
    if(blog.user.toString() === user._id.toString()) {
        await Blog.findByIdAndRemove(blogId)
        response.status(204).end()
    } else {
        response.status(401).json({ error: 'blog can be deleted only by user who has added it' })
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
        response.status(400).end()
        return
    }
    if(!blog.likes) blog.likes = 0
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(201).json(updatedBlog)
})

module.exports = blogsRouter