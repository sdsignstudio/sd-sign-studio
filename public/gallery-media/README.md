Put approved gallery media in this folder.

Recommended structure:

- images: public/gallery-media/images/
- videos: public/gallery-media/videos/

Use optimized files for the website. Avoid committing large raw videos.
This repository ignores media files in `images` and `videos` because the
approved local videos are too large for a normal GitHub push.

After adding files, run:

```
npm run gallery:manifest
```

The homepage gallery preview uses the first four videos from the generated manifest.
