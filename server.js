import dotenv from 'dotenv'
import express, { json } from 'express'
import { createTransport } from 'nodemailer'
import cors from 'cors'

dotenv.config()
const app = express()
app.use(json({ limit: '5mb' }))
app.use(cors())

app.post('/send-email', async (req, res) => {
  const { email, image } = req.body
  if (!email || !image) return res.status(400).send('Missing data')

  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return res.status(400).send('Invalid email')

  // Configure transporter for Resend SMTP
  const transporter = createTransport({
    host: 'smtp.resend.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.RESEND_SMTP_USER,
      pass: process.env.RESEND_SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your Bucks2Bar Chart',
      text: 'Attached is your chart image.',
      attachments: [
        {
          filename: 'chart.png',
          content: image.split('base64,')[1],
          encoding: 'base64',
        },
      ],
    })
    res.send('Email sent!')
  } catch (err) {
    console.error('Error sending email:', err)
    res.status(500).send('Failed to send email')
  }
})

app.listen(3000, () => console.log('Server running on port 3000'))
