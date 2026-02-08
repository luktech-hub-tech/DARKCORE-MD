const config = require('./config')
const { loadCommands } = require('./lib/loader')

const commands = loadCommands()

async function handleMessage(sock, msg) {
  const from = msg.key.remoteJid
  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ""

  const prefix = config.prefix.find(p => body.startsWith(p))
  if (!prefix) return

  const args = body.slice(prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()
  const command = commands.get(commandName)
  if (!command) return

  await command.execute(sock, msg, args, config)
}

module.exports = { handleMessage }
