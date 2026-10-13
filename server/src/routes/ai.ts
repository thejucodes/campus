import { Router, Response } from 'express';
import { upload } from '../middleware/upload.js';
import { extractEventFromFlyer } from '../utils/geminiExtractor.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

export const aiRouter = Router();

// Check AI status
aiRouter.get('/status', (_req, res): void => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('YOUR_API_KEY'));

  res.json({
    aiConfigured: isConfigured,
    model: 'gemini-1.5-flash',
    features: ['Poster OCR & Structured Extraction', 'Field Confidence Rating', 'Venue & Schedule Disambiguation']
  });
});

// Upload and extract flyer
aiRouter.post('/extract-flyer', authenticateToken, requireRole('organizer', 'admin'), upload.single('flyer'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Please select a flyer image to upload.' });
      return;
    }

    const flyerUrl = `/uploads/${req.file.filename}`;
    const extractionResult = await extractEventFromFlyer(req.file.path, req.file.mimetype);

    res.json({
      flyerUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      ...extractionResult
    });
  } catch (err: any) {
    console.error('Error during flyer upload/extraction:', err);
    res.status(500).json({ error: 'Failed to process event flyer image.' });
  }
});
