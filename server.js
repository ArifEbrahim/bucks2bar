import dotenv from 'dotenv'
import express, { json } from 'express'
import { createTransport } from 'nodemailer'
import cors from 'cors'
import validator from 'validator'
import rateLimit from 'express-rate-limit'

dotenv.config()
const app = express()
app.use(json({ limit: '5mb' }))
app.use(cors())

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many email requests from this IP, please try again later.',
})

app.use('/send-email', emailLimiter)

app.post('/send-email', async (req, res) => {
  const { email, image } = req.body
  if (!email || !image) return res.status(400).send('Missing data')

  // Validate email
  if (!validator.isEmail(email)) return res.status(400).send('Invalid email')

  // Validate image
  const allowedTypes = ['image/png', 'image/jpeg']

  const matches = image.match(/^data:(image\/[a-zA-Z]+);base64,/)
  if (!matches || !allowedTypes.includes(matches[1])) {
    return res.status(400).send('Invalid or unsupported image type')
  }

  // Configure transporter for Resend SMTP
  const transporter = createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: {
      user: 'resend',
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
