import {GraphQLServer} from "graphql-yoga";
import uuidv4 from "uuid";
import db from "./db";

//Resolvers
const resolvers = {
  Query: {
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
      return comments
    }
  },
  Mutation: {
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
    deleteComment(parent, args, ctx, info) {
      const commentIndex = ctx.db.comments.findIndex(comment => {
        return comment.id === args.commentId && comment.authorId === args.userId
      });

      if(commentIndex === -1) {
        throw new Error("Comment not found")
      }

      const deletedComment = ctx.db.comments.splice(commentIndex, 1);

      return deletedComment[0];
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
      return comment
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return ctx.db.users.find(user => {
        return user.id === parent.author
      })
    },
    comments(parent, args, ctx, info) {
      return ctx.db.comments.filter(comment => {
        return comment.postId === parent.id
      })
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return ctx.db.posts.filter(post => {
        return post.author === parent.id
      })
    },
    comments(parent, args, ctx, info) {
      return ctx.db.comments.filter(comment => {
        return comment.authorId === parent.id
      })
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return ctx.db.users.find(user => {
        return user.id === parent.authorId
      })
    },
    post(parent, args, ctx, info) {
      return ctx.db.posts.find(post => {
        return post.id === parent.postId
      })
    }
  }
}

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: {
    db: db
  }
});

server.start(() => {
  console.log("Server running!")
})