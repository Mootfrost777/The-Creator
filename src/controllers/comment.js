const { Scenes, Markup } = require('telegraf')
const { getPageInline } = require('./utils')
const db = require('../lib/db')
const config = require('config')

async function getSelectKeyboard(ctx) {
    const { i18n } = ctx.scene.state
    return Markup.keyboard([
        [await i18n.t('button.exit'), await i18n.t('comment.viewAllBtn'), await i18n.t('comment.writeBtn')]
    ]).oneTime().resize()
}

async function getCommentsPage(ctx) {
    const comments = ctx.wizard.state.comments.comments
    let elements = ''
    for (let i = (ctx.wizard.state.comments.page - 1) * 10; i < 10 * ctx.wizard.state.comments.page; i++) {
        if (comments[i]) {
            elements += `\n${i}. ${comments[i].content}`
        }
        else break
    }

    return await ctx.i18n.t('page', {
        page: ctx.wizard.state.comments.page,
        pages: comments.length / config.get('interface.elementsPerPage'),
        elements: elements
    })
}

async function editCommentsPage(ctx, page) {
    const { i18n } = ctx.scene.state
    await ctx.editMessageText(page)
    try {
        await ctx.editMessageReplyMarkup(await getPageInline(ctx.wizard.state.comments.page, ctx.wizard.state.comments.comments.length / config.get('interface.elementsPerPage')))
    }
    catch (e) {
        await ctx.replyWithHTML(await i18n.t('error.keyboardEdit'))
    }
}

const comment = new Scenes.WizardScene('comment',
    async (ctx) => {
        if (ctx.i18n != null) {  // А это, чтобы при scene.reenter() ничего не ломалось
            ctx.scene.state.i18n = ctx.i18n  // Иначе не работает, telegraf зарукопопили
        }
        const { i18n } = ctx.scene.state
        ctx.wizard.state.comments = {}
        await ctx.replyWithHTML(await i18n.t('action.promptAction'), await getSelectKeyboard(ctx))
        ctx.wizard.next()
    },
    async (ctx) => {
        const { i18n } = ctx.scene.state
        if (ctx.message != null) {
            switch (ctx.message.text) {
                case await i18n.t('comment.viewAllBtn'):
                    const comments = await db.getAllComments(ctx.wizard.state.post_id)
                    if (comments['status'] !== 200) {
                        await ctx.replyWithHTML(await i18n.t('comment.commentsGetError'))
                        return ctx.scene.reenter()
                    }

                    ctx.wizard.state.comments.comments = comments['comments']
                    ctx.wizard.state.comments.page = 1

                    await ctx.replyWithHTML(await getCommentsPage(ctx), await getPageInline(ctx, ctx.wizard.state.comments.page, comments.length / config.get('interface.elementsPerPage')))
                    await ctx.scene.reenter()
                    break
                case await i18n.t('comment.writeBtn'):
                    await ctx.replyWithHTML(await i18n.t('comment.promptText'))
                    ctx.wizard.next()
                    break
                case await i18n.t('buttons.exit'):
                    await ctx.replyWithHTML(await i18n.t('action.exit'))
                    await ctx.scene.leave()
                    break
            }
        }
    },
    async (ctx) => {
        const { i18n } = ctx.scene.state
        if (ctx.message != null) {
            await db.addComment(ctx.message.text, ctx.from.id, ctx.wizard.state.post_id)
            await ctx.replyWithHTML(await i18n.t('comment.commentAddSuccess'))
            await ctx.scene.reenter()
        }
    })

comment.action('next', async (ctx) => {
    ctx.wizard.state.comments.page++
    await editCommentsPage(ctx, await getCommentsPage(ctx))
})

comment.action('prev', async (ctx) => {
    ctx.wizard.state.comments.page--
    await editCommentsPage(ctx, await getCommentsPage(ctx))
})

module.exports = comment