const Discord = require('discord.js')
const rimraf = require('rimraf')

const logger = require('./src/logger')
const parse = require('./src/parser')
const processManager = require('./src/processManager')

const helpCommand = require('./commands/help')
const aboutCommand = require('./commands/about')
const getCommand = require('./commands/get')
const versionCommand = require('./commands/version')
const debugCommand = require('./commands/debug')
const ownerCommand = require('./commands/owner')
const { coffeeCommand } = require('./src/coffee')

const client = new Discord.Client()

const config = require('./config.json')

rimraf('./generated/*', (err) => {
  if (err) throw err
  logger.info({ message: 'Cleanup done.' })
})

client.on('ready', () => {
  logger.info({ message: `Logged in as ${client.user.tag}` })
  logger.info({ message: `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.` })
})

client.once('reconnecting', () => {
  logger.info({ message: 'Reconnecting!' })
})

client.once('disconnect', () => {
  logger.info({ message: 'Disconnect!' })
})

client.on('guildCreate', guild => {
  logger.info({ message: `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!` })
  getCommand(guild.owner)
})

client.on('guildDelete', guild => {
  logger.info({ message: `I have been removed from: ${guild.name} (id: ${guild.id})` })
})

client.on('message', async message => {
  if (message.author.bot) return

  if (message.content.indexOf(config.toplevelPrefix) === 0 || message.content.toLowerCase().indexOf(config.prefix) === 0) {
    logger.info({ message: `${message.author} sent: ${message.content}`, id: message.channel.id })
  } else return

  if (message.content.indexOf(config.toplevelPrefix) === 0) {
    parse(message)
    return
  }

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
      setTimeout(() => processManager.run(message.channel), 100)
      break

    case 'stop':
    case 'exit':
    case 'end':
      processManager.end(message.channel)
      break

    case 'reboot':
    case 'restart':
    case 'r':
      processManager.end(message.channel)
      setTimeout(() => processManager.run(message.channel), 100)
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
    case 'coffee':
      coffeeCommand(message.channel)
      break

    case 'owner':
      ownerCommand(message, args)
      break

    default:
      message.channel.send(`:grey_question: **Unknown command: \`${command}\`.**`)
      helpCommand(message.channel)
      break
  }
})

console.log('INFO --------- RESTART ---------')

client.login(config.token)
