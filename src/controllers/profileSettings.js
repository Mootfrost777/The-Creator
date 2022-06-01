const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')

async function getSettingsKeyboard() {
    return Markup.keyboard([
        ['Изменить описание', 'Выйти'],
        ['Сбросить аккаунт']
    ]).oneTime().resize()
}

const profileSettings = new Scenes.WizardScene('profileSettings',
    async (ctx) => {
    await ctx.reply('Выберите действие:', await getSettingsKeyboard())
    ctx.wizard.next()
    },
    async (ctx) => {
    if (ctx.message != null) {
        switch (ctx.message.text) {
            case 'Изменить описание':
                await ctx.reply('Пока в разработке.')
                break
            case 'Сбросить аккаунт':
                await ctx.reply('Введите ваше имя пользователя для подтверждения. Это действие будет невозможно отменить!')
                await ctx.wizard.next()
                break
            case 'Выйти':
                await ctx.reply('Выход...')
                await ctx.scene.leave()
        }
    }
    },
    async (ctx) =>{
    if (ctx.message != null) {
        if (ctx.message.text === ctx.from.username) {
            await db.resetUser(ctx.from.id)
        }
        else {
            await ctx.reply('Сброс не удался, неверное имя пользователя.')
        }
        await ctx.scene.reenter()
    }
    })

module.exports = profileSettings