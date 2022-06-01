const { Scenes, Markup } = require('telegraf')
const { getPageInline } = require('./utils')
const db = require('../lib/db')
const config = require("config");

async function getSearchKeyboard() {
    return Markup.keyboard([
        ['Еще раз', 'Выйти']
    ])
}

async function getSearchPage(ctx) {
    const posts = ctx.wizard.state.posts.posts
    let page = `Страница ${ctx.wizard.state.posts.page}:`

    for (let i = (ctx.wizard.state.posts.page - 1) * 10; i < 10 * ctx.wizard.state.posts.page; i++) {
        if (posts[i]) {
            page += `\n${i + 1}. ${posts[i].title}`
        }
        else break
    }
    return page
}

async function editSearchPage(ctx, page) {
    await ctx.editMessageText(page)
    try {
        await ctx.editMessageReplyMarkup(await getPageInline(ctx.wizard.state.posts.page, ctx.wizard.state.posts.posts.length / config.get('interface.elementsPerPage')))
    }
    catch (e) {
        await ctx.reply('Проблема при изменении страницы, в скором времени будет исправлено(нет).')
    }
}

const search = new Scenes.WizardScene('search',
    async (ctx) => {
    ctx.wizard.state.posts = {}
    await ctx.reply('Введите автора или ключевое слово:')
    ctx.wizard.next()
    },
    async (ctx) => {
    if (ctx.message != null) {
        const posts = await db.searchPosts(ctx.message.text)
        ctx.wizard.state.posts.page = 1
        ctx.wizard.state.posts.posts = posts['posts']
        await ctx.reply(await getSearchPage(ctx), await getPageInline(ctx.wizard.state.posts.page, ctx.wizard.state.posts.posts.length / config.get('interface.elementsPerPage')))
        await ctx.reply('Введите номер поста или выберите действие:', await getSearchKeyboard())
    }
    },
    async (ctx) => {
    if (ctx.message != null) {
        switch (ctx.message.text) {
            case 'Еще раз':
                await ctx.scene.reenter()
                break
            case 'Выйти':
                await ctx.reply('Выход...')
                await ctx.scene.leave()
                break
            default:
                if (!isNaN(ctx.message.text)) {
                    if (ctx.wizard.state.posts.posts[parseInt(ctx.message.text)].type === 'chat') {
                        let reply  = `${ctx.wizard.state.posts.posts['post'].title}\n\n`
                        reply += `${ctx.wizard.state.posts.posts['post'].text}`

                        await ctx.reply(reply)
                        await ctx.scene.leave()
                    }
                }
                else {
                    await ctx.reply('Неверный ввод.')
                }
        }
    }
})

module.exports = search