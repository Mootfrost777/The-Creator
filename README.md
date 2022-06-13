# The-Creator
Social network telegram edition.

# Features
This bot **performs all the basic functions of a community/social network**. The bot supports **fast localization** into different languages. It is **completely asynchronous**, which allows a large number of people to use the bot at the same time.

# Commands
```help``` - help with commands. <br>
```add``` - create a post(WebApp editor coming soon).<br>
```feed``` - personal feed(coming soon).<br>
```random``` - get a random post.<br>
```profile``` - view your profile.<br>
```viewprofile <user id>``` - view user profile by id (profile sharing is planned).<br>
```search``` - search for a post by keyword/phrase(the search by authors is not carried out because the telegram user name can be changed, and it is pointless to store it). <br>
The names of all the teams can be freely changed, removed, and new teams can be added.

# Locales
Now Russian(ru) and English(en) are available, adding new languages is not difficult due to the fact that they are placed in separate files

# Installation
Install all dependencies using `npm i` and and create a configuration file. Then just launch the bot using `node bot.js`.

# config/default.json
```
{
  "db": {
    "user": <username>,
    "host": <db ip>,
    "database": <db name>,
    "password": <db password>,
    "port": <port>
  },
  "bot": {
    "token": <telegram bot token>,
    "name": <bot name>
  },
  "interface": {
    "elementsPerPage": <elements, shown on each page, recommended: 10-20>,
    "communityName": <community name>
  },
  "language": <language code, same as the name of the localization file>
}
```
