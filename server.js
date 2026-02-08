const express = require("express")
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const P = require("pino")
const QRCode = require("qrcode")
const path = require("path")
const fs = require("fs")

// Command handler
const { handleMessage } = require("./handler")

const app = express()
const PORT = process.env.PORT || 3000

let sock
let currentQR = null
let isConnected = false

// ================= START BOT =================

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    version,
    browser: ["LUKTECH-MD", "Chrome", "1.0"],
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update

    // QR received
    if (qr) {
      currentQR = await QRCode.toDataURL(qr)
      isConnected = false
      console.log("QR Generated")
    }

    // Connection closed
    if (connection === "close") {
      isConnected = false
      currentQR = null

      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log("Connection closed. Reconnecting:", shouldReconnect)
      if (shouldReconnect) startBot()
    }

    // Connection opened
    if (connection === "open") {
      console.log("Bot Connected Successfully")
      isConnected = true
      currentQR = null
    }
  })

  // Listen for messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0]
      if (!msg.message) return
      if (msg.key && msg.key.remoteJid === "status@broadcast") return
      await handleMessage(sock, msg)
    } catch (err) {
      console.log("Message Error:", err)
    }
  })
}

// ================= EXPRESS ROUTES =================

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// QR endpoint
app.get("/qr", (req, res) => {
  if (isConnected) return res.json({ status: "connected" })
  if (!currentQR) return res.json({ status: "waiting" })
  res.json({ qr: currentQR })
})

// Health check
app.get("/status", (req, res) => {
  res.json({
    connected: isConnected,
    bot: "LUKTECH-MD"
  })
})

// ================= START SERVER =================

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await startBot()
})
