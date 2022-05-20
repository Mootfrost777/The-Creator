const { Markup } = require("telegraf");

async function getDefaultFeedKeyboard() {
    return Markup.keyboard([
        ['Дальше', 'Назад'],
        ['Выйти', 'Сотировка']
    ]).oneTime().resize()
}

async function getWebAppFeedKeyboard() {
    return Markup.keyboard([
        ['Открыть в браузере'],
        ['Дальше', 'Назад'],
        ['Выйти', 'Сотировка']
    ]).oneTime().resize()
}

async function getRandomKeyboard() {
    return Markup.keyboard([
        ['Нет', 'Да']
    ]).oneTime().resize()
}

async function getPostInline() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('❤️', 'like'), Markup.button.callback('💬', 'comment')]
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
    ]).oneTime().resize()
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