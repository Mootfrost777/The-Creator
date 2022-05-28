const { Scenes } = require('telegraf')
const db = require('../lib/db')
const Post = require('../models/post')
const keyboard = require('../lib/keyboards')
const config = require('config')


async function getCommentsPage(ctx) {
    const comments = ctx.wizard.state.comments.comments
    let page = `Страница ${ctx.wizard.state.comments.page}:`

    for (let i = (ctx.wizard.state.comments.page - 1) * 10; i < 10 * ctx.wizard.state.comments.page; i++) {
        if (comments[i]) {
            page += `\n${i}. ${comments[i].content}`
        }
        else break
    }
    return page
}

async function editCommentsPage(ctx, page) {
    await ctx.editMessageText(page)
    try {
        await ctx.editMessageReplyMarkup(await keyboard.commentListInline(ctx.wizard.state.comments.page, ctx.wizard.state.comments.comments.length / config.get('interface.commentsPerPage')))
    }
    catch (e) {
        await ctx.reply('Проблема при изменении страницы, в скором времени будет исправлено.')
    }
}

const comment = new Scenes.WizardScene('comment',
    async (ctx) => {
        ctx.wizard.state.comments = {}

        await ctx.reply('Выберите действие:', await keyboard.commentSelect())
        ctx.wizard.next()
    },
    async (ctx) => {
        if (ctx.message != null) {
            switch (ctx.message.text) {
                case 'Посмотреть все':
                    const comments = await db.getAllComments(ctx.wizard.state.post_id)
                    if (comments['status'] !== 200) {
                        await ctx.reply('Не удалось получить комментарии')
                        return ctx.scene.reenter()
                    }

                    ctx.wizard.state.comments.comments = comments['comments']
                    ctx.wizard.state.comments.page = 1

                    await ctx.reply(await getCommentsPage(ctx), await keyboard.commentListInline(ctx.wizard.state.comments.page, comments.length / config.get('interface.commentsPerPage')))
                    await ctx.scene.reenter()
                    break
                case 'Написать':
                    await ctx.reply('Введите текст комментария:')
                    ctx.wizard.next()
                    break
                case 'Выйти':
                    await ctx.reply('Выход...')
                    await ctx.scene.leave()
                    break
            }
        }
    },
    async (ctx) => {
        if (ctx.message != null) {
            const post = await db.getPost(ctx.wizard.state.post_id)
            const comment = await db.addComment(ctx.message.text, ctx.from.id, ctx.wizard.state.post_id)
            await ctx.reply('Комментарий добавлен!')
            await ctx.reply('Вы можете посмотреть его в любое время в вашем профиле или в коментариях к посту.')
            await ctx.scene.reenter()
        }
    })

comment.action('next', async (ctx) => {
    ctx.wizard.state.comments.page++
    await editCommentsPage(ctx, await getCommentsPage(ctx))
})

comment.action('prev', async (ctx) => {
    ctx.wizard.state.comments.page--
    await editCommentsPage(ctx, await getCommentsPage(ctx))
})

module.exports = comment