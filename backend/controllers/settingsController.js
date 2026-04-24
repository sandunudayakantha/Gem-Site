import { Op } from 'sequelize';
import StoreSettings from '../models/StoreSettings.js';
import ContactMessage from '../models/ContactMessage.js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { processUpload } from '../utils/imageProcessor.js';

// Get settings
export const getSettings = async (req, res) => {
  try {
    const settings = await StoreSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update settings (Admin only)
export const updateSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = await StoreSettings.create({});
    }

    const updateData = {};

    // Handle nested form data
    if (req.body.contact) {
      updateData.contact = {
        phone: req.body.contact.phone || settings.contact?.phone || '',
        callPhone: req.body.contact.callPhone || settings.contact?.callPhone || '',
        email: req.body.contact.email || settings.contact?.email || '',
        address: req.body.contact.address || settings.contact?.address || '',
        whatsapp: req.body.contact.whatsapp || settings.contact?.whatsapp || ''
      };
    }

    if (req.body.banner) {
      let bannerImages = settings.banner?.images || [];
      
      if (req.files && req.files.bannerImages) {
        const processedImages = [];
        for (const file of req.files.bannerImages) {
          const optimizedPath = await processUpload(file);
          processedImages.push(optimizedPath);
        }
        bannerImages = [...bannerImages, ...processedImages];
      }
      
      if (req.files && req.files.bannerImage) {
        const optimizedPath = await processUpload(req.files.bannerImage[0]);
        if (!bannerImages.includes(optimizedPath)) {
          bannerImages.push(optimizedPath);
        }
      }
      
      if (req.body.bannerImagesToDelete) {
        const imagesToDelete = Array.isArray(req.body.bannerImagesToDelete) 
          ? req.body.bannerImagesToDelete 
          : [req.body.bannerImagesToDelete];
        
        // Delete original files from disk
        imagesToDelete.forEach(imagePath => {
          if (imagePath && typeof imagePath === 'string') {
            // Remove the leading slash if it exists to join correctly with process.cwd()
            const relativePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            const fullPath = path.join(process.cwd(), relativePath);
            
            if (fs.existsSync(fullPath)) {
              try {
                fs.unlinkSync(fullPath);
                console.log(`Deleted file: ${fullPath}`);
              } catch (err) {
                console.error(`Error deleting file ${fullPath}:`, err);
              }
            }
          }
        });

        bannerImages = bannerImages.filter(img => !imagesToDelete.includes(img));
      }
      
      updateData.banner = {
        title: req.body.banner?.title || settings.banner?.title || '',
        description: req.body.banner?.description || settings.banner?.description || '',
        images: bannerImages,
        image: bannerImages.length > 0 ? bannerImages[0] : null
      };
    }

    if (req.body.specialOffer) {
      const enabled = req.body.specialOffer.enabled === 'true' || 
                     req.body.specialOffer.enabled === true || 
                     req.body.specialOffer.enabled === '1';
      
      updateData.specialOffer = {
        enabled: enabled,
        percentage: req.body.specialOffer.percentage ? parseFloat(req.body.specialOffer.percentage) : (settings.specialOffer?.percentage || 0),
        title: req.body.specialOffer.title || settings.specialOffer?.title || ''
      };
    }

    if (req.body.deliveryFee !== undefined) {
      updateData.deliveryFee = req.body.deliveryFee ? parseFloat(req.body.deliveryFee) : 0;
    }

    await settings.update(updateData);
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Spam detection patterns
const spamPatterns = [
  /(?:viagra|cialis|casino|poker|loan|credit|debt|free money|make money fast)/i,
  /(?:http|https|www\.)/i, 
  /(?:click here|buy now|limited time|act now)/i,
  /(?:\.com|\.net|\.org)/i 
];

const isSpam = (name, email, message) => {
  const combinedText = `${name} ${email} ${message}`.toLowerCase();
  for (const pattern of spamPatterns) {
    if (pattern.test(combinedText)) return true;
  }
  const words = combinedText.split(/\s+/);
  const wordCounts = {};
  for (const word of words) {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (wordCounts[word] > 5) return true;
    }
  }
  if (email.includes('+') && email.split('+').length > 2) return true;
  return false;
};

// Send contact form message
export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, message, honeypot, subject } = req.body;

    if (honeypot) {
      return res.status(200).json({ message: 'Message sent successfully!' });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    if (name.length < 2 || name.length > 200) {
      return res.status(400).json({ message: 'Name must be between 2 and 200 characters' });
    }

    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ message: 'Message must be between 10 and 5000 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentMessages = await ContactMessage.count({
      where: {
        [Op.or]: [
          { email: email.toLowerCase(), createdAt: { [Op.gte]: fiveMinutesAgo } },
          { ipAddress: ipAddress, createdAt: { [Op.gte]: fiveMinutesAgo } }
        ]
      }
    });

    if (recentMessages > 0) {
      return res.status(429).json({ 
        message: 'Please wait a few minutes before sending another message.' 
      });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyMessages = await ContactMessage.count({
      where: {
        ipAddress: ipAddress,
        createdAt: { [Op.gte]: oneHourAgo }
      }
    });

    if (hourlyMessages >= 5) {
      return res.status(429).json({ 
        message: 'Too many messages sent. Please try again later.' 
      });
    }

    const isSpamMessage = isSpam(name, email, message);

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      subject: subject || 'No Subject',
      message: message.trim(),
      ipAddress: ipAddress,
      spam: isSpamMessage
    });

    // Optionally send email
    try {
      const settings = await StoreSettings.getSettings();
      const adminEmail = process.env.ADMIN_EMAIL || settings.contact.email;

      if (adminEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const mailOptions = {
          from: `"${name}" <${process.env.SMTP_USER}>`,
          replyTo: email,
          to: adminEmail,
          subject: `${subject || 'New Contact Form Message'} from ${name}${isSpamMessage ? ' [SPAM]' : ''}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
                New Contact Form Submission${isSpamMessage ? ' [SPAM DETECTED]' : ''}
              </h2>
              <div style="margin-top: 20px;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-left: 3px solid #000; margin-top: 10px;">
                  <p style="white-space: pre-wrap; margin: 0;">${message}</p>
                </div>
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">
                This message was sent from the contact form on your website.
              </p>
            </div>
          `
        };

        transporter.sendMail(mailOptions).catch(err => {
          console.error('Failed to send notification email:', err);
        });
      }
    } catch (emailError) {
      console.error('Email notification error (non-critical):', emailError);
    }

    res.json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};
