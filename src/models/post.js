class Post {
    title
    text
    user_id
    likes
    type
    created_at

    constructor(title, text, user_id, likes, created_at, type) {
        this.title = title
        this.text = text
        this.user_id = user_id
        this.likes = likes
        this.type = type
        this.created_at = created_at
    }
}

module.exports = Post