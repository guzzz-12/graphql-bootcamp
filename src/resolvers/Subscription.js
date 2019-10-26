const subscription = {
  comment: {
    subscribe(parent, args, ctx, info) {
      const post = ctx.db.posts.find(post => {
        return post.id === args.postId && post.published;
      });

      if(!post) {
        throw new Error("Post not found")
      }

      return ctx.pubsub.asyncIterator(`comment ${args.postId}`)
    }
  },
  post: {
    subscribe(parent, args, ctx, info) {
      return ctx.pubsub.asyncIterator("post")
    }
  }
}

export default subscription;