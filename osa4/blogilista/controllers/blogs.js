const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    if(blogs) {
        response.json(blogs)
    } else {
        response.status(404).end()
    }
})

blogsRouter.post('/', async (request, response) => {
    const blog = new Blog(request.body)
    if(!blog.title || !blog.url) {
        response.status(400).end()
        return
    }
    if(!blog.likes) blog.likes = 0
    const savedBlog = await blog.save()
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