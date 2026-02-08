const express = require("express")
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")
const path = require("path")
const { handleMessage } = require("./handler")

const app = express()
const PORT = process.env.PORT || 3000

let sock

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")

  sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    browser: ["LUKTECH-MD", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    }

    if (connection === "open") {
      console.log("Bot connected successfully")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return
    await handleMessage(sock, msg)
  })
}

app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())

// Generate pairing code
app.post("/pair", async (req, res) => {
  try {
    const number = req.body.number

    if (!number) return res.json({ error: "Number required" })

    const code = await sock.requestPairingCode(number)
    res.json({ code })
  } catch (err) {
    res.json({ error: "Pairing failed" })
  }
})

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await startBot()
})
