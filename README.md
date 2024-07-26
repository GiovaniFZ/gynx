# Lynx (Node.js Telegram Bot)
Lynx is a a simple Telegram bot made in Node.js.
 - You can find Lynx at [@LynxBR_bot](https://t.me/LynxBR_bot) on Telegram.

## Requirements
 - A Telegram bot (create one at [@BotFather](https://t.me/botfather))
 - Node.js 20 LTS (or above)
 - Python 3 (or above, for use with SpamWatch API)
 - Python dependencies: use ``pip install -r requirements.txt``
 - Node.js dependencies: use ``npm install``

## Run it yourself, develop or contribute with Lynx
First, [make a fork of this repo](https://github.com/lucmsilva651/lynx/fork), or clone it with
```
git clone https://github.com/lucmsilva651/lynx
```
Next, inside the repository directory, go to props folder and create a config.json file with the following content:
```
{
  "botToken": "0000000000:AAAaaAAaaaaAaAaaAAAaaaAaaaaAAAAAaaa",
  "admins": [0000000000, 1111111111, 2222222222]
}
``` 
- **botToken**: Put your bot token that you created at [@BotFather](https://t.me/botfather), as the example above.
- **admins**: Put the ID of the people responsible for managing the bot (as the example above). They can use some administrative + exclusive commands on any group.

After editing the file, save all changes and run the bot with ``npm start``.

## Notes
- The source code itself of the bot is at ``src/main.js``, and the commands are in ``src/commands``.
  - You can edit this file and the ``package.json`` file as your needs.
- The name of the command file will always be the command itself.
  - Example: ``whois.js`` will always be ``/whois`` on Telegram.
- Also, to see your changes, please restart the bot before making a issue.

## About/License
MIT - 2024 Lucas Gabriel (lucmsilva).