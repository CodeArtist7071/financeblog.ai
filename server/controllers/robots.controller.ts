import { Request, Response } from 'express';

// @desc    Generate robots.txt
// @route   GET /robots.txt
// @access  Public
export const getRobotsTxt = (req: Request, res: Response): void => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
    
    // Set content type to plain text
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};