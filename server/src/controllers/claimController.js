
import mongoose from 'mongoose';

import Item from '../models/Item.js';
import Claim from '../models/Claim.js';

const isValidId = (value) =>
  typeof value === 'string' &&
  mongoose.isValidObjectId(value);

export async function createClaim(req, res, next) {
  try {
    const {
      lostItemId,
      foundItemId,
      message = '',
    } = req.body;

    if (!isValidId(lostItemId) || !isValidId(foundItemId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lost and found report IDs are required.',
      });
    }

    if (
      typeof message !== 'string' ||
      message.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Message must be 1000 characters or fewer.',
      });
    }

    if (lostItemId === foundItemId) {
      return res.status(400).json({
        success: false,
        message: 'A report cannot be claimed against itself.',
      });
    }

    const [lostItem, foundItem] = await Promise.all([
      Item.findById(lostItemId).lean(),
      Item.findById(foundItemId).lean(),
    ]);

    if (!lostItem || !foundItem) {
      return res.status(404).json({
        success: false,
        message: 'One or both reports were not found.',
      });
    }

    if (
      lostItem.type !== 'lost' ||
      foundItem.type !== 'found'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Select one lost report and one found report.',
      });
    }

    if (
      String(lostItem.reportedBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You must own the lost report to submit a claim.',
      });
    }

    if (
      !foundItem.reportedBy ||
      String(foundItem.reportedBy) === String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot claim your own found report.',
      });
    }

    if (
      lostItem.status !== 'active' ||
      foundItem.status !== 'active'
    ) {
      return res.status(409).json({
        success: false,
        message: 'Both reports must be active to submit a claim.',
      });
    }

    if (lostItem.category !== foundItem.category) {
      return res.status(400).json({
        success: false,
        message: 'The report categories must match.',
      });
    }

    // Return an existing claim rather than creating a duplicate.
    const existing = await Claim.findOne({
      lostItem: lostItem._id,
      foundItem: foundItem._id,
      claimant: req.user._id,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        claim: existing,
        message: 'You have already submitted this claim.',
      });
    }

    try {
      const claim = await Claim.create({
        lostItem: lostItem._id,
        foundItem: foundItem._id,
        claimant: req.user._id,
        message: message.trim(),
      });

      return res.status(201).json({
        success: true,
        duplicate: false,
        claim,
      });
    } catch (error) {
      // Another concurrent request may have created the same claim.
      if (error.code === 11000) {
        const duplicate = await Claim.findOne({
          lostItem: lostItem._id,
          foundItem: foundItem._id,
          claimant: req.user._id,
        });

        if (duplicate) {
          return res.status(200).json({
            success: true,
            duplicate: true,
            claim: duplicate,
            message: 'You have already submitted this claim.',
          });
        }

        return res.status(409).json({
          success: false,
          message:
            'This item already has an accepted claim or cannot be claimed.',
        });
      }

      throw error;
    }
  } catch (error) {
    return next(error);
  }
}

export async function getMyClaims(req, res, next) {
  try {
    const claims = await Claim.find({
      claimant: req.user._id,
    })
      .populate('lostItem')
      .populate('foundItem')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getReceivedClaims(req, res, next) {
  try {
    const foundReports = await Item.find({
      reportedBy: req.user._id,
      type: 'found',
    })
      .select('_id')
      .lean();

    const foundItemIds = foundReports.map((item) => item._id);

    const claims = await Claim.find({
      foundItem: { $in: foundItemIds },
    })
      .populate('lostItem')
      .populate('foundItem')
      .populate('claimant', 'name username')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    return next(error);
  }
}


export async function requestReconsideration(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID.',
      });
    }

    const claim = await Claim.findById(id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.',
      });
    }

    // Only the person who originally claimed the item can request review.
    if (String(claim.claimant) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the original claimant can request reconsideration.',
      });
    }

    if (claim.status !== 'rejected') {
      return res.status(409).json({
        success: false,
        message: 'Only a rejected claim can be reconsidered.',
      });
    }

    // Reports must still be available before asking the finder to review again.
    const [lostItem, foundItem] = await Promise.all([
      Item.findById(claim.lostItem).lean(),
      Item.findById(claim.foundItem).lean(),
    ]);

    if (
      !lostItem ||
      !foundItem ||
      lostItem.status !== 'active' ||
      foundItem.status !== 'active'
    ) {
      return res.status(409).json({
        success: false,
        message: 'One or both reports are no longer available for reconsideration.',
      });
    }

    const updatedClaim = await Claim.findOneAndUpdate(
      { _id: claim._id, status: 'rejected' },
      {
        $set: {
          status: 'reconsideration_requested',
          reconsiderationRequestedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedClaim) {
      return res.status(409).json({
        success: false,
        message: 'This claim has already changed. Refresh and try again.',
      });
    }

    return res.json({
      success: true,
      claim: updatedClaim,
      message: 'Reconsideration requested. The finder can now review your claim again.',
    });
  } catch (error) {
    return next(error);
  }
}


export async function reviewClaim(req, res, next) {
  let reservedLostItemId = null;
  let reservedFoundItemId = null;

  try {
    const { id } = req.params;
    const { decision } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID.',
      });
    }

    if (!['accepted', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be accepted or rejected.',
      });
    }

    const claim = await Claim.findById(id);

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

    if (
      !['pending', 'reconsideration_requested'].includes(claim.status)
    ) {
      return res.status(409).json({
        success: false,
        message: 'This claim has already been reviewed.',
      });
    }

    // Rejection needs only one atomic state transition.
    if (decision === 'rejected') {
      const rejected = await Claim.findOneAndUpdate(
        { _id: claim._id, status: 'pending' },
        {
          $set: {
            status: 'rejected',
            reviewedAt: new Date(),
          },
        },
        { new: true, runValidators: true },
      );

      if (!rejected) {
        return res.status(409).json({
          success: false,
          message: 'This claim has already been reviewed.',
        });
      }

      return res.json({
        success: true,
        claim: rejected,
        message: 'Claim rejected.',
      });
    }

    // Reserve the lost report first to prevent competing claims
    // from being accepted for the same lost item.
    const lostReservation = await Item.findOneAndUpdate(
      { _id: claim.lostItem, type: 'lost', status: 'active' },
      { $set: { status: 'claimed' } },
      { new: true },
    );

    if (!lostReservation) {
      return res.status(409).json({
        success: false,
        message: 'The lost report is no longer available for claiming.',
      });
    }

    reservedLostItemId = lostReservation._id;

    // Then reserve the found report.
    const foundReservation = await Item.findOneAndUpdate(
      { _id: claim.foundItem, type: 'found', status: 'active' },
      { $set: { status: 'claimed' } },
      { new: true },
    );

    if (!foundReservation) {
      await Item.updateOne(
        { _id: reservedLostItemId, status: 'claimed' },
        { $set: { status: 'active' } },
      );

      reservedLostItemId = null;

      return res.status(409).json({
        success: false,
        message: 'The found report is no longer available for claiming.',
      });
    }

    reservedFoundItemId = foundReservation._id;

    let accepted;

    try {
      accepted = await Claim.findOneAndUpdate(
        { _id: claim._id, status: 'pending' },
        {
          $set: {
            status: 'accepted',
            reviewedAt: new Date(),
          },
        },
        { new: true, runValidators: true },
      );
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      accepted = null;
    }

    if (!accepted) {
      await Promise.all([
        Item.updateOne(
          { _id: reservedLostItemId, status: 'claimed' },
          { $set: { status: 'active' } },
        ),
        Item.updateOne(
          { _id: reservedFoundItemId, status: 'claimed' },
          { $set: { status: 'active' } },
        ),
      ]);

      reservedLostItemId = null;
      reservedFoundItemId = null;

      return res.status(409).json({
        success: false,
        message:
          'The claim was already reviewed or another claim was accepted.',
      });
    }

    return res.json({
      success: true,
      claim: accepted,
      message:
        'Claim accepted. The item is reserved; confirm the physical handover in Step 3.',
    });
  } catch (error) {
    // Best-effort cleanup if an unexpected error occurs after reservation.
    // A transaction is still preferable for production consistency.
    const cleanup = [];

    if (reservedLostItemId) {
      cleanup.push(
        Item.updateOne(
          { _id: reservedLostItemId, status: 'claimed' },
          { $set: { status: 'active' } },
        ),
      );
    }

    if (reservedFoundItemId) {
      cleanup.push(
        Item.updateOne(
          { _id: reservedFoundItemId, status: 'claimed' },
          { $set: { status: 'active' } },
        ),
      );
    }

    if (cleanup.length) {
      await Promise.allSettled(cleanup);
    }

    return next(error);
  }
}

