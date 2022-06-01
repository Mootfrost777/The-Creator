const {Markup} = require("telegraf");

async function getPageInline(page, maxPage) {
    if (page === 1) {
        return Markup.inlineKeyboard([
            Markup.button.callback('Вперед', 'next')
        ]).oneTime().resize()
    }
    if (page === maxPage) {
        return Markup.inlineKeyboard([
            Markup.button.callback('Назад', 'prev')
        ]).oneTime().resize()
    }
    if (maxPage === 1 || maxPage === 0) {
        return
    }
    return Markup.inlineKeyboard([
        Markup.button.callback('Назад', 'prev'),
        Markup.button.callback('Вперед', 'next')
    ]).oneTime().resize()
}

module.exports = getPageInline;