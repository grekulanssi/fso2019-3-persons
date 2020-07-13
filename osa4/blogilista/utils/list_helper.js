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

/*
4.6*
Määrittele funktio mostBlogs joka saa parametrikseen taulukollisen blogeja.
Funktio selvittää kirjoittajan, kenellä on eniten blogeja.
Funktion paluuarvo kertoo myös ennätysblogaajan blogien määrän:
{
  author: "Robert C. Martin",
  blogs: 3
}
Jos ennätysblogaajia on monta, riittää että funktio palauttaa niistä jonkun.
*/

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


/*
Määrittele funktio mostLikes joka saa parametrikseen taulukollisen blogeja.
Funktio selvittää kirjoittajan, kenen blogeilla on eniten tykkäyksiä.
Funktion paluuarvo kertoo myös suosikkiblogaajan likejen yhteenlasketun määrän:
{
  author: "Edsger W. Dijkstra",
  likes: 17
}
Jos suosikkiblogaajia on monta, riittää että funktio palauttaa niistä jonkun.
*/

const mostLikes = (blogs) => {
    const authors = blogs.map(blog => {
        return blog.author
    })
    return authors.sort()
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}