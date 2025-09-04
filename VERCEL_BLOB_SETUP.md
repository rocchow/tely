# Vercel Blob Storage Setup for Multiple Product Images

## Overview

Your TELY store now supports multiple product images using Vercel Blob Storage. Images are uploaded to Vercel's CDN and the URLs are stored directly in Stripe's product `images` array.

## Setup Instructions

### 1. Create a Vercel Blob Store

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Blob**
3. Click **Create Database** (if you don't have one already)
4. Choose a name for your blob store (e.g., "tely-product-images")
5. Select your region (choose closest to your users)

### 2. Get Your Blob Token

1. In your Vercel Blob dashboard, click on your blob store
2. Go to the **Settings** tab
3. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Update Environment Variables

Add the token to your `.env.local` file:

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Restart Your Development Server

```bash
bun run dev
```

## How It Works

1. **Upload Process:**
   - Users select multiple images in the admin panel
   - Images are uploaded to Vercel Blob Storage
   - Vercel returns public CDN URLs
   - These URLs are added to the Stripe product's `images` array

2. **File Naming:**
   - Files are renamed with unique identifiers: `product-{productId}-{timestamp}-{randomId}.{extension}`
   - This prevents naming conflicts and organizes files by product

3. **Image Display:**
   - The main product image remains the first item in the `images` array
   - Additional images are displayed in the product gallery
   - All images are served from Vercel's global CDN for fast loading

## Usage

1. Go to `http://localhost:3000/admin/products`
2. Click on a product to manage its images
3. Select multiple image files
4. Click "Upload Images"
5. Images will be uploaded and automatically added to the product

## Benefits

✅ **Fast CDN delivery** - Images served from Vercel's global CDN
✅ **Automatic optimization** - Vercel optimizes images for web delivery
✅ **Scalable storage** - No file size limits like Stripe Files API
✅ **Simple integration** - Native Next.js support
✅ **Cost-effective** - Pay only for what you use

## File Limits

- **Max file size:** 50MB per file
- **Supported formats:** JPEG, PNG, GIF, WebP, AVIF
- **Storage limit:** Based on your Vercel plan

## Troubleshooting

### "Vercel Blob Storage not configured" Error

This means the `BLOB_READ_WRITE_TOKEN` is missing or invalid:

1. Check your `.env.local` file has the correct token
2. Restart your development server
3. Verify the token in your Vercel dashboard

### Upload Fails

1. Check file size (must be under 50MB)
2. Ensure file is a valid image format
3. Check your Vercel Blob storage quota
4. Verify your token has write permissions

## Production Deployment

When deploying to Vercel:

1. Add the `BLOB_READ_WRITE_TOKEN` to your Vercel project environment variables
2. The same blob store can be used for both development and production
3. Consider creating separate blob stores for staging/production if needed

## Cost Estimation

Vercel Blob pricing (as of 2024):
- **Storage:** $0.15/GB per month
- **Bandwidth:** $0.40/GB transferred
- **Operations:** $2.00 per million operations

For a typical e-commerce store with 100 products and 3 images each (1MB average):
- Storage: ~$0.045/month
- Bandwidth: Depends on traffic, very affordable for most use cases
