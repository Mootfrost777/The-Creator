const { Markup } = require("telegraf");

async function getPageInline(ctx, page, maxPage) {
    const { i18n } = ctx.scene.state
    if (page === 1) {
        return Markup.inlineKeyboard([
            Markup.button.callback(await i18n.t('button.next'), 'next')
        ]).oneTime().resize()
    }
    if (page === maxPage) {
        return Markup.inlineKeyboard([
            Markup.button.callback(await i18n.t('button.prev'), 'prev')
        ]).oneTime().resize()
    }
    if (maxPage === 1 || maxPage === 0) {
        return
    }
    return Markup.inlineKeyboard([
        Markup.button.callback(await i18n.t('button.prev'), 'prev'),
        Markup.button.callback(await i18n.t('button.next'), 'next')
    ]).oneTime().resize()
}

module.exports = getPageInline;