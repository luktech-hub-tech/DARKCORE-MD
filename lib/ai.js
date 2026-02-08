const fs = require("fs")
const settingsPath = "./data/settings.json"

if (!fs.existsSync(settingsPath))
  fs.writeFileSync(settingsPath, JSON.stringify({ ai: true }, null, 2))

module.exports = {
  name: "ai",
  async execute(sock, msg, args, config) {
    const sender = msg.key.participant || msg.key.remoteJid
    const number = sender.split("@")[0]
    if (!config.owner.includes(number))
      return sock.sendMessage(msg.key.remoteJid, { text: "Owner only." })

    const settings = JSON.parse(fs.readFileSync(settingsPath))

    if (args[0] === "on") settings.ai = true
    if (args[0] === "off") settings.ai = false

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    await sock.sendMessage(msg.key.remoteJid, {
      text: `AI is now ${settings.ai ? "ON" : "OFF"}`
    })
  }
                              }
