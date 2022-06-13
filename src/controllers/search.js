const { Scenes, Markup } = require('telegraf')
const { match } = require('telegraf-i18n')
const { getPageInline } = require('./utils')
const db = require('../lib/db')
const config = require("config");

async function getSearchKeyboard(ctx) {
    const { i18n } = ctx.scene.state
    return Markup.keyboard([
        [await i18n.t('search.repeatBtn'), await i18n.t('button.exit')]
    ])
}

async function getSearchPage(ctx) {
    const { i18n } = ctx.scene.state
    const posts = ctx.wizard.state.posts.posts

    let elements = ''
    for (let i = (ctx.wizard.state.posts.page - 1) * 10; i < 10 * ctx.wizard.state.posts.page; i++) {
        if (posts[i]) {
            elements += `\n${i + 1}. ${posts[i].title}`
        }
        else break
    }
    return await i18n.t('page', {
        page: ctx.wizard.state.posts.page,
        pages: ctx.wizard.state.posts.posts.length / config.get('interface.elementsPerPage'),
        elements: elements
    })
}

async function editSearchPage(ctx, page) {
    const { i18n } = ctx.scene.state
    await ctx.editMessageText(page)
    try {
        await ctx.editMessageReplyMarkup(await getPageInline(ctx.wizard.state.posts.page, ctx.wizard.state.posts.posts.length / config.get('interface.elementsPerPage')))
    }
    catch (e) {
        await ctx.replyWithHTML(i18n.t('error.keyboardEdit'))
    }
}

const search = new Scenes.WizardScene('search',
    async (ctx) => {
    if (ctx.i18n != null) {
        ctx.scene.state.i18n = ctx.i18n
    }
    const { i18n } = ctx.scene.state
    ctx.wizard.state.posts = {}
    await ctx.replyWithHTML(await i18n.t('search.promptKeyword'))
    ctx.wizard.next()
    },
    async (ctx) => {
    const { i18n } = ctx.scene.state
    if (ctx.message != null) {
        const posts = await db.searchPosts(ctx.message.text)
        ctx.wizard.state.posts.page = 1
        ctx.wizard.state.posts.posts = posts['posts']
        await ctx.replyWithHTML(await getSearchPage(ctx), await getPageInline(ctx, ctx.wizard.state.posts.page, ctx.wizard.state.posts.posts.length / config.get('interface.elementsPerPage')))
        await ctx.replyWithHTML(await i18n.t('search.promptPostId'), await getSearchKeyboard(ctx))
        ctx.wizard.next()
    }
    },
    async (ctx) => {
    const { i18n } = ctx.scene.state
    if (ctx.message != null) {
        switch (ctx.message.text) {
            case await i18n.t('search.repeatBtn'):
                await ctx.scene.reenter()
                break
            case await i18n.t('button.exit'):
                await ctx.replyWithHTML(await i18n.t('action.exit'))
                await ctx.scene.leave()
                break
            default:
                if (!isNaN(ctx.message.text)) {
                    if (ctx.wizard.state.posts.posts[parseInt(ctx.message.text)].type === 'chat') {
                        let reply  = `${ctx.wizard.state.posts.posts['post'].title}\n\n`
                        reply += `${ctx.wizard.state.posts.posts['post'].text}`

                        await ctx.replyWithHTML(replyWithHTML)
                        await ctx.scene.leave()
                    }
                }
                else {
                    await ctx.replyWithHTML(await i18n.t('error.invalidInput'))
                }
        }
    }
})

module.exports = search