const { Telegraf, Scenes, session, Markup} = require('telegraf')
const { comment, createPostHere, profile, profileSettings, randomPost, viewProfile, search } = require('./src/controllers')
const User = require('./src/models/user')

const config = require('config');
const db = require('./src/lib/db')

db.createDB().then(() => console.log('DB initialized'))

const bot = new Telegraf(config.get('bot.token'))

const stage = new Scenes.Stage([comment, createPostHere, profile, profileSettings, randomPost, viewProfile, search])
bot.use(Telegraf.log());
bot.use(session());
bot.use(stage.middleware());

async function getCreatePostKeyboard(link) {
  return Markup.keyboard([
    [Markup.button.webApp('Создать в редакторе', link), 'Создать здесь']
  ]).oneTime().resize()
}

bot.hears('Создать здесь', (ctx) => ctx.scene.enter('createPostHere'))


bot.start((ctx) => {
  (async function() {
    let args = ctx.update.message.text.split(' ')
    if (args > 1) {
      await ctx.scene.enter('viewProfile', {userId: args[1]})
      return
    }

    ctx.reply(await db.getAnswer('onStart'))

    console.log('\n\n\n\n\n\n' + ctx.from.id + '\n\n\n\n\n\n')
    const reply = await db.createUser(new User(ctx.from.id, 0))
    const answer = await db.getAnswer('onLogin')
    ctx.reply(answer.toString().replace('{username}', ctx.from.username).replace('{carma}', reply['user'].carma))

  })()
})

bot.command('add', (ctx) => {
  (async function() {
    ctx.reply('Выберите:', await getCreatePostKeyboard('https://mootfrost.ru/'))
  })()
})

bot.command('random', (ctx) => ctx.scene.enter('randomPost'))
bot.command('profile', (ctx) => ctx.scene.enter('profile'))
bot.command('viewprofile', (ctx) => {
    (async function() {
        let args = ctx.update.message.text.split(' ')
        if (args.length > 1) {
          await ctx.scene.enter('viewProfile', {userId: args[1]})
        }
        else {
          await ctx.reply('Неверный ввод.')
        }

    })()
})
bot.command('search', (ctx) => ctx.scene.enter('search'))

bot.help((ctx) => {
  (async function() {
    let answer = await db.getAnswer('onHelp')
    answer = answer.toString()
    answer += '\n'
    for (let command of await bot.telegram.getMyCommands()) {
      answer += (command['command'] + ' - ' + command['description'] + '\n')
    }
    ctx.reply(answer)
  })()
})


bot.action('like', (ctx) => console.log('like'))
bot.action('comment', (ctx) => console.log('comment'))


bot.launch().then(() => console.log(`${config.get('bot.name')} started`))



