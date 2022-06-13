const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')

async function getSettingsKeyboard(ctx) {
    const { i18n } = ctx.scene.state
    return Markup.keyboard([
        [await i18n.t('profile.changeDescriptionBtn'), await i18n.t('button.exit')],
        [await i18n.t('profile.resetBtn')]
    ]).oneTime().resize()
}

const profileSettings = new Scenes.WizardScene('profileSettings',
    async (ctx) => {
    if (ctx.i18n != null) {
        ctx.scene.state.i18n = ctx.i18n
    }
    const { i18n } = ctx.scene.state
    await ctx.replyWithHTML(await i18n.t('action.promptAction'), await getSettingsKeyboard(ctx))
    ctx.wizard.next()
    },
    async (ctx) => {
    const { i18n } = ctx.scene.state
    if (ctx.message != null) {
        switch (ctx.message.text) {
            case await i18n.t('profile.changeDescriptionBtn'):
                await ctx.replyWithHTML(await i18n.t('error.comingSoon'))
                break
            case await i18n.t('profile.resetBtn'):
                await ctx.replyWithHTML(await i18n.t('profile.confirmReset'))
                await ctx.wizard.next()
                break
            case await i18n.t('button.exit'):
                await ctx.replyWithHTML(await i18n.t('action.exit'))
                await ctx.scene.leave()
        }
    }
    },
    async (ctx) =>{
    const { i18n } = ctx.scene.state
    if (ctx.message != null) {
        if (ctx.message.text === ctx.from.username) {
            await db.resetUser(ctx.from.id)
            await ctx.replyWithHTML(await i18n.t('profile.resetSuccess'))
        }
        else {
            await ctx.replyWithHTML(await i18n.t('profile.resetError'))
        }
        await ctx.scene.reenter()
    }
    })

module.exports = profileSettings