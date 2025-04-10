import express from 'express';
import { getSitemap, getMetaTags } from '../controllers/seo.controller';
import { getRobotsTxt } from '../controllers/robots.controller';

const router = express.Router();

// Generate sitemap.xml
router.get('/sitemap.xml', getSitemap);

// Generate robots.txt
router.get('/robots.txt', getRobotsTxt);

// Generate meta tags for a specific post or page
router.get('/meta-tags/:slug', getMetaTags);

export default router;