module.exports = {
  name: "menu",
  async execute(sock, msg, args, config) {
    const text = `
╭─「 ${config.botName} 」
│
│ .ping
│ .menu
│ .group kick @user
│ .group promote @user
│ .group demote @user
│ .ai on/off
│
╰──────────────
`
    await sock.sendMessage(msg.key.remoteJid, { text })
  }
}
