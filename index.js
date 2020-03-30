const Discord = require('discord.js')

const parse = require('./src/parser')
const processManager = require('./src/processManager')

const helpCommand = require('./commands/help')
const aboutCommand = require('./commands/about')
const getCommand = require('./commands/get')
const versionCommand = require('./commands/version')
const debugCommand = require('./commands/debug')

const client = new Discord.Client()

const config = require('./config.json')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`)
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`)
})

client.once('reconnecting', () => {
  console.log('Reconnecting!')
})

client.once('disconnect', () => {
  console.log('Disconnect!')
})

client.on('guildCreate', guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)
})

client.on('guildDelete', guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`)
})

client.on('message', async message => {
  if (message.author.bot) return

  if (message.content.indexOf(config.toplevelPrefix) === 0) {
    parse(message)
  }

  if (message.content.indexOf(config.prefix) !== 0) return

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  switch (command) {
    case 'get':
      getCommand(message.author)
      break

    case 'version':
    case 'v':
      versionCommand(message.channel)
      break

    case 'run':
    case 'start':
      processManager.run(message.channel, true)
      break

    case 'exit':
    case 'end':
      processManager.end(message.channel, true)
      break

    case 'reboot':
    case 'restart':
    case 'r':
      processManager.end(message.channel, true)
      processManager.run(message.channel, true)
      break

    case 'debug':
    case 'd':
      debugCommand(message.channel, args)
      break

    case 'help':
    case 'h':
      helpCommand(message.channel)
      break

    case 'about':
      aboutCommand(message.channel)
      break

    case 'admin':
      if (message.author.id === config.ownerID) {
        message.channel.send('**You are the owner**')
      }
      break

    default:
      message.channel.send(`**Unknown command: \`${command}\`.**`)
      helpCommand(message.channel)
      break
  }
})

client.login(config.token)