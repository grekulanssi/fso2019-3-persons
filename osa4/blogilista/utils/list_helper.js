var _ = require('lodash')

const dummy = (blogs) => {
    return blogs.length * 0 + 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((biggest, blog) => {
        if(typeof biggest.likes === 'undefined') biggest.likes = 0
        return blog.likes >= biggest.likes ? blog : biggest
    }, {})
}

const mostBlogs = (blogs) => {
    const authors = blogs.map(blog => {
        return blog.author
    })
    let a = _(authors).countBy().entries().maxBy(_.last())
    return {
        author: a[0],
        blogs: a[1]
    }
}

const mergeLikes = authorsLikes => {
    const result = []
    authorsLikes.forEach(entry => {
        let foundAuthor = _.find(result, { 'author': entry.author })
        if(foundAuthor) {
            foundAuthor.likes += entry.likes
        } else {
            result.push(entry)
        }
    })
    return _.orderBy(result, 'likes', 'desc')[0]
}

const mostLikes = (blogs) => {
    if(_.isEmpty(blogs)) return { }
    let authorsLikes = []
    blogs.forEach(blog => {
        authorsLikes.push({
            author: blog.author,
            likes: blog.likes
        })
    })
    return mergeLikes(authorsLikes)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}