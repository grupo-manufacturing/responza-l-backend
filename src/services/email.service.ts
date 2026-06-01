import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resend } from 'resend'
import type { Env } from '../config/env.js'
import { getResendConfig } from '../config/env.js'
import { confirmationHtml, confirmationText } from './email/templates.js'

type LogoAsset = {
  contentBase64: string
  filename: string
  mimeType: string
}

const assetsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../assets')

let logoPromise: Promise<LogoAsset | null> | null = null

async function getLogoAsset(): Promise<LogoAsset | null> {
  if (!logoPromise) {
    logoPromise = (async () => {
      try {
        const jpgBuffer = await readFile(path.join(assetsDir, 'logo.jpg'))
        return {
          contentBase64: jpgBuffer.toString('base64'),
          filename: 'logo.jpg',
          mimeType: 'image/jpeg',
        }
      } catch {
        try {
          const pngBuffer = await readFile(path.join(assetsDir, 'logo.png'))
          return {
            contentBase64: pngBuffer.toString('base64'),
            filename: 'logo.png',
            mimeType: 'image/png',
          }
        } catch {
          return null
        }
      }
    })()
  }
  return logoPromise
}

export type SendEmailResult =
  | { ok: true }
  | { ok: false; error: string; status: 502 | 503 }

export async function sendWaitlistConfirmation(
  env: Env,
  to: string,
): Promise<SendEmailResult> {
  const resendConfig = getResendConfig(env)
  if (!resendConfig) {
    return { ok: false, error: 'Sign-up is not configured yet.', status: 503 }
  }

  const logoAsset = await getLogoAsset()
  const logoMarkup = logoAsset
    ? '<img src="cid:responza-logo" alt="Responza" width="80" style="display:block;height:auto;max-width:80px;border:0;outline:none;text-decoration:none;">'
    : '<p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial,sans-serif;font-size:18px;font-weight:800;letter-spacing:0.08em;color:#ffffff;">RESPONZA</p>'
  const html = confirmationHtml.replace('{{logo}}', logoMarkup)
  const inlineLogoAttachment = logoAsset
    ? ({
        filename: logoAsset.filename,
        content: logoAsset.contentBase64,
        content_type: logoAsset.mimeType,
        content_id: 'responza-logo',
      } as { filename: string; content: string })
    : undefined

  const resend = new Resend(resendConfig.apiKey)

  try {
    const { error } = await resend.emails.send({
      from: resendConfig.from,
      to: [to],
      subject: "You're in — Responza early access",
      html,
      text: confirmationText,
      attachments: inlineLogoAttachment ? [inlineLogoAttachment] : undefined,
    })
    if (error) {
      console.error('resend error:', error)
      return { ok: false, error: 'Could not send email. Try again later.', status: 502 }
    }
    return { ok: true }
  } catch (e) {
    console.error('waitlist email error:', e)
    return { ok: false, error: 'Could not complete sign-up. Try again later.', status: 502 }
  }
}
