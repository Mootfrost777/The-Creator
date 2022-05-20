const { Scenes } = require('telegraf')
const db = require('../lib/db')
const keyboard = require('../lib/keyboards')

const randomPost = new Scenes.WizardScene('randomPost',
  async (ctx) => {
    const post = await db.getRandomPost()
    if (post['post'].type === 'chat') {
        let reply  = `${post['post'].title}\n\n`
        reply += `${post['post'].text}`

        await ctx.reply(reply, await keyboard.getPostInline())
        await ctx.reply('Продолжить?', await keyboard.getRandomKeyboard())
        ctx.wizard.next()
    }
  },
     async (ctx) => {
        if (ctx.message != null) {
            switch (ctx.message.text) {
                case 'Да':
                    return ctx.scene.reenter()
                case 'Нет':
                    await ctx.reply('Выход...')
                    return ctx.scene.leave()
                default:
                    await ctx.reply('Неверный ввод. Попробуйте еще раз.')
                    break
            }
        }
  })

randomPost.hears('like', (ctx) => console.log('like'))
randomPost.hears('comment', (ctx) => console.log('comment')) // Doesn't work

module.exports = randomPost
