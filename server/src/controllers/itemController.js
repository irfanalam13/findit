
import Item from '../models/Item.js';

export async function getItems(req, res, next) {
  try {
    const { type, category, search } = req.query;

    const filter = { status: 'active' };

    if (['lost', 'found'].includes(type)) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (search?.trim()) {
      // Escape regex special characters in the user's search query.
      const escaped = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { location: { $regex: escaped, $options: 'i' } },
        { color: { $regex: escaped, $options: 'i' } },
      ];
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createItem(req, res, next) {
  try {
    // req.user is populated by requireAuth middleware.
    // Never take the report owner's ID from req.body.
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to submit a report.',
      });
    }

    const {
      title,
      description,
      type,
      category,
      color,
      location,
      dateOccurred,
      imageUrl,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !dateOccurred
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either lost or found.',
      });
    }

    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      type,
      category,
      color,
      location: location.trim(),
      dateOccurred,
      imageUrl,

      // The key line: link this report to the logged-in user.
      reportedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
}
