// import admin from '../config/firebase.js';
// import { uploadToWordPress } from '../utils/uploadToWordPress.js';  // Your upload utility function

// export const createAd = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const {
//             adType,
//             format,
//             heading,
//             subheading,
//             description,
//             url,
//             bgColor,
//             bgGradient,
//             fontColor,
//             startDate,
//             endDate,
//             displayCount,
//             totalClicks,
//             totalViews
//         } = req.body;

//         // Variables to store image URLs
//         let logoUrl;
//         let imageUrl;
//         let imageFileName;

//         // Handle file uploads (logo and main image)
//         if (req.files) {
//             // Upload logo if available
//             if (req.files.logo) {
//                 logoUrl = await uploadToWordPress(req.files.logo[0]);
//                 console.log('Logo uploaded successfully:', logoUrl);
//             }

//             // Upload main image if available
//             if (req.files.image) {
//                 imageUrl = await uploadToWordPress(req.files.image[0]);
//                 imageFileName = req.files.image[0].originalname.replace(/\.[^/.]+$/, "");
//                 console.log('Main image uploaded successfully:', imageUrl);
//             }
//         }

//         // Validation based on format
//         if (format === 'custom') {
//             if (!adType || !heading || !subheading || !description || !url || !startDate || !endDate || !displayCount) {
//                 return res.status(400).json({ message: 'Missing required fields for custom format' });
//             }
//         } else if (format === 'image') {
//             if (!imageUrl) {
//                 return res.status(400).json({ message: 'Image is required for image format' });
//             }
//             if (!adType || !url || !startDate || !endDate || !displayCount) {
//                 return res.status(400).json({ message: 'Missing required fields for image format' });
//             }
//         } else {
//             return res.status(400).json({ message: 'Invalid format' });
//         }

//         // Calculate per day display count based on displayCount and the number of days between startDate and endDate
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         let days = Math.ceil((end - start) / (1000 * 3600 * 24));
//         if (isNaN(days) || days < 1) days = 1;
//         const perDayDisplayCount = Math.floor(parseInt(displayCount, 10) / days);

//         // Create the ad object
//         const newAd = {};

//         if (adType) newAd.adType = adType;
//         if (format) newAd.format = format;
//         if (format === 'image' && imageFileName) {
//             newAd.heading = imageFileName;
//         } else if (heading) {
//             newAd.heading = heading;
//         }
//         if (subheading) newAd.subheading = subheading;
//         if (description) newAd.description = description;
//         if (url) newAd.url = url;
//         if (logoUrl) newAd.logo = logoUrl;
//         if (imageUrl) newAd.image = imageUrl;
//         if (bgColor) newAd.bgColor = bgColor;
//         if (bgGradient) newAd.bgGradient = bgGradient;
//         if (fontColor) newAd.fontColor = fontColor;
//         if (startDate) newAd.startDate = new Date(startDate);
//         if (endDate) newAd.endDate = new Date(endDate);
//         if (displayCount) newAd.displayCount = parseInt(displayCount, 10);
//         if (perDayDisplayCount) newAd.perDayDisplayCount = perDayDisplayCount;

//         newAd.displayedToday = 0;
//         newAd.displayedThisMonth = 0;
//         newAd.createdAt = new Date();
//         newAd.updatedAt = new Date();
//         newAd.totalViews = 0;
//         newAd.totalClicks = 0;

//         // Store the new ad in Firestore
//         const docRef = await db.collection('ads').add(newAd);
//         console.log("Ad created with ID:", docRef.id);
//         res.status(201).json({ id: docRef.id, ...newAd });
//     } catch (error) {
//         console.log("Error while creating ad:", error);
//         res.status(500).json({ message: 'Failed to create ad', error });
//     }
// };

// export const getAds = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const adsSnapshot = await db.collection('ads').get();
//         const adsList = adsSnapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//         }));

//         res.status(200).json(adsList);
//     } catch (error) {
//         console.log("Error while fetching ads:", error);
//         res.status(500).json({ message: 'Failed to fetch ads', error });
//     }
// };

// export const getAdById = async (req, res) => {
//     try {
//         const { adId } = req.params;
//         const db = admin.firestore();
//         const adDoc = await db.collection('ads').doc(adId).get();

//         if (!adDoc.exists) {
//             return res.status(404).json({ message: 'Ad not found' });
//         }

//         res.status(200).json({ id: adDoc.id, ...adDoc.data() });
//     } catch (error) {
//         console.log("Error while fetching ad by ID:", error);
//         res.status(500).json({ message: 'Failed to fetch ad', error });
//     }
// };

// export const updateAd = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const { adId } = req.params;
//         const {
//             startDate,
//             endDate,
//             displayCount
//         } = req.body;

//         // Variables to store image URLs
//         let logoUrl;
//         let imageUrl;

//         // Handle file uploads (logo and main image)
//         if (req.files) {
//             if (req.files.logo) {
//                 logoUrl = await uploadToWordPress(req.files.logo[0]);
//                 console.log('Logo uploaded successfully:', logoUrl);
//             }

//             if (req.files.image) {
//                 imageUrl = await uploadToWordPress(req.files.image[0]);
//                 console.log('Main image uploaded successfully:', imageUrl);
//             }
//         }

//         // Prepare the updated ad object
//         const updatedAd = { ...req.body };

//         // Only update logo/image if uploaded
//         if (logoUrl) updatedAd.logo = logoUrl;
//         if (imageUrl) updatedAd.image = imageUrl;

//         // Calculate perDayDisplayCount if relevant fields are present
//         if (startDate && endDate && displayCount) {
//             const start = new Date(startDate);
//             const end = new Date(endDate);
//             let days = Math.ceil((end - start) / (1000 * 3600 * 24));
//             if (isNaN(days) || days < 1) days = 1;
//             updatedAd.perDayDisplayCount = Math.floor(parseInt(displayCount, 10) / days);
//             updatedAd.startDate = start;
//             updatedAd.endDate = end;
//             updatedAd.displayCount = parseInt(displayCount, 10);
//         }

//         updatedAd.updatedAt = new Date();

//         // Update the ad in Firestore
//         await db.collection('ads').doc(adId).update(updatedAd);
//         console.log("Ad updated with ID:", adId);
//         res.status(200).json({ id: adId, ...updatedAd });
//     } catch (error) {
//         console.log("Error while updating ad:", error);
//         res.status(500).json({ message: 'Failed to update ad', error });
//     }
// };

// export const deleteAd = async (req, res) => {
//     try {
//         const { adId } = req.params;
//         const db = admin.firestore();

//         const adDoc = await db.collection('ads').doc(adId).get();
//         if (!adDoc.exists) {
//             return res.status(404).json({ message: 'Ad not found' });
//         }

//         await db.collection('ads').doc(adId).delete();
//         console.log("Ad deleted with ID:", adId);
//         res.status(200).json({ message: 'Ad deleted successfully' });
//     } catch (error) {
//         console.log("Error while deleting ad:", error);
//         res.status(500).json({ message: 'Failed to delete ad', error });
//     }
// };


// export const getRandomAd = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const currentDate = new Date();

//         const { adType } = req.query;

//         let adsQuery = db.collection('ads').where('status', '==', 'active');
//         if (adType) {
//             adsQuery = adsQuery.where('adType', '==', adType);
//         }

//         const adsSnapshot = await adsQuery.get();
//         console.log("Ads snapshot size:", adsSnapshot.size); // Log number of ads fetched

//         if (adsSnapshot.empty) {
//             return res.status(404).json({ message: 'No active ads found' });
//         }

//         const ads = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         let validAds = [];

//         // Log each ad being checked
//         for (let ad of ads) {
//             console.log(`Checking ad: ${ad.id}, expiration: ${ad.endDate}, displayedToday: ${ad.displayedToday}`);
            
//             const adExpirationDate = new Date(ad.endDate);
//             const adCurrentDate = new Date();

//             if (adExpirationDate < adCurrentDate) {
//                 await db.collection('ads').doc(ad.id).update({ status: 'inactive' });
//                 console.log(`Ad ${ad.id} expired, marked as inactive.`);
//                 continue;
//             }

//             if (new Date(ad.updatedAt) < currentDate.setHours(0, 0, 0, 0)) {
//                 await db.collection('ads').doc(ad.id).update({ displayedToday: 0 });
//                 console.log(`Ad ${ad.id} displayedToday reset.`);
//             }

//             if (ad.displayedToday >= ad.perDayDisplayCount) {
//                 await db.collection('ads').doc(ad.id).update({ status: 'inactive' });
//                 console.log(`Ad ${ad.id} exceeded perDayDisplayCount, marked as inactive.`);
//                 continue;
//             }

//             // Add valid ads to the list
//             validAds.push(ad);
//         }

//         if (validAds.length === 0) {
//             return res.status(404).json({ message: 'No valid active ads available at the moment' });
//         }

//         // Randomly select an ad from the valid ads
//         const randomIndex = Math.floor(Math.random() * validAds.length);
//         const randomAd = validAds[randomIndex];

//         await db.collection('ads').doc(randomAd.id).update({
//             displayedToday: admin.firestore.FieldValue.increment(1),
//             displayedThisMonth: admin.firestore.FieldValue.increment(1),
//             totalViews: admin.firestore.FieldValue.increment(1),
//         });

//         await db.collection('ads').doc(randomAd.id).update({ updatedAt: currentDate });

//         res.status(200).json(randomAd);
//     } catch (error) {
//         console.log("Error while fetching random ad:", error);
//         res.status(500).json({ message: 'Failed to fetch random ad', error });
//     }
// };


// export const clickAd = async (req, res) => {
//     try {
//         const { adId } = req.params;
//         const db = admin.firestore();

//         const adDoc = await db.collection('ads').doc(adId).get();
//         if (!adDoc.exists) {
//             return res.status(404).json({ message: 'Ad not found' });
//         }

//         await db.collection('ads').doc(adId).update({
//             totalClicks: admin.firestore.FieldValue.increment(1),
//             updatedAt: new Date()
//         });

//         res.status(200).json({ message: 'Click counted successfully' });
//     } catch (error) {
//         console.log("Error while counting click:", error);
//         res.status(500).json({ message: 'Failed to count click', error });
//     }
// };

// export const getAdClickRate = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const settingsRef = db.collection('ads').doc('ads_settings');
//         const settingsDoc = await settingsRef.get();

//         let perAdClickRate = 0;
//         if (!settingsDoc.exists) {
//             // Initialize if not present
//             await settingsRef.set({ perAdClickRate: 0, updatedAt: new Date() });
//         } else {
//             const data = settingsDoc.data();
//             perAdClickRate = typeof data.perAdClickRate === 'number' ? data.perAdClickRate : 0;
//         }

//         res.status(200).json({ rate: perAdClickRate });
//     } catch (error) {
//         console.log("Error while fetching ad click rate:", error);
//         res.status(500).json({ message: 'Failed to fetch ad click rate', error });
//     }
// };

// export const updateAdClickRate = async (req, res) => {
//     try {
//         const { rate } = req.body;
//         const perAdClickRate = parseFloat(rate);
//         const db = admin.firestore();
//         const settingsRef = db.collection('ads').doc('ads_settings');

//         if (typeof perAdClickRate !== 'number') {
//             return res.status(400).json({ message: 'perAdClickRate must be a number' });
//         }

//         await settingsRef.set({
//             perAdClickRate,
//             updatedAt: new Date()
//         }, { merge: true });

//         res.status(200).json({ message: 'perAdClickRate updated successfully', perAdClickRate });
//     } catch (error) {
//         console.log("Error while updating ad click rate:", error);
//         res.status(500).json({ message: 'Failed to update ad click rate', error });
//     }   
// };


// MongoDB version of Ad Controller
import { Ad, AdSettings } from '../models/Ad.js';
import { uploadToWordPress } from '../utils/uploadToWordPress.js';

export const createAd = async (req, res) => {
  try {
    const {
      adType, format, heading, subheading, description, url,
      bgColor, bgGradient, fontColor, startDate, endDate, displayCount
    } = req.body;

    let logoUrl, imageUrl, imageFileName;
    if (req.files?.logo) logoUrl = await uploadToWordPress(req.files.logo[0]);
    if (req.files?.image) {
      imageUrl = await uploadToWordPress(req.files.image[0]);
      imageFileName = req.files.image[0].originalname.replace(/\.[^/.]+$/, '');
    }

    if (format === 'custom') {
      if (!adType || !heading || !subheading || !description || !url || !startDate || !endDate || !displayCount) {
        return res.status(400).json({ message: 'Missing required fields for custom format' });
      }
    } else if (format === 'image') {
      if (!imageUrl || !adType || !url || !startDate || !endDate || !displayCount) {
        return res.status(400).json({ message: 'Missing required fields for image format' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid format' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = Math.max(Math.ceil((end - start) / (1000 * 3600 * 24)), 1);
    const perDayDisplayCount = Math.floor(Number(displayCount) / days);

    const ad = new Ad({
      adType, format, url, logo: logoUrl, image: imageUrl,
      heading: format === 'image' ? imageFileName : heading,
      subheading, description, bgColor, bgGradient, fontColor,
      startDate: start, endDate: end,
      displayCount: Number(displayCount), perDayDisplayCount,
      displayedToday: 0, displayedThisMonth: 0, totalViews: 0, totalClicks: 0,
      createdAt: new Date(), updatedAt: new Date()
    });

    const savedAd = await ad.save();
    res.status(201).json(savedAd);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ message: 'Failed to create ad', error });
  }
};

export const getAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ message: 'Failed to fetch ads', error });
  }
};

export const getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.adId);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.status(200).json(ad);
  } catch (error) {
    console.error('Error fetching ad by ID:', error);
    res.status(500).json({ message: 'Failed to fetch ad', error });
  }
};

export const updateAd = async (req, res) => {
  try {
    const { adId } = req.params;
    const { startDate, endDate, displayCount } = req.body;
    const updateData = { ...req.body, updatedAt: new Date() };

    if (req.files?.logo) updateData.logo = await uploadToWordPress(req.files.logo[0]);
    if (req.files?.image) updateData.image = await uploadToWordPress(req.files.image[0]);

    if (startDate && endDate && displayCount) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.max(Math.ceil((end - start) / (1000 * 3600 * 24)), 1);
      updateData.perDayDisplayCount = Math.floor(Number(displayCount) / days);
      updateData.startDate = start;
      updateData.endDate = end;
      updateData.displayCount = Number(displayCount);
    }

    const updatedAd = await Ad.findByIdAndUpdate(adId, updateData, { new: true });
    if (!updatedAd) return res.status(404).json({ message: 'Ad not found' });
    res.status(200).json(updatedAd);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ message: 'Failed to update ad', error });
  }
};

export const deleteAd = async (req, res) => {
  try {
    const deleted = await Ad.findByIdAndDelete(req.params.adId);
    if (!deleted) return res.status(404).json({ message: 'Ad not found' });
    res.status(200).json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ message: 'Failed to delete ad', error });
  }
};

export const getRandomAd = async (req, res) => {
  try {
    const currentDate = new Date();
    const ads = await Ad.find({ status: 'active', adType: req.query.adType || /.*/ });

    const validAds = await Promise.all(ads.map(async ad => {
      const isExpired = new Date(ad.endDate) < currentDate;
      if (isExpired) {
        ad.status = 'inactive';
        await ad.save();
        return null;
      }

      const adDay = new Date(ad.updatedAt).setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      if (adDay !== today) ad.displayedToday = 0;

      if (ad.displayedToday >= ad.perDayDisplayCount) {
        ad.status = 'inactive';
        await ad.save();
        return null;
      }

      return ad;
    }));

    const filtered = validAds.filter(Boolean);
    if (!filtered.length) return res.status(404).json({ message: 'No valid active ads available' });

    const randomAd = filtered[Math.floor(Math.random() * filtered.length)];
    randomAd.displayedToday++;
    randomAd.displayedThisMonth++;
    randomAd.totalViews++;
    randomAd.updatedAt = currentDate;
    await randomAd.save();

    res.status(200).json(randomAd);
  } catch (error) {
    console.error('Error getting random ad:', error);
    res.status(500).json({ message: 'Failed to fetch random ad', error });
  }
};

export const clickAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.adId);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    ad.totalClicks++;
    ad.updatedAt = new Date();
    await ad.save();

    res.status(200).json({ message: 'Click counted successfully' });
  } catch (error) {
    console.error('Error updating click count:', error);
    res.status(500).json({ message: 'Failed to count click', error });
  }
};

export const getAdClickRate = async (req, res) => {
  try {
    let settings = await AdSettings.findOne();
    if (!settings) {
      settings = new AdSettings();
      await settings.save();
    }
    res.status(200).json({ rate: settings.perAdClickRate });
  } catch (error) {
    console.error('Error fetching ad click rate:', error);
    res.status(500).json({ message: 'Failed to fetch ad click rate', error });
  }
};

export const updateAdClickRate = async (req, res) => {
  try {
    const rate = parseFloat(req.body.rate);
    if (isNaN(rate)) return res.status(400).json({ message: 'Invalid rate' });

    const settings = await AdSettings.findOneAndUpdate({}, {
      perAdClickRate: rate,
      updatedAt: new Date()
    }, { new: true, upsert: true });

    res.status(200).json({ message: 'Click rate updated', perAdClickRate: settings.perAdClickRate });
  } catch (error) {
    console.error('Error updating ad click rate:', error);
    res.status(500).json({ message: 'Failed to update ad click rate', error });
  }
};
