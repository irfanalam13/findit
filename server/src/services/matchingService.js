
import Item from '../models/Item.js';

const MAX_CANDIDATES = 200;
const MAX_RESULTS = 20;
const MAX_DAYS_APART = 90;

function normalize(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarity(a, b) {
  const left = normalize(a);
  const right = normalize(b);

  if (!left || !right) return 0;
  if (left === right) return 1;

  const leftWords = new Set(left.split(' '));
  const rightWords = new Set(right.split(' '));

  const intersection = [...leftWords].filter(
    (word) => rightWords.has(word),
  ).length;

  const union = new Set([...leftWords, ...rightWords]).size;

  return union ? intersection / union : 0;
}

function dateSimilarity(dateA, dateB) {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();

  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;

  const days = Math.abs(a - b) / (1000 * 60 * 60 * 24);

  if (days > MAX_DAYS_APART) return 0;

  return Math.max(0, 1 - days / MAX_DAYS_APART);
}

function locationSimilarity(a, b) {
  // Text similarity is only a rough proxy for geographic proximity.
  // Replace this with validated locality/coordinates when available.
  return similarity(a, b);
}

function scoreCandidate(source, candidate) {
  const categoryScore = 25;

  const descriptionScore =
    25 * similarity(
      `${source.title} ${source.description}`,
      `${candidate.title} ${candidate.description}`,
    );

  const colorScore =
    10 * similarity(source.color, candidate.color);

  const locationScore =
    20 * locationSimilarity(source.location, candidate.location);

  const dateScore =
    20 * dateSimilarity(source.dateOccurred, candidate.dateOccurred);

  const score = Math.round(
    categoryScore +
      descriptionScore +
      colorScore +
      locationScore +
      dateScore,
  );

  return {
    item: candidate,
    score,
    reasons: [
      'Same category',
      ...(similarity(source.color, candidate.color) >= 0.5
        ? ['Similar color']
        : []),
      ...(similarity(source.location, candidate.location) >= 0.5
        ? ['Similar location text']
        : []),
      ...(dateSimilarity(
        source.dateOccurred,
        candidate.dateOccurred,
      ) >= 0.5
        ? ['Dates are relatively close']
        : []),
    ],
  };
}

export async function findMatches(itemId, userId) {
  const source = await Item.findById(itemId).lean();

  if (!source) {
    const error = new Error('Report not found.');
    error.status = 404;
    throw error;
  }

  if (
    !source.reportedBy ||
    String(source.reportedBy) !== String(userId)
  ) {
    const error = new Error(
      'Only the report owner can view its private match suggestions.',
    );
    error.status = 403;
    throw error;
  }

  if (source.status !== 'active') {
    return [];
  }

  const oppositeType = source.type === 'lost' ? 'found' : 'lost';

  const candidates = await Item.find({
    _id: { $ne: source._id },
    type: oppositeType,
    category: source.category,
    status: 'active',
    reportedBy: { $ne: userId },
    dateOccurred: {
      $gte: new Date(
        new Date(source.dateOccurred).getTime() -
          MAX_DAYS_APART * 86400000,
      ),
      $lte: new Date(
        new Date(source.dateOccurred).getTime() +
          MAX_DAYS_APART * 86400000,
      ),
    },
  })
    .sort({ createdAt: -1 })
    .limit(MAX_CANDIDATES)
    .lean();

  return candidates
    .map((candidate) => scoreCandidate(source, candidate))
    .filter((result) => result.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}
