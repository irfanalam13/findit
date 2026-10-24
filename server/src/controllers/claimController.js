
import mongoose from 'mongoose';

import Item from '../models/Item.js';
import Claim from '../models/Claim.js';

export async function createClaim(req, res, next) {
  try {
    const { lostItemId, foundItemId, message = '' } = req.body;

    if (
      !mongoose.isValidObjectId(lostItemId) ||
      !mongoose.isValidObjectId(foundItemId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid lost and found report IDs are required.',
      });
    }

    if (typeof message !== 'string' || message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be 1000 characters or fewer.',
      });
    }

    const [lostItem, foundItem] = await Promise.all([
      Item.findById(lostItemId),
      Item.findById(foundItemId),
    ]);

    if (!lostItem || !foundItem) {
      return res.status(404).json({
        success: false,
        message: 'One or both reports were not found.',
      });
    }

    if (lostItem.type !== 'lost' || foundItem.type !== 'found') {
      return res.status(400).json({
        success: false,
        message: 'Select one lost report and one found report.',
      });
    }

    if (
      lostItem.status !== 'active' ||
      foundItem.status !== 'active'
    ) {
      return res.status(409).json({
        success: false,
        message: 'Both reports must still be active.',
      });
    }

    if (
      String(lostItem.reportedBy) !== String(req.user._id) ||
      String(foundItem.reportedBy) === String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You must own the lost report, not the found report.',
      });
    }

    if (lostItem.category !== foundItem.category) {
      return res.status(400).json({
        success: false,
        message: 'The report categories must match.',
      });
    }

    const claim = await Claim.findOneAndUpdate(
      {
        lostItem: lostItem._id,
        foundItem: foundItem._id,
        claimant: req.user._id,
      },
      {
        $setOnInsert: {
          lostItem: lostItem._id,
          foundItem: foundItem._id,
          claimant: req.user._id,
          message: message.trim(),
          status: 'pending',
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.status(201).json({
      success: true,
      claim,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This claim already exists.',
      });
    }

    return next(error);
  }
}

export async function reviewClaim(req, res, next) {
  try {
    const { decision } = req.body;

    if (!['accepted', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be accepted or rejected.',
      });
    }

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.',
      });
    }

    const foundItem = await Item.findById(claim.foundItem);

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found report not found.',
      });
    }

    if (String(foundItem.reportedBy) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the finder can review this claim.',
      });
    }

    if (claim.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: 'This claim has already been reviewed.',
      });
    }

    const updated = await Claim.findOneAndUpdate(
      {
        _id: claim._id,
        status: 'pending',
      },
      {
        $set: {
          status: decision,
          reviewedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: 'This claim has already been reviewed.',
      });
    }

    return res.json({
      success: true,
      claim: updated,
    });
  } catch (error) {
    return next(error);
  }
}
