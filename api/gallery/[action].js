const { ObjectId } = require('mongodb');
const formidable = require('formidable');
const fs = require('fs');
const clientPromise = require('../_lib/mongodb');
const { verifyToken, extractToken } = require('../_lib/jwt');

// Disable Vercel's default body parser for multipart uploads
module.exports.config = {
    api: {
        bodyParser: false,
    },
};

function parseUpload(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10 MB
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

module.exports = async (req, res) => {
    const { action } = req.query;

    // POST /api/gallery/upload
    if (action === 'upload') {
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }

        const token = extractToken(req);
        if (!verifyToken(token)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const { fields, files } = await parseUpload(req);
            const fileEntry = files['file'];
            const file = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;

            if (!file) {
                return res.status(400).json({ message: 'No file provided.' });
            }

            const titleField = fields['title'];
            const title = Array.isArray(titleField) ? titleField[0] : (titleField || 'Untitled');

            // Read file and convert to base64 data URI
            const fileData = fs.readFileSync(file.filepath || file.path);
            const contentType = file.mimetype || file.type || 'image/jpeg';
            const base64 = fileData.toString('base64');
            const dataUri = `data:${contentType};base64,${base64}`;

            // Clean up temp file
            try { fs.unlinkSync(file.filepath || file.path); } catch (_) {}

            const client = await clientPromise;
            const db = client.db('freshpup');
            const result = await db.collection('gallery').insertOne({
                url: dataUri,
                title: String(title),
                filename: file.originalFilename || file.name || 'upload',
                contentType,
                createdAt: new Date(),
            });

            return res.status(201).json({
                id: result.insertedId.toString(),
                url: dataUri,
                title: String(title),
                createdAt: new Date(),
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            return res.status(500).json({ message: 'Error uploading image', error: error.message });
        }
    }

    // DELETE /api/gallery/:id
    if (action && ObjectId.isValid(action) && action.length === 24) {
        const token = extractToken(req);
        if (!verifyToken(token)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (req.method === 'DELETE') {
            try {
                const client = await clientPromise;
                const db = client.db('freshpup');
                const result = await db.collection('gallery').deleteOne({ _id: new ObjectId(action) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Image not found.' });
                }
                return res.status(200).json({ message: 'Image deleted.' });
            } catch (error) {
                console.error('Error deleting image:', error);
                return res.status(500).json({ message: 'Error deleting image', error: error.message });
            }
        }

        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    return res.status(404).json({ message: 'Not found.' });
};
