const {Markup} = require("telegraf");

async function getDefaultFeedKeyboard() {
    return Markup.keyboard([
        ['Дальше', 'Назад'],
        ['Выйти', 'Сотировка']
    ])
}

async function getWebAppFeedKeyboard() {
    return Markup.keyboard([
        ['Открыть в браузере'],
        ['Дальше', 'Назад'],
        ['Выйти', 'Сотировка']
    ])
}

async function getRandomKeyboard() {
    return Markup.keyboard([
        ['Дальше', 'Назад'],
        ['Выйти']
    ])
}

async function getPostInline() {
    return Markup.inlineKeyboard([
        [Markup.callbackButton('нравится', 'like'), Markup.callbackButton('комментировать', 'comment')]
    ]).oneTime().resize()
}

async function getCreatePostKeyboard(link) {
    return Markup.keyboard([
        [Markup.button.webApp('Создать в редакторе', link), 'Создать здесь']
    ]).oneTime().resize()
}

async function getApplyKeyboard() {
    return Markup.keyboard([
        ['Отмена', 'Опубликовать']
    ]).oneTime().resize()
}

async function getSortKeyboard() {
    return Markup.keyboard([
        ['По дате', 'По популярности'],
        ['Вернуться к ленте']
    ])
}

module.exports = {
    getDefaultFeedKeyboard,
    getWebAppFeedKeyboard,
    getCreatePostKeyboard,
    getApplyKeyboard,
    getSortKeyboard,
    getRandomKeyboard,
    getPostInline
}