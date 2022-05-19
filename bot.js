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
    console.log(await db.getAnswer('onLogin'))
    const answer = await db.getAnswer('onLogin')
    ctx.reply(answer.toString().replace('{username}', ctx.from.username).replace('{carma}', reply['user'].carma))
  })()
})

bot.help((ctx) => {
  (async function() {
    const answer = await db.getAnswer('onHelp')
    for (let command in bot.commands)
    {
      console.log(command)
    }
  })()
})


bot.launch().then(() => console.log(`${config.get('bot.name')} started`))



