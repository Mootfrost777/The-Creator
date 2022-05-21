const { Scenes, Markup} = require('telegraf')
const db = require('../lib/db')
const keyboard = require('../lib/keyboards')

const randomPost = new Scenes.WizardScene('randomPost',
  async (ctx) => {
    const post = await db.getRandomPost()
    ctx.wizard.state.post = {}
    console.log(post['post'].id)
    ctx.wizard.state.post.id = post['post'].id
    if (post['post'].type === 'chat') {
        let reply  = `${post['post'].title}\n\n`
        reply += `${post['post'].text}`

        await ctx.reply(reply, await keyboard.getPostInline(await db.getLikesCount(post['post'].id), await db.getCommentsCount(post['post'].id)))
        //await ctx.reply('Продолжить?', await keyboard.getRandomKeyboard())
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

randomPost.action('like', async (ctx) => {
    const resp = await db.likePost(ctx.wizard.state.post.id, ctx.from.id)
    if (resp['status'] === 200) {
        try {
            await ctx.editMessageReplyMarkup(JSON.parse(JSON.stringify(await keyboard.getPostInline(await db.getLikesCount(ctx.wizard.state.post.id), db.getCommentsCount(ctx.wizard.state.post.id))))['reply_markup'])
            //await ctx.editMessageReplyMarkup(ctx.chat_id, ctx.message_id, await keyboard.getPostInline(await db.getLikesCount(ctx.wizard.state.post.id), 1))
            // Я хз что тут делать, функция с перегрузкой с message_id тупа удаляет маркап как бы я его не передавал. Шайтан-машина. Так что костыли с try-catch.
        }
        catch (e) {
            console.log(e)
            await ctx.reply('Ошибка при обновлении клавиатуры. Не беспокойтесь, вы уже лайкнули пост.')
        }
    }
    else console.log('ERR')
})

randomPost.action('comment', async (ctx) => ctx.scene.enter('comment'))

module.exports = randomPost
