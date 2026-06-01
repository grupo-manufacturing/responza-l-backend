import { Schema, model } from 'mongoose'

const waitlistSignupSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    source: { type: String, required: true, enum: ['hero', 'footer'] },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true, collection: 'waitlist_signups' },
)

waitlistSignupSchema.index({ email: 1 }, { unique: true })

export const WaitlistSignup = model('WaitlistSignup', waitlistSignupSchema)
