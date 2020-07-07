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
/*
blogsRouter.post('/', async (request, response) => {
    console.log('AWWW YESSS 1')
    const blog = new Blog(request.body)
    console.log('AWWW YESSS 2')
    const savedBlog = await blog.save()
    console.log('AWWW YESSS 3')
    response.status(201).json(savedBlog)
    console.log('AWWW YESSS 4')
})
*/
module.exports = blogsRouter