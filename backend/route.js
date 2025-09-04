import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const urlStore = [];

router.post('/', (req, res) => {
    const { originalurl, expiryHours = 1 } = req.body;
    if (!originalurl) {
        return res.status(400).json({ error: 'Original URL is required' });
    }

    let urlId;
    do {
        urlId = crypto.randomBytes(6).toString('hex');
    } while (urlStore.find(u => u.urlId === urlId));

    const createdAt = new Date();
    const expireAt = new Date(createdAt);
    expireAt.setHours(expireAt.getHours() + expiryHours);

    const urlData = {
        urlId,
        originalurl,
        clicks: 0,
        createdAt,
        expireAt
    };
    urlStore.push(urlData);

    const shorturl = `http://localhost:5000/shorten/${urlId}`;
    console.log(`Original URL: ${originalurl}, Shortened URL: ${shorturl}`);
    return res.status(200).json({ originalurl, shorturl, createdAt, expireAt });
});

router.put('/increment/:urlId', (req, res) => {
    const { urlId } = req.params;
    const urlData = urlStore.find(u => u.urlId === urlId);

    if (!urlData) {
        return res.status(404).json({ error: 'Shortened URL not found' });
    }

    const now = new Date();
    if (now > urlData.expireAt) {
        return res.status(410).json({ error: 'Shortened URL has expired' });
    }

    urlData.clicks += 1;
    return res.json({ success: true, clicks: urlData.clicks });
});


router.get('/:urlId', (req, res) => {
    const { urlId } = req.params;
    const urlData = urlStore.find(u => u.urlId === urlId);
    if (!urlData) {
        return res.status(404).json({ error: 'Shortened URL not found' });
    }
    const now = new Date();
    if (now > urlData.expireAt) {
        return res.status(410).json({ error: 'Shortened URL has expired' });
    }
    urlData.clicks += 1;
    console.log(`Redirecting to: ${urlData.originalurl}, Total Clicks: ${urlData.clicks}`);
    return res.redirect(urlData.originalurl);
});


router.get('/fetchall',(req,res)=>{
    return res.json(urlStore);
})

export default router;

