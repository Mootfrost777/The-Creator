const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')

async function getProfileKeyboard(ctx) {
    const { i18n } = ctx.scene.state
    return Markup.keyboard([
        [await i18n.t('button.share'), await i18n.t('button.settings')],
        [await i18n.t('button.exit')]
    ]).oneTime().resize()
}

const profile = new Scenes.WizardScene('profile',
    async (ctx) => {
    if (ctx.i18n != null) {
        ctx.scene.state.i18n = ctx.i18n
    }
    const { i18n } = ctx.scene.state
    let reply = await db.getUser(ctx.from.id)
    await ctx.replyWithHTML(await i18n.t('profile.summary', {
        username: ctx.from.username,
        carma: reply['user'].carma,
        posts: await db.getPostsCount(ctx.from.id),
        comments: await db.getCommentsCountByUser(ctx.from.id)
    }),
    await getProfileKeyboard(ctx))
    ctx.wizard.next()
    },
    async (ctx) => {
        const { i18n } = ctx.scene.state
        if (ctx.message != null) {
            switch (ctx.message.text) {
                case await i18n.t('button.exit'):
                    await i18n.t('action.exit')
                    await ctx.scene.leave()
                    break
                case await i18n.t('button.settings'):
                    await ctx.scene.enter('profileSettings')
                    break
                case await i18n.t('button.share'):
                    break
            }
        }
    })

module.exports = profile

