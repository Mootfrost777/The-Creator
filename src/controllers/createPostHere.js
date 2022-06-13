const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')
const Post = require('../models/post')

async function getSelectActionKeyboard(ctx) {
    const { i18n } = ctx.scene.state
    return Markup.keyboard([
        [await i18n.t('button.cancel'), await i18n.t('createPost.publishBtn')]
    ]).oneTime().resize()
}

const createPostHere = new Scenes.WizardScene('createPostHere',
    async (ctx) => {
        if (ctx.i18n != null) {
            ctx.scene.state.i18n = ctx.i18n
        }
        const { i18n } = ctx.scene.state
        ctx.wizard.state.post = {}
        await ctx.replyWithHTML(await i18n.t('createPost.promptTitle'))
        ctx.wizard.next()
    },
    async (ctx) => {
        const { i18n } = ctx.scene.state
        ctx.wizard.state.post.title = ctx.message.text
        await ctx.replyWithHTML(await i18n.t('createPost.promptText'))
        ctx.wizard.next()
    },
    async (ctx) => {
        const { i18n } = ctx.scene.state
        ctx.wizard.state.post.text = ctx.message.text
        let reply = await i18n.t('createPost.promptText', {
            title: ctx.wizard.state.post.title,
            text: ctx.wizard.state.post.text
        })
        await ctx.replyWithHTML(replyWithHTML, await getSelectActionKeyboard(ctx))
        ctx.wizard.next()
    },
    async (ctx) => {
        const { i18n } = ctx.scene.state
        if (ctx.message != null) {
            switch (ctx.message.text) {
                case await i18n.t('createPost.publishBtn'):
                    await db.createPost(new Post(0, ctx.wizard.state.post.title, ctx.wizard.state.post.text, ctx.from.id, 0, 0, 'chat'))
                    await ctx.replyWithHTML(await i18n.t('createPost.publishSuccess'))
                    await ctx.scene.leave()
                    break
                case await i18n.t('button.cancel'):
                    await ctx.replyWithHTML(await i18n.t('action.cancelled'))
                    await ctx.scene.leave()
                    break
            }
        }
    }
)

module.exports = createPostHere