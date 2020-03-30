const Discord = require('discord.js')
const prettyBytes = require('pretty-bytes')
const { execute } = require('./_utils')
const { processes, processRunning } = require('../src/processManager')

function debug (channel, args) {
  console.log(args)
  switch (args[0]) {
    case 'process':
      debugProcess(channel)
      break

    case 'bot':
      debugBot(channel)
      break

    default:
      debugBot(channel)
      debugProcess(channel)
      break
  }
}

async function debugProcess (channel) {
  if (processRunning(channel)) {
    const process = processes.get(channel.id)
    const snapshot = await execute(`ps -p ${process.pid} -o %cpu,%mem,etime,cputime h`)
    const stats = snapshot.replace(/(^\s+|\s+$)/g, '').replace(/\s+/g, ' ').split(' ')
    console.log(stats)
    const embed = new Discord.MessageEmbed()
      .setColor('#ee760e')
      .setTitle('Process debug')
      // .setDescription('desc')
      .setThumbnail('https://img.icons8.com/color/96/000000/system-task.png')
      .addField('CPU usage', stats[0] + ' %', true)
      .addField('Memory usage', stats[1] + ' %', true)
      .addField('Time elasped', stats[2], true)
      .addField('Cumulative CPU time', stats[3], true)
    channel.send(embed)
  } else {
    console.log("No process was found for this channel. Couldn't debug process.")
    channel.send("**No process was found for this channel. Couldn't debug process.**")
  }
}

function debugBot (channel) {
  const memory = process.memoryUsage()
  const embed = new Discord.MessageEmbed()
    .setColor('#ee760e')
    .setTitle('Bot debug')
    // .setDescription('desc')
    .setThumbnail('https://img.icons8.com/color/96/000000/system-task.png')
    .addField('Allocated memory ', prettyBytes(memory.rss), true)
    .addField('Allocated heap', prettyBytes(memory.heapTotal), true)
    .addField('Used memory', prettyBytes(memory.heapUsed), true)
    .addField('External memory', prettyBytes(memory.external), true)
  channel.send(embed)
}

module.exports = debug