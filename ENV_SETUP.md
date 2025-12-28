# MetaPins Environment Variables

## For Vercel Deployment

Add this environment variable in your Vercel project settings:

**Variable Name:** `VITE_API_URL`  
**Value:** `https://metapins-production-c951.up.railway.app`

## For Railway Backend

Add this environment variable in your Railway project settings:

**Variable Name:** `FRONTEND_URL`  
**Value:** `https://meta-pins.vercel.app`

---

## Local Development

For local development, the app will automatically use `http://localhost:5000` as configured in `config.ts`.

If you want to test against production backend locally, create a `.env.local` file with:
```
VITE_API_URL=https://metapins-production-c951.up.railway.app
```
