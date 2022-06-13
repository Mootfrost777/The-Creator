const { Telegraf, Scenes, session, Markup} = require('telegraf')
const { match } = require('telegraf-i18n')
const { comment, createPostHere, profile, profileSettings, randomPost, viewProfile, search } = require('./src/controllers')
const User = require('./src/models/user')
const config = require('config');
const db = require('./src/lib/db')
const TelegrafI18n = require("telegraf-i18n");
const path = require("path");


db.createDB().then(() => console.log('DB initialized'))
const bot = new Telegraf(config.get('bot.token'))

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false,
    directory: path.resolve(__dirname, 'locales')
})

const stage = new Scenes.Stage([comment, createPostHere, profile, profileSettings, randomPost, viewProfile, search])
bot.use(Telegraf.log());
bot.use(session());
bot.use(stage.middleware());
bot.use(i18n.middleware())

async function getCreatePostKeyboard(ctx, link) {
  return Markup.keyboard([
    [Markup.button.webApp(ctx.i18n.t('createPost.createWebAppBtn'), link), ctx.i18n.t('createPost.createHereBtn')]
  ]).oneTime().resize()
}

bot.hears(match('createPost.createHereBtn'), (ctx) => ctx.scene.enter('createPostHere'))

bot.start((ctx) => {
  (async function() {
    await ctx.replyWithHTML(ctx.i18n.t('start.greeting'))

    console.log('\n\n\n\n\n\n' + ctx.from.id + '\n\n\n\n\n\n')
    const reply = await db.createUser(new User(ctx.from.id, 0))
    const message = ctx.i18n.t('start.profileSummary', {
      username: ctx.from.username,
      carma: reply['user'].carma,
    })
    ctx.replyWithHTML(message)

  })()
})

bot.command('add', (ctx) => {
  (async function() {
    ctx.replyWithHTML(ctx.i18n.t('action.promptAction'), await getCreatePostKeyboard(ctx, 'https://mootfrost.ru/'))
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
          await ctx.replyWithHTML(ctx.i18n.t('viewProfile.noUserIdProvided'))
        }

    })()
})
bot.command('search', (ctx) => ctx.scene.enter('search'))

bot.help((ctx) => {
  (async function() {
    let commands = ''
    for (let command of await bot.telegram.getMyCommands()) {
      commands += (command['command'] + ' - ' + command['description'] + '\n')
    }

    await ctx.replyWithHTML(await ctx.i18n.t('help.commands', {
      commands: commands
    }))
  })()
})

bot.launch().then(() => console.log(`${config.get('bot.name')} started`))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

module.exports = bot



