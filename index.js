require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Transporter Gmail (ia datele din .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test route (opțional): http://localhost:5000
app.get("/", (req, res) => {
  res.send("Server OK ✅");
});

// Endpoint care trimite 2 mailuri: la tine + la client
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Lipsesc date (name/email/message)" });
  }

  try {
    // Mail către tine
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: "Mesaj nou de pe site",
      text: `Nume: ${name}\nEmail: ${email}\n\nMesaj:\n${message}`,
    });

    // Mail către client (confirmare + detalii)
if (email) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Confirmare comandă ✅ Solis Candle Co.",
    text: `Salut, ${name}!

Am primit comanda ta. Detalii:

${message}

Mulțumim!
Solis Candle Co.`,
  });
}

    res.json({ success: true });
  } catch (err) {
    console.error("Eroare la trimitere mail:", err);
    res.status(500).json({ success: false, error: "Nu s-a putut trimite emailul" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server pornit pe portul " + PORT));