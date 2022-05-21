class Comment {
    id
    content
    post_id
    user_id
    created_at

    constructor(id, content, post_id, user_id, created_at) {
        this.id = id
        this.content = content
        this.post_id = post_id
        this.user_id = user_id
        this.created_at = created_at
    }
}

module.exports = Comment