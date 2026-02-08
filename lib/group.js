module.exports = {
  name: "group",
  async execute(sock, msg, args, config) {
    const from = msg.key.remoteJid
    if (!from.endsWith("@g.us"))
      return sock.sendMessage(from, { text: "Only for groups." })

    const sender = msg.key.participant || msg.key.remoteJid
    const number = sender.split("@")[0]
    if (!config.owner.includes(number))
      return sock.sendMessage(from, { text: "Owner only." })

    const sub = args[0]
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid

    if (!mentioned) return sock.sendMessage(from, { text: "Mention user." })

    if (sub === "kick")
      await sock.groupParticipantsUpdate(from, mentioned, "remove")

    if (sub === "promote")
      await sock.groupParticipantsUpdate(from, mentioned, "promote")

    if (sub === "demote")
      await sock.groupParticipantsUpdate(from, mentioned, "demote")

    await sock.sendMessage(from, { text: "Done ✅" })
  }
                                     }
