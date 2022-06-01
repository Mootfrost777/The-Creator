const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')

async function getProfileKeyboard() {
    return Markup.keyboard([
        ['Поделиться профилем', 'Настройки'],
        ['Выйти']
    ]).oneTime().resize()
}

const profile = new Scenes.WizardScene('profile',
    async (ctx) => {
    let answer = await db.getAnswer('onProfile')
    let reply = await db.getUser(ctx.from.id)

    await ctx.reply(answer
        .replace('{username}', ctx.from.username)
        .replace('{carma}', reply['user'].carma)
        .replace('{posts}', await db.getPostsCount(ctx.from.id))
        .replace('{comments}', await db.getCommentsCountByUser(ctx.from.id))
    , await getProfileKeyboard())
    ctx.wizard.next()
    },
    async (ctx) => {
        if (ctx.message != null) {
            switch (ctx.message.text) {
                case 'Выйти':
                    await ctx.scene.leave()
                    break
                case 'Настройки':
                    await ctx.scene.enter('profileSettings')
                    break
                case 'Поделиться профилем':
                    break
            }
        }
    })

module.exports = profile

