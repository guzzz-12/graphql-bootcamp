const users = [
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
const posts = [
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
const comments = [
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

const db = {
  users,
  posts,
  comments
}

export default db;