const { Client } = require('pg')
const config = require('config');
let User = require('./user');

const client = new Client({
  user: config.get('db.user'),
  host: config.get('db.host'),
  database: config.get('db.database'),
  password: config.get('db.password'),
  port: config.get('db.port')
})
client.connect()

async function createDB() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR NOT NULL,
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
      created_at TIMESTAMP DEFAULT NOW(),
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

async function createUser(user_id) {
  const result = await client.query(`
  SELECT * FROM users WHERE user_id = $1;
  `, [user_id])

  if (result.rowCount > 0) {
    return getUser(user_id)
  }

  await client.query(`
    INSERT INTO users (user_id, carma)
    VALUES ($1, $2)
    RETURNING *
  `, [user_id, 0])
  return getUser(user_id)
}

async function createPost(title, content, user_id) {
  await client.query(`
    INSERT INTO posts (title, content, user_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [title, content, user_id])
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

async function getUser(user_id) {
  const rows = await client.query(`
    SELECT * FROM users
    WHERE user_id = $1
  `, [user_id])
  if (rows.length !== 0) {
    return {
      status: 200,
      user: new User(rows.rows[0]['user_id'], rows.rows[0]['carma'])
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
  if (rows.length === 0) {
    return {
      error: 'Post does not exist'
    }
  }
  return {
    post: rows[0]
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
  endConnection
}