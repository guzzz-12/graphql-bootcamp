import {GraphQLServer} from "graphql-yoga";
import uuidv4 from "uuid";

//Usuarios de prueba
let users = [
  {
    id: "1",
    name: "Jesús",
    email: "jesus@gmail.com",
    age: 33
  },
  {
    id: "2",
    name: "Keisa",
    email: "keisa@gmail.com",
    age: 33
  },
  {
    id: "3",
    name: "Geraldine",
    email: "geraldine@gmail.com",
    age: 32
  }
]

//Posts de prueba
let posts = [
  {
    id: "1",
    title: "Advanced ReactJS",
    body: "Contenido del post 1",
    published: true,
    author: "2"
  },
  {
    id: "2",
    title: "Learning Backend Web Development",
    body: "Contenido del post 2",
    published: false,
    author: "1"
  },
  {
    id: "3",
    title: "GraphQL from the Ground Up",
    body: "Contenido del post 3",
    published: true,
    author: "2"
  },
]

//Comentarios de prueba
let comments = [
  {
    id: "14",
    postId: "3",
    authorId:"1",
    text: "Excelent post, very useful information."
  },
  {
    id: "26",
    postId: "1",
    authorId:"2",
    text: "This post is really helpful."
  },
  {
    id: "39",
    postId: "2",
    authorId:"3",
    text: "This post is ok, but could be better."
  },
  {
    id: "45",
    postId: "3",
    authorId:"2",
    text: "Good explanations! May be better if adding more on SSR and Security, tho."
  },
]

//Definición de tipos (Schema)
const typeDefs = `
  type Query {
    me: User!
    post: Post!
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
  }

  type Mutation {
    createUser(data: CreateUserInput): User!
    deleteUser(userId: ID!): User!
    deletePost(postId: ID!): Post!
    deleteComment(userId: ID!, commentId: ID!): Comment!
    createPost(data: CreatePostInput): Post!
    createComment(data: CreateCommentInput): Comment!
  }

  input CreateUserInput {
    name: String!
    email: String!,
    age: Int
  }

  input CreatePostInput {
    title: String!,
    body: String!,
    published: Boolean!,
    author: ID!
  }

  input CreateCommentInput {
    text: String!,
    authorId: ID!,
    postId: ID!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    postId: ID!
    authorId: ID!
    author: User!
    text: String!
    post: Post!
  }
`

//Resolvers
const resolvers = {
  Query: {
    me() {
      return {
        id: "17899258",
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
        return users
      }
      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    posts(parent, args, ctx, info) {
      if(!args.query) {
        return posts
      }
      return posts.filter((post) => {
        return post.title.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    comments(parent, args, ctx, info) {
      return comments
    }
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => {
        return user.email === args.data.email
      });

      if(emailTaken) {
        throw new Error("Email already in use")
      }

      const user = {
        id: uuidv4(),
        ...args.data
      }

      users.push(user);
      return user
    },
    deleteUser(parent, args, ctx, info) {
      const userIndex = users.findIndex(user => {
        return user.id === args.userId
      });

      if(userIndex === -1) {
        throw new Error("User not found")
      }

      const deletedUser = users.splice(userIndex, 1);

      //Si el usuario tiene posts creados, eliminarlos junto con los comentarios correspondientes a los posts
      posts = posts.filter(post => {
        const match = post.author === args.userId;

        if(match) {
          comments = comments.filter(comment => {
            return comment.postId !== post.id
          })
        }

        return !match;
      });

      //Eliminar todos los comentarios asociados al usuario que se va a borrar
      comments = comments.filter(comment => {
        return comment.authorId !== args.userId
      });

      return deletedUser[0];
    },
    deletePost(parent, args, ctx, info) {
      const postIndex = posts.findIndex(post => {
        return post.id === args.postId
      });

      if(postIndex === -1) {
        throw new Error("Post not found")
      }

      const deletedPost = posts.splice(postIndex, 1)

      comments = comments.filter(comment => {
        return comment.postId !== args.postId
      });

      return deletedPost[0];
    },
    deleteComment(parent, args, ctx, info) {
      const commentIndex = comments.findIndex(comment => {
        return comment.id === args.commentId && comment.authorId === args.userId
      });

      if(commentIndex === -1) {
        throw new Error("Comment not found")
      }

      const deletedComment = comments.splice(commentIndex, 1);

      return deletedComment[0];
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some(user => {
        return user.id === args.data.author
      });

      if(!userExists) {
        throw new Error("User not found")
      }

      const post = {
        id: uuidv4(),
        ...args.data
      }

      posts.push(post);
      return post
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some(user => {
        return user.id === args.data.authorId
      });

      const postExists = posts.find(post => {
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

      comments.push(comment);      
      return comment
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author
      })
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.postId === parent.id
      })
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => {
        return post.author === parent.id
      })
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.authorId === parent.id
      })
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.authorId
      })
    },
    post(parent, args, ctx, info) {
      return posts.find(post => {
        return post.id === parent.postId
      })
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => {
  console.log("Server running!")
})