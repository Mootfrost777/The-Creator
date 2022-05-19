const { Telegraf } = require('telegraf')
const config = require('config');
const db = require('./db')
let User = require('./user')


db.createDB().then(() => console.log('DB created'))

const bot = new Telegraf(config.get('bot.token'))

bot.start((ctx) => {
  (async function() {
    ctx.reply(await db.getAnswer('onStart'))

    const reply = await db.createUser(ctx.from.id)
    const answer = await db.getAnswer('onLogin')
    ctx.reply(answer.toString().replace('{username}', ctx.from.username).replace('{carma}', reply['user'].carma))
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



