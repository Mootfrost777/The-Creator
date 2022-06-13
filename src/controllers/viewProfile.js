const { Scenes, Markup } = require('telegraf')
const { match } = require('telegraf-i18n')
const db = require('../lib/db')

async function getViewProfileKeyboard(ctx) {
    const { i18n } = ctx.scene.state
    return Markup.keyboard([
        [await i18n.t('button.share'), await i18n.t('button.exit')]
    ]).oneTime().resize()
}

const viewProfile = new Scenes.WizardScene('viewProfile',
    async (ctx) => {
    if (ctx.i18n != null) {
        ctx.scene.state.i18n = ctx.i18n
    }
    const { i18n } = ctx.scene.state
    let reply = await db.getUser(ctx.wizard.state.userId)
    console.log(reply)
    await ctx.replyWithHTML(i18n.t('viewProfile.summary', {
        carma: reply['user'].carma,
        posts: await db.getPostsCount(ctx.wizard.state.userId),
        comments: await db.getCommentsCountByUser(ctx.wizard.state.userId)
    }),
    await getViewProfileKeyboard(ctx))
    ctx.wizard.next()
    },
    async (ctx) => {
    const { i18n } = ctx.scene.state
    if (ctx.message != null) {
        switch (ctx.message.text) {
            case await i18n.t('button.share'):
                await ctx.replyWithHTML(await i18n.t('error.comingSoon'))
                break
            case await i18n.t('button.exit'):
                await ctx.replyWithHTML(await i18n.t('action.exit'))
                await ctx.scene.leave()
                break
        }
    }
})

module.exports = viewProfile