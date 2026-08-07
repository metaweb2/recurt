# Deploy to Vercel

Short steps to deploy this Next.js project to Vercel.

1. Push your repository to GitHub/GitLab/Bitbucket.
2. Go to https://vercel.com and import the repository (New Project → Import Git Repository).
3. For Framework Preset choose **Next.js** (Vercel auto-detects Next 16).
4. Add the required environment variables in the Vercel project settings (see list below).
5. Click **Deploy**. Subsequent pushes will create automatic deployments.

Optional: use the Vercel CLI to link and deploy from your machine:

```bash
npm i -g vercel
vercel login
vercel link    # link local repo to a Vercel project
vercel --prod  # deploy production
```

Environment variables required by this project
- `DATABASE_URL` (Postgres connection string)
- `JWT_SECRET` (min ~32 characters for production)
- `MAIL_PROVIDER` (eg. "sendgrid", "mailgun", or "log")
- `MAIL_API_KEY`
- `MAIL_FROM`
- `MAIL_API_URL` (optional)
- `WHATSAPP_PROVIDER` (eg. "twilio" or "log")
- `WHATSAPP_API_KEY`
- `WHATSAPP_API_URL` (optional)
- `CONTACT_EMAIL` (used for contact form)

Notes
- Keep secrets out of source control; set them in Vercel Dashboard under Settings → Environment Variables.
- If you use preview deployments, set env vars for the Preview environment too.
- This repo already includes `build` and `start` scripts in `package.json`.
