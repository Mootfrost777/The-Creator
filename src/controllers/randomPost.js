const { Scenes, Markup } = require('telegraf')
const db = require('../lib/db')

async function getActionKeyboard() {
    return Markup.keyboard([
        ['Нет', 'Да']
    ]).oneTime().resize()
}

async function getPostInline(likes_count, comments_count) {
    return Markup.inlineKeyboard([
        Markup.button.callback(`❤ ${likes_count}`, 'like'), Markup.button.callback(`💬 ${comments_count}`, 'comment')
    ]).oneTime().resize()
}

const randomPost = new Scenes.WizardScene('randomPost',
  async (ctx) => {
    const post = await db.getRandomPost()
    ctx.wizard.state.post = {}
    ctx.wizard.state.post.id = post['post'].id
    if (post['post'].type === 'chat') {
        let reply  = `${post['post'].title}\n\n`
        reply += `${post['post'].text}`

        await ctx.reply(reply, await getPostInline(await db.getLikesCount(post['post'].id), await db.getCommentsCountByPost(ctx.wizard.state.post.id)))

        await ctx.reply('Продолжить?', await getActionKeyboard())
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
            await ctx.editMessageReplyMarkup(JSON.parse(JSON.stringify(await getPostInline(await db.getLikesCount(ctx.wizard.state.post.id), await db.getCommentsCount(ctx.wizard.state.post.id))))['reply_markup'])
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

randomPost.action('comment', async (ctx) => ctx.scene.enter('comment', { post_id: ctx.wizard.state.post.id }))

module.exports = randomPost