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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}