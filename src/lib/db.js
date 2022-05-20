const { Client } = require('pg')
const config = require('config');
const User = require('../models/user');
const Post = require('../models/post');

const client = new Client(config.get('db'))
client.connect()

async function createDB() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER NOT NULL UNIQUE,
      carma INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      type VARCHAR NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (post_id) REFERENCES posts (id)
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (post_id) REFERENCES posts (id)
    );
  `)
  await client.query(`
  CREATE TABLE IF NOT EXISTS bot_answers (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    content TEXT NOT NULL
  );
  `)
}

async function createUser(user) {
  console.log(user.id)
  const result = await client.query(`
  SELECT * FROM users WHERE id = $1;
  `, [user.id])

  if (result.rowCount > 0) {
    console.log('User already exists')
    return getUser(user.id)
  }

  await client.query(`
    INSERT INTO users (id, carma)
    VALUES ($1, $2)
    RETURNING *
  `, [user.id, user.carma])
  return getUser(user.id)
}

async function createPost(post) {
  await client.query(`
    INSERT INTO posts (title, content, user_id, likes, type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [post.title, post.text, post.user_id, post.likes, post.type])
}

async function editPost(id, title, content) {
  const res = await client.query(`
  SELECT * FROM posts WHERE id = $1;
  `, [id])

  if (res.rowCount === 0) {
    return {
      status: 404,
      message: 'Post not found'
    }
  }

  await client.query(`
    UPDATE posts
    SET title = $1, content = $2
    WHERE id = $3
    RETURNING *
  `, [title, content, id])
}

async function getUser(id) {
  const rows = await client.query(`
    SELECT * FROM users
    WHERE id = $1
  `, [id])
  if (rows.length !== 0) {
    return {
      status: 200,
      user: new User(rows.rows[0]['id'], rows.rows[0]['carma'])
    }
  }
  return {
    status: 404,
    message: 'User does not exist'
  }
}

async function getPost(id) {
  const { rows } = await client.query(`
    SELECT * FROM posts
    WHERE id = $1
  `, [id])
  console.log(rows)
  if (rows.length === 0) {
    return {
      status: 404,
      message: 'Post does not exist'
    }
  }
  return {
    status: 200,
    post: new Post(rows[0]['title'], rows[0]['content'], rows[0]['user_id'], rows[0]['likes'], rows[0]['created_at'], rows[0]['type'])
  }
}

async function getAllPosts() {
  const { rows } = await client.query(`
    SELECT * FROM posts
  `)
  return {
    posts: rows
  }
}

async function getRandomPost() {
  const { rows } = await client.query(`
    SELECT * FROM posts
    ORDER BY RANDOM()
    LIMIT 1
  `)
  return {
    post: new Post(rows[0]['title'], rows[0]['content'], rows[0]['user_id'], rows[0]['likes'], rows[0]['created_at'], rows[0]['type'])
  }
}

async function addComment(content, user_id, post_id) {
  await client.query(`
    INSERT INTO comments (content, user_id, post_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [content, user_id, post_id])
}

async function getComments(post_id) {
  const { rows } = await client.query(`
    SELECT * FROM comments
    WHERE post_id = $1
  `, [post_id])
  return {
    comments: rows
  }
}

async function getAnswer(name) {
  const rows = await client.query(`
    SELECT * FROM bot_answers
    WHERE name = $1
  `, [name])
  return rows.rows[0]['content']
}

async function addAnswer(name, content) {
  await client.query(`
    INSERT INTO bot_answers (name, content)
    VALUES ($1, $2)
    RETURNING *
  `, [name, content])
}

async function endConnection() {
  await client.end()
}

module.exports = {
  createDB,
  createUser,
  createPost,
  getUser,
  getPost,
  editPost,
  getAllPosts,
  addComment,
  getComments,
  getAnswer,
  addAnswer,
  endConnection,
  getRandomPost
}