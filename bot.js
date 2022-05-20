const { Telegraf, Scenes, session } = require('telegraf');
const createHere = require('./src/controllers/createPostHere')
const randomPost = require('./src/controllers/randomPost')
const keyboard = require('./src/lib/keyboards')
const User = require('./src/models/user')

const config = require('config');
const db = require('./src/lib/db')

db.createDB().then(() => console.log('DB created'))


const bot = new Telegraf(config.get('bot.token'))

const stage = new Scenes.Stage([createHere, randomPost])
bot.use(Telegraf.log());
bot.use(session());
bot.use(stage.middleware());


bot.hears('Создать здесь', (ctx) => ctx.scene.enter('createPostHere'))


bot.start((ctx) => {
  (async function() {
    ctx.reply(await db.getAnswer('onStart'))

    console.log('\n\n\n\n\n\n' + ctx.from.id + '\n\n\n\n\n\n')
    const reply = await db.createUser(new User(ctx.from.id, 0))
    const answer = await db.getAnswer('onLogin')
    ctx.reply(answer.toString().replace('{username}', ctx.from.username).replace('{carma}', reply['user'].carma))

  })()
})
bot.command('add', (ctx) => {
  (async function() {
    ctx.reply('Выберите:', await keyboard.getCreatePostKeyboard('https://mootfr.ru/'))
  })()
})
bot.command('random', (ctx) => ctx.scene.enter('randomPost'))
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



