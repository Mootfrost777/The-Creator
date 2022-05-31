const { Scenes } = require('telegraf')
const db = require('../lib/db')

const profile = new Scenes.WizardScene('profile',
    async (ctx) => {
    let answer = await db.getAnswer('onProfile')
    let reply = await db.getUser(ctx.from.id)

    await ctx.reply(answer
        .replace('{username}', ctx.from.username)
        .replace('{carma}', reply['user'].carma)
        .replace('{posts}', await db.getPostsCount(ctx.from.id))
        .replace('{comments}', await db.getCommentsCountByUser(ctx.from.id)))
    await ctx.reply('Выберите действие:')
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
            await ctx.scene.reenter()
        }
    })

module.exports = profile

