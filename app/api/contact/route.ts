import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  try {
    const { name, email, queryType, message } = await req.json()

    if (!name || !email || !queryType || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const queryLabels: Record<string, string> = {
      "flight-performance": "Flight Performance",
      "dispatch": "Dispatch",
      "flight-tracker": "Flight Tracker",
      "aviation-intelligence": "Aviation Intelligence",
      "jet-fuel": "Jet Fuel",
      "charter-services": "Charter Services",
    }

    await transporter.sendMail({
      from: `"Aero Aviation (Website Form)" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Query: ${queryLabels[queryType] || queryType}`,
      html: `
        <h2>New Contact Us Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Query Type:</strong> ${queryLabels[queryType] || queryType}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}