const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')
const Post = require('../models/post')







async function checkAction(ctx) {
    switch (ctx.message.text())
    {
        case 'Дальше':
            return 'next'
            break
        case 'Назад':
            return 'back'
            break
        case 'Выйти':
            return 'exit'
            break
        case 'Сотировка':
            return 'sort'
            break
        case 'Открыть в браузере':
            return 'open';
            break
        case 'По дате':
            return 'date';
            break
        case 'По популярности':
            return 'popularity';
            break
        case 'Вернуться к ленте':
            return 'back';
            break
    }
}

const feed = new Scenes.WizardScene('feed',
    async (ctx) =>{
        let post = await db.getPost(ctx.session.user.id, ctx.session.feed.page)
        await checkAction(ctx)
    })