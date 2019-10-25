const Query = {
  me() {
    return {
      id: "xyz24968",
      name: "Jesús",
      email: "jesus@gmail.com",
      age: "25"
    }
  },
  post() {
    return {
      id: "abcde123456",
      title: "A test post",
      body: "A text of body from the test post",
      published: false
    }
  },
  users(parent, args, ctx, info) {
    if(!args.query) {
      return ctx.db.users
    }
    return ctx.db.users.filter((user) => {
      return user.name.toLowerCase().includes(args.query.toLowerCase())
    })
  },
  posts(parent, args, ctx, info) {
    if(!args.query) {
      return ctx.db.posts
    }
    return ctx.db.posts.filter((post) => {
      return post.title.toLowerCase().includes(args.query.toLowerCase())
    })
  },
  comments(parent, args, ctx, info) {
    return ctx.db.comments
  }
}

export default Query;