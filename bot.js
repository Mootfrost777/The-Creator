const { Telegraf, Markup, Scenes, session, Stage} = require('telegraf');
const createHere = require('./src/controllers/createPostHere')
const keyboard = require('./src/lib/keyboards')

const config = require('config');
const db = require('./src/lib/db')

db.createDB().then(() => console.log('DB created'))


const bot = new Telegraf(config.get('bot.token'))

const stage = new Scenes.Stage([createHere])
bot.use(Telegraf.log());
bot.use(session());
bot.use(stage.middleware());

bot.hears('Создать здесь', (ctx) => ctx.scene.enter('createPostHere'))

bot.start((ctx) => {
  (async function() {
    ctx.reply(await db.getAnswer('onStart'))

    const reply = await db.createUser(ctx.from.id)
    const answer = await db.getAnswer('onLogin')
    ctx.reply(answer.toString().replace('{username}', ctx.from.username).replace('{carma}', reply['user'].carma))

  })()
})

bot.command('add', (ctx) => {
  (async function() {
    ctx.reply('Выберите:', await keyboard.getCreatePostKeyboard('https://mootfr.ru/'))
  })()
})

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

bot.launch().then(() => console.log(`${config.get('bot.name')} started`))



