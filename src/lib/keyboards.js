const { Markup } = require("telegraf");
const {max} = require("pg/lib/defaults");

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



async function getPostInline(likes_count, comments_count) {
    return Markup.inlineKeyboard([
        Markup.button.callback(`❤ ${likes_count}`, 'like'), Markup.button.callback(`💬 ${comments_count}`, 'comment')
    ]).oneTime().resize()
}

async function getCreatePostKeyboard(link) {
    return Markup.keyboard([
        [Markup.button.webApp('Создать в редакторе', link), 'Создать здесь']
    ]).oneTime().resize()
}

async function commentSelect() {
    return Markup.keyboard([
        ['Выйти', 'Посмотреть все', 'Написать']
    ]).oneTime().resize()
}

async function commentIn() {
    return Markup.keyboard([
        ['Назад']
    ]).oneTime().resize()
}

async function commentListInline(page, max_page) {
    if (page === 1) {
        return Markup.inlineKeyboard([
            Markup.button.callback('Вперед', 'next')
        ]).oneTime().resize()
    }
    if (page === max_page) {
        return Markup.inlineKeyboard([
            Markup.button.callback('Назад', 'prev')
        ]).oneTime().resize()
    }
    if (max_page === 1 || max_page === 0) {
        return
    }
    return Markup.inlineKeyboard([
        Markup.button.callback('Назад', 'prev'),
        Markup.button.callback('Вперед', 'next')
    ]).oneTime().resize()
}

async function clearMarkup() {
    return Markup.removeKeyboard()
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
    getPostInline,
    commentSelect,
    commentIn,
    commentListInline,
    clearMarkup
}