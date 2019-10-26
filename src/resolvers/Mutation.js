import uuidv4 from "uuid";

const Mutation = {
  createUser(parent, args, ctx, info) {
    const emailTaken = ctx.db.users.some(user => {
      return user.email === args.data.email
    });

    if(emailTaken) {
      throw new Error("Email already in use")
    }

    const user = {
      id: uuidv4(),
      ...args.data
    }

    ctx.db.users.push(user);
    return user
  },
  deleteUser(parent, args, ctx, info) {
    const userIndex = ctx.db.users.findIndex(user => {
      return user.id === args.userId
    });

    if(userIndex === -1) {
      throw new Error("User not found")
    }

    const deletedUser = ctx.db.users.splice(userIndex, 1);

    //Si el usuario tiene posts creados, eliminarlos junto con los comentarios correspondientes a los posts
    ctx.db.posts = ctx.db.posts.filter(post => {
      const match = post.author === args.userId;

      if(match) {
        ctx.db.comments = ctx.db.comments.filter(comment => {
          return comment.postId !== post.id
        })
      }

      return !match;
    });

    //Eliminar todos los comentarios asociados al usuario que se va a borrar
    ctx.db.comments = ctx.db.comments.filter(comment => {
      return comment.authorId !== args.userId
    });

    return deletedUser[0];
  },
  updateUser(parent, args, ctx, info) {
    const user = ctx.db.users.find(user => {
      return user.id === args.id
    });

    if(!user) {
      throw new Error("User not found")
    }

    if(typeof args.data.email === "string") {
      const emailTaken = ctx.db.users.some(user => {
        return user.email === args.data.email
      });
      
      if(emailTaken) {
        throw new Error("Email already in use")
      }
      
      user.email = args.data.email;
    }

    if(typeof args.data.name === "string") {
      user.name = args.data.name
    }

    if(typeof args.data.age !== "undefined") {
      user.age = args.data.age
    }

    return user;
  },
  createPost(parent, args, ctx, info) {
    const userExists = ctx.db.users.some(user => {
      return user.id === args.data.author
    });

    if(!userExists) {
      throw new Error("User not found")
    }

    const post = {
      id: uuidv4(),
      ...args.data
    }

    ctx.db.posts.push(post);
    return post
  },
  deletePost(parent, args, ctx, info) {
    const postIndex = ctx.db.posts.findIndex(post => {
      return post.id === args.postId
    });

    if(postIndex === -1) {
      throw new Error("Post not found")
    }

    const deletedPost = ctx.db.posts.splice(postIndex, 1)

    ctx.db.comments = ctx.db.comments.filter(comment => {
      return comment.postId !== args.postId
    });

    return deletedPost[0];
  },
  updatePost(parent, args, ctx, info) {
    const post = ctx.db.posts.find(post => {
      return post.id === args.id
    });

    if(!post) {
      throw new Error("Post not fount")
    }

    if(typeof args.data.title === "string") {
      post.title = args.data.title
    }

    if(typeof args.data.body === "string") {
      post.body = args.data.body
    }
    
    if(typeof args.data.published === "boolean") {
      post.published = args.data.published
    }

    return post;
  },
  createComment(parent, args, ctx, info) {
    const userExists = ctx.db.users.some(user => {
      return user.id === args.data.authorId
    });

    const postExists = ctx.db.posts.find(post => {
      return post.id === args.data.postId
    });

    if(!userExists) {
      throw new Error("User not found")
    }

    if(!postExists) {
      throw new Error("Post not found")
    }

    if(!postExists.published) {
      throw new Error("This post hasn't been published yet")
    }

    const comment = {
      id: uuidv4(),
      ...args.data
    }

    ctx.db.comments.push(comment);
    ctx.pubsub.publish(`comment ${args.data.postId}`, {comment: comment})  
    return comment
  },
  updateComment(parent, args, ctx, info) {
    const comment = ctx.db.comments.find(comment => {
      return comment.id === args.id
    });

    if(!comment) {
      throw new Error("Comment not found")
    }

    if(typeof args.data.text === "string") {
      comment.text = args.data.text
    }

    return comment;
  },
  deleteComment(parent, args, ctx, info) {
    const commentIndex = ctx.db.comments.findIndex(comment => {
      return comment.id === args.commentId && comment.authorId === args.userId
    });

    if(commentIndex === -1) {
      throw new Error("Comment not found")
    }

    const deletedComment = ctx.db.comments.splice(commentIndex, 1);

    return deletedComment[0];
  }
}

export default Mutation;