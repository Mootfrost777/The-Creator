const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')
const Post = require('../models/post')
const keyboard = require('../lib/keyboards')


async function checkAction(ctx) {
    switch (ctx.message.text) {
        case 'Опубликовать':
            await db.createPost(new Post(ctx.wizard.state.post.title, ctx.wizard.state.post.text, ctx.from.id, 0, 'chat'))
            ctx.reply('Пост успешно опубликован!')
            await ctx.scene.leave()
            break
        case 'Отмена':
            ctx.reply('Отменено')
            await ctx.scene.leave()
            break
    }
}

const createPostHere = new Scenes.WizardScene('createPostHere',
    async (ctx) => {
        ctx.wizard.state.post = {}
        ctx.reply('Введите название поста')
        ctx.wizard.next()
    },
    async (ctx) => {
        ctx.wizard.state.post.title = ctx.message.text
        ctx.reply('Введите текст поста')
        ctx.wizard.next()
    },
    async (ctx) => {
        ctx.wizard.state.post.text = ctx.message.text
        let reply = 'Предпросмотр поста: \n'
        reply += `Название: **${ctx.wizard.state.post.title}**\n`
        reply += `Текст: ${ctx.wizard.state.post.text}`
        ctx.reply(reply, await keyboard.getApplyKeyboard())
        ctx.wizard.next()
    },
    async (ctx) => {
        await checkAction(ctx)
    }
)

module.exports = createPostHere