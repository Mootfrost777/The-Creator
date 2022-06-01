const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')

async function getViewProfileKeyboard() {
    return Markup.keyboard([
        ['Поделиться профилем', 'Выйти']
    ]).oneTime().resize()
}

const viewProfile = new Scenes.WizardScene('viewProfile',
    async (ctx) => {
    let answer = await db.getAnswer('onViewProfile')
    let reply = await db.getUser(ctx.wizard.state.userId)
    console.log(reply)

    await ctx.reply(answer
        .replace('{carma}', reply['user'].carma)
        .replace('{posts}', await db.getPostsCount(ctx.wizard.state.userId))
        .replace('{likes}', await db.getLikesCount(ctx.wizard.state.userId))
        .replace('{comments}', await db.getCommentsCountByUser(ctx.wizard.state.userId))
    , await getViewProfileKeyboard())
    ctx.wizard.next()
    },
    async (ctx) => {
    if (ctx.message != null) {
        switch (ctx.message.text) {
            case 'Поделиться профилем':
                break
            case 'Выйти':
                await ctx.scene.leave()
                break
        }
    }
})

module.exports = viewProfile