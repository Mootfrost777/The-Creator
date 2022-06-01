const { Client } = require('pg')
const config = require('config');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

const client = new Client(config.get('db'))
client.connect()

class Db {
  static async createDB() {
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

  static async createUser(user) {
    console.log(user.id)
    const result = await client.query(`
  SELECT * FROM users WHERE id = $1;
  `, [user.id])

    if (result.rowCount > 0) {
      console.log('User already exists')
      return Db.getUser(user.id)
    }

    await client.query(`
    INSERT INTO users (id, carma)
    VALUES ($1, $2)
    RETURNING *
  `, [user.id, user.carma])
    return Db.getUser(user.id)
  }

  static async resetUser(user_id) {
    await client.query(`
        UPDATE users
        SET carma = 0
        WHERE id = $1
    `, [user_id])

    await client.query(`
        DELETE FROM likes
        WHERE user_id = $1
    `, [user_id])

    await client.query(`
        DELETE FROM comments
        WHERE user_id = $1
    `, [user_id])

    await client.query(`
        DELETE FROM posts
        WHERE user_id = $1
    `, [user_id])
  }

  static async createPost(post) {
    await client.query(`
    INSERT INTO posts (title, content, user_id, likes, type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [post.title, post.text, post.user_id, post.likes, post.type])
  }

  static async editPost(id, title, content) {
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

  static async getPostsCount(id) {
    const rows = await client.query(`
    SELECT COUNT(*) FROM posts WHERE user_id = $1;
    `, [id])
    return rows.rows[0].count
  }

  static async getUser(id) {
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

  static async getPost(id) {
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
      post: new Post(rows[0]['id'], rows[0]['title'], rows[0]['content'], rows[0]['user_id'], rows[0]['likes'], rows[0]['created_at'], rows[0]['type'])
    }
  }

  static async getAllPosts() {
    const { rows } = await client.query(`
    SELECT * FROM posts
  `)
    return {
      posts: rows
    }
  }

  static async getRandomPost() {
    const { rows } = await client.query(`
    SELECT * FROM posts
    ORDER BY RANDOM()
    LIMIT 1
  `)
    return {
      post: new Post(rows[0]['id'], rows[0]['title'], rows[0]['content'], rows[0]['user_id'], rows[0]['likes'], rows[0]['created_at'], rows[0]['type'])
    }
  }

  static async searchPosts(query) {
    const { rows } = await client.query(`
    SELECT * FROM posts
    WHERE title ILIKE '%${query}%' OR content ILIKE '%${query}%'
    `)
    return {
      posts: rows
    }
  }

  static async addComment(content, user_id, post_id) {
    await client.query(`
    INSERT INTO comments (content, user_id, post_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [content, user_id, post_id])
  }

  static async deleteComment(id) {
    await client.query(`
    DELETE FROM comments
    WHERE id = $1
  `, [id])
  }

  static async getAllComments(post_id) {
    const { rows } = await client.query(`
    SELECT * FROM comments
    WHERE post_id = $1
  `, [post_id])

    if (rows.length === 0) {
      return {
        status: 404,
        message: 'No comments found'
      }
    }
    let comments = []

    for (let i = 0; i < rows.length; i++) {
      comments.push(new Comment(rows[i]['id'], rows[i]['content'], rows[i]['user_id'], rows[i]['post_id'], rows[i]['created_at']))
    }
    return {
      status: 200,
      comments: comments
    }
  }

  static async getCommentsCountByPost(post_id) {
    const { rows } = await client.query(`
    SELECT COUNT(*) FROM comments
    WHERE post_id = $1
  `, [post_id])
    return rows[0].count
  }

  static async getCommentsCountByUser(user_id) {
    const { rows } = await client.query(`
    SELECT COUNT(*) FROM comments
    WHERE user_id = $1
  `, [user_id])
    return rows[0].count
  }

  static async getComments(post_id) {
    const { rows } = await client.query(`
    SELECT * FROM comments
    WHERE post_id = $1
  `, [post_id])
    return {
      comments: rows
    }
  }

  static async getAnswer(name) {
    const rows = await client.query(`
    SELECT * FROM bot_answers
    WHERE name = $1
  `, [name])
    return rows.rows[0]['content']
  }

  static async addAnswer(name, content) {
    await client.query(`
    INSERT INTO bot_answers (name, content)
    VALUES ($1, $2)
    RETURNING *
  `, [name, content])
  }

  static async getLikesCount(post_id) {
    const { rows } = await client.query(`
  SELECT COUNT(*) FROM likes
  WHERE post_id = $1
  `, [post_id])
    return rows[0].count
  }

  static async likePost(post_id, user_id) {
    const { rows } = await client.query(`
    SELECT * FROM posts
    WHERE id = $1
  `, [post_id])
    if (rows.length === 0) {
      return {
        status: 404,
        message: 'Post not found'
      }
    }

    let resp = await client.query(`
    SELECT * FROM likes
    WHERE post_id = $1 AND user_id = $2
  `, [post_id, user_id])

    if (resp.rowCount === 0) {
      await client.query(`
      INSERT INTO likes (post_id, user_id)
      VALUES ($1, $2)
    `, [post_id, user_id])

      return {
        status: 200,
        likes: Db.getLikesCount(post_id)
      }
    }
    else {
      await client.query(`
      DELETE FROM likes
      WHERE post_id = $1 AND user_id = $2
    `, [post_id, user_id])

      return {
        status: 200,
        likes: Db.getLikesCount(post_id)
      }
    }

  }

  static async endConnection() {
    await client.end()
  }
}

module.exports = Db
