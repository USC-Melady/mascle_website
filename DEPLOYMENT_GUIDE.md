# MaSCle Website Deployment Guide

This document provides step-by-step instructions for deploying the MaSCle website to GitHub Pages.

## Prerequisites

Before deploying, ensure you have:
- Git installed on your computer
- Access to the USC-Melady/mascle_website GitHub repository
- Node.js and npm installed (for local testing)

## Deployment Process

The MaSCle website is automatically deployed to GitHub Pages using GitHub Actions. Here's how it works:

### 1. Automatic Deployment (Recommended)

The website automatically deploys when you push changes to the `main` branch.

**Steps:**

1. **Make your changes** to the website files locally

2. **Test locally** (optional but recommended):
   ```powershell
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` to preview changes

3. **Commit your changes**:
   ```powershell
   git add .
   git commit -m "Your descriptive commit message"
   ```

4. **Push to GitHub**:
   ```powershell
   git push origin main
   ```

5. **Wait for deployment**:
   - Go to: https://github.com/USC-Melady/mascle_website/actions
   - Watch the workflow run (typically takes 2-5 minutes)
   - Green checkmark = successful deployment
   - Red X = deployment failed (check logs)

6. **View the deployed site**:
   - URL: https://usc-melady.github.io/mascle_website/
   - Wait 1-2 minutes for GitHub Pages cache to refresh

### 2. Manual Deployment (If Needed)

If automatic deployment fails, you can manually trigger it:

1. Go to: https://github.com/USC-Melady/mascle_website/actions
2. Click on "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
4. Select the `main` branch
5. Click "Run workflow"

### 3. Building Locally (For Testing)

To build the production version locally before deploying:

```powershell
# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` folder.

## GitHub Actions Workflow

The deployment is handled by `.github/workflows/deploy.yml` (or similar). The workflow:

1. **Triggers on**: Push to `main` branch
2. **Builds**: Runs `npm install` and `npm run build`
3. **Deploys**: Copies `dist/` folder contents to `gh-pages` branch
4. **Serves**: GitHub Pages serves from `gh-pages` branch

## Configuration Files

### vite.config.ts
```typescript
export default defineConfig({
  base: '/mascle_website/',  // Important: matches GitHub repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

### Base Path
The base path `/mascle_website/` must match your GitHub repository name. If you rename the repository, update this value.

## Troubleshooting

### Issue: Changes not appearing after deployment

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Wait 5-15 minutes for GitHub Pages cache to clear
4. Check if deployment succeeded in GitHub Actions

### Issue: 404 error on page refresh

**Solution:** This should be handled by the `404.html` file in `/public`. Ensure it exists and contains the redirect script.

### Issue: Images not loading

**Solutions:**
- Check image paths use `getImagePath()` utility
- Verify images exist in `/public/images/` folder
- Ensure paths are relative or use the base path correctly

### Issue: GitHub Actions workflow fails

**Solutions:**
1. Check the Actions tab for error logs
2. Common issues:
   - Missing dependencies: Run `npm install` locally
   - Build errors: Run `npm run build` locally to see errors
   - Permissions: Ensure GitHub Actions has write access to repository

### Issue: Site works locally but not on GitHub Pages

**Solution:**
- Check that all paths use the base path `/mascle_website/`
- Use `getImagePath()` helper for images
- Verify `vite.config.ts` has correct base path

## Rollback

If you need to rollback to a previous version:

1. Find the commit hash of the working version:
   ```powershell
   git log
   ```

2. Revert to that commit:
   ```powershell
   git revert <commit-hash>
   git push origin main
   ```

3. Or reset (use with caution):
   ```powershell
   git reset --hard <commit-hash>
   git push origin main --force
   ```

## Custom Domain (If Applicable)

If you want to use a custom domain:

1. Add a `CNAME` file to `/public` folder with your domain:
   ```
   mascle.usc.edu
   ```

2. Configure DNS records at your domain registrar:
   - Type: CNAME
   - Host: www (or @)
   - Value: usc-melady.github.io

3. In GitHub repo settings → Pages → Custom domain, enter your domain

## Cache Management

GitHub Pages caches content. To force cache refresh:

1. **Update cache headers** in `404.html` or `index.html`
2. **Add query parameters** to asset URLs (automatic in Vite)
3. **Wait** for GitHub's CDN cache to expire (usually 10-15 minutes)

## Monitoring

After deployment, check:

- ✅ Site loads: https://usc-melady.github.io/mascle_website/
- ✅ All pages accessible (no 404 errors)
- ✅ Images load correctly
- ✅ Navigation works
- ✅ Authentication works (if applicable)
- ✅ Forms submit correctly
- ✅ Mobile responsive design works

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review this guide's troubleshooting section
3. Test locally with `npm run build && npm run preview`
4. Contact the development team

---

**Last Updated:** December 2025
