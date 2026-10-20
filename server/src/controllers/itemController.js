
import Item from '../models/Item.js'

export async function getItems(req, res, next) {
  try {
    const { type, category, search } = req.query

    const filter = { status: 'active' }

    if (['lost', 'found'].includes(type)) {
      filter.type = type
    }

    if (category) {
      filter.category = category
    }

    if (search?.trim()) {
      const escaped = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      )

      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { location: { $regex: escaped, $options: 'i' } },
        { color: { $regex: escaped, $options: 'i' } },
      ]
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    res.json({ success: true, count: items.length, items })
  } catch (error) {
    next(error)
  }
}

export async function createItem(req, res, next) {
  try {
    const {
      title,
      description,
      type,
      category,
      color,
      location,
      dateOccurred,
      imageUrl,
    } = req.body

    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !dateOccurred
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      })
    }

    const item = await Item.create({
      title,
      description,
      type,
      category,
      color,
      location,
      dateOccurred,
      imageUrl,
    })

    res.status(201).json({
      success: true,
      item,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    next(error)
  }
}
