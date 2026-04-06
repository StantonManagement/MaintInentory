# Railway Deployment Guide - Truck Tablet PWA

## Architecture

This system has **two separate applications** that deploy independently:

1. **Tablet PWA** (this repository) → `inventory.stantoncap.com`
2. **Management Interface** (in MaintOC repo) → `portal.phds-dp.com`

---

## Prerequisites

- Railway account with access to Stanton project
- Supabase database configured with `inv_*` tables
- Domain configured in Railway (e.g., `inventory.stantoncap.com`)

---

## Deployment Steps

### Step 1: Create New Railway Service

1. Go to Railway dashboard
2. Click **"New Project"** or add to existing Stanton project
3. Select **"Deploy from GitHub repo"**
4. Choose the `stanton/truck-tablet` repository
5. Railway will auto-detect the Vite configuration

### Step 2: Configure Environment Variables

In Railway service settings, add:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://wkwmxxlfheywwbgdbzxe.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Node Environment
NODE_ENV=production

# Port (Railway sets this automatically, but you can override)
PORT=3000
```

**To get your Supabase keys:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the `anon` `public` key (NOT the service_role key)

### Step 3: Configure Build Settings

Railway should auto-detect, but if needed, set:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Railway will provide a temporary URL (e.g., `truck-tablet-production.up.railway.app`)

### Step 5: Configure Custom Domain

1. In Railway service settings, go to **"Domains"**
2. Click **"Custom Domain"**
3. Add your domain: `inventory.stantoncap.com`
4. Update your DNS records as instructed by Railway:
   - Add CNAME record pointing to Railway's domain
   - Wait for DNS propagation (~5-15 minutes)

---

## Verification

After deployment, test the flow:

1. Visit `https://inventory.stantoncap.com`
2. Enter PIN `1234` (Stan) or `5678` (Javier)
3. Click "New Order"
4. Select property and unit
5. Add items to cart
6. Complete order

**Check for issues:**
- If page loads but looks broken → Check build logs for CSS/JS errors
- If API calls fail → Check Supabase environment variables
- If PIN login fails → Check database has `inv_technician_pins` table

---

## Rollback Procedure

Railway keeps previous deployments. To rollback:

1. Go to service **"Deployments"** tab
2. Find the last working deployment
3. Click **"Redeploy"**

---

## Monitoring

### Check Application Logs
```bash
# In Railway dashboard, go to:
Service → Deployments → Click active deployment → View Logs
```

### Common Issues

**Issue: Build fails with TypeScript errors**
- Solution: Run `npm run build` locally first to catch errors
- Check that all imports are correct

**Issue: Runtime error "Cannot find module"**
- Solution: Make sure all dependencies are in `dependencies`, not `devDependencies`
- Vite, TypeScript, etc. should be in `devDependencies` (they are)

**Issue: Blank page after deployment**
- Solution: Check browser console for errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly

**Issue: API calls return 401 Unauthorized**
- Solution: Check Supabase RLS policies on `inv_*` tables
- Ensure `anon` role has proper permissions

---

## Production Checklist

Before going live:

- [ ] Database tables created (`inv_*` tables)
- [ ] Seed data inserted (truck, catalog items, technician PINs)
- [ ] Supabase RLS policies configured
- [ ] Environment variables set in Railway
- [ ] Custom domain configured
- [ ] SSL certificate active (Railway handles this automatically)
- [ ] Test PIN login works
- [ ] Test full transaction flow
- [ ] Test offline mode (once implemented)
- [ ] Monitor logs for first 24 hours

---

## Scaling Considerations

### Current Setup (Phase 1)
- Single Railway service
- Stateless (no server-side state)
- All data in Supabase
- **Can handle:** ~10-50 concurrent users easily

### If You Need More (Phase 2+)
- Railway auto-scales based on traffic
- Consider adding Redis for session caching
- Monitor response times in Railway metrics

---

## Cost Estimate

**Railway Pricing (as of 2026):**
- Hobby Plan: $5/month (500 hours)
- Pro Plan: $20/month (unlimited usage)

**This app:**
- Small Vite app (~20MB after build)
- Minimal CPU usage (static serving + API calls)
- **Estimated cost:** $5-10/month on Railway Hobby plan

**Total system cost:**
- Tablet PWA: $5-10/month
- Supabase: Already covered by existing MaintOC usage
- MaintOC: Existing deployment cost unchanged

---

## Environment-Specific Deployments

### Development
```bash
# Local development
npm run dev
# Runs on http://localhost:5173/
```

### Staging (Optional)
Create a second Railway service:
- Domain: `staging-inventory.stantoncap.com`
- Connect to staging Supabase (or same DB with different data)
- Test changes before production

### Production
- Domain: `inventory.stantoncap.com`
- Connect to production Supabase
- Only deploy tested changes

---

## Maintenance

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update all to latest
npm update

# Test locally
npm run build
npm start

# Deploy to Railway (push to GitHub)
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Monitor Performance
- Railway provides metrics in dashboard
- Watch for slow API calls to Supabase
- Check error logs regularly

---

## Troubleshooting Commands

```bash
# Test production build locally
npm run build
npm start
# Visit http://localhost:3000

# Check bundle size
npm run build
ls -lh dist/assets/*.js

# Test with production API
# Create .env.production.local:
VITE_SUPABASE_URL=https://wkwmxxlfheywwbgdbzxe.supabase.co
VITE_SUPABASE_ANON_KEY=your-key

npm run build
npm start
```

---

## Support

**Railway Issues:**
- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

**Vite Issues:**
- Vite docs: https://vitejs.dev/guide/
- Vite deployment guide: https://vitejs.dev/guide/static-deploy.html

**Supabase Issues:**
- Check RLS policies
- Verify API keys
- Test queries in Supabase SQL editor
