# SD Sign Studio

React + Vite website for SD Sign Studio.

## Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Database Setup

The project uses Supabase/Postgres. Keep `DATABASE_URL` in `.env`; do not commit `.env`.

Run these setup scripts when needed:

```bash
npm run db:gallery
npm run db:pricing
```

`db:gallery` creates the gallery table used by the admin gallery page.

`db:pricing` adds `price_inr` and `price_gbp` to products and backfills existing products from the old `price` column.

## Gallery Media

Large gallery videos and images are intentionally not committed to Git.

The local approved media folder was about 1.85 GB, and some videos were over GitHub's 100 MB file limit, so pushing those files directly to `main` would fail. The repository commits only the gallery code, folder placeholders, and instructions.

Local media folders:

```text
public/gallery-media/images/
public/gallery-media/videos/
```

After adding local media files, regenerate the manifest:

```bash
npm run gallery:manifest
```

For production, upload gallery media to proper storage such as Supabase Storage or Cloudinary instead of committing raw videos to Git.

## Admin Pages

Important admin routes include:

```text
/admin/gallery
/admin/gallery-banner
/admin/gallery-categories
/admin/products
```

Product pricing is managed with separate INR and GBP fields in the admin product form.
