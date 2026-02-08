const fs = require('fs')
const path = require('path')

function loadCommands() {
  const commands = new Map()
  const files = fs.readdirSync(path.join(__dirname, '../commands'))

  for (const file of files) {
    if (file.endsWith('.js')) {
      const cmd = require(`../commands/${file}`)
      commands.set(cmd.name, cmd)
    }
  }

  return commands
}

module.exports = { loadCommands }
