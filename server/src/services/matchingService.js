
import Item from '../models/Item.js';

const MAX_CANDIDATES = 200;
const MAX_RESULTS = 20;
const MAX_DAYS_APART = 90;
const MIN_MATCH_SCORE = 35;
const DAY_MS = 24 * 60 * 60 * 1000;

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'the',
  'of',
  'for',
  'with',
  'my',
  'is',
  'it',
  'this',
  'that',
]);

const WEIGHTS = {
  category: 20,
  title: 20,
  description: 20,
  color: 10,
  location: 15,
  date: 15,
};

function normalize(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(value = '') {
  return new Set(
    normalize(value)
      .split(' ')
      .filter((word) => word && !STOP_WORDS.has(word)),
  );
}

export function textSimilarity(first = '', second = '') {
  const left = words(first);
  const right = words(second);

  if (!left.size || !right.size) {
    return 0;
  }

  const intersection = [...left].filter((word) =>
    right.has(word),
  ).length;

  const union = new Set([...left, ...right]).size;

  return union ? intersection / union : 0;
}

function dateDifferenceInDays(first, second) {
  const firstTime = new Date(first).getTime();
  const secondTime = new Date(second).getTime();

  if (
    !Number.isFinite(firstTime) ||
    !Number.isFinite(secondTime)
  ) {
    return null;
  }

  return Math.abs(firstTime - secondTime) / DAY_MS;
}

function dateSimilarity(first, second) {
  const days = dateDifferenceInDays(first, second);

  if (days === null || days > MAX_DAYS_APART) {
    return 0;
  }

  return Math.max(0, 1 - days / MAX_DAYS_APART);
}

function scoreCandidate(source, candidate) {
  const titleSimilarity = textSimilarity(
    source.title,
    candidate.title,
  );

  const descriptionSimilarity = textSimilarity(
    source.description,
    candidate.description,
  );

  const colorSimilarity = textSimilarity(
    source.color,
    candidate.color,
  );

  const locationSimilarity = textSimilarity(
    source.location,
    candidate.location,
  );

  const dateScore = dateSimilarity(
    source.dateOccurred,
    candidate.dateOccurred,
  );

  const categoryScore =
    source.category === candidate.category ? 1 : 0;

  const score = Math.round(
    categoryScore * WEIGHTS.category +
      titleSimilarity * WEIGHTS.title +
      descriptionSimilarity * WEIGHTS.description +
      colorSimilarity * WEIGHTS.color +
      locationSimilarity * WEIGHTS.location +
      dateScore * WEIGHTS.date,
  );

  const reasons = [];

  if (categoryScore) {
    reasons.push('Same category');
  }

  if (titleSimilarity >= 0.5) {
    reasons.push('Similar item title');
  }

  if (descriptionSimilarity >= 0.25) {
    reasons.push('Similar description');
  }

  if (colorSimilarity >= 0.5) {
    reasons.push('Similar color');
  }

  if (locationSimilarity >= 0.5) {
    reasons.push('Similar location text');
  }

  const days = dateDifferenceInDays(
    source.dateOccurred,
    candidate.dateOccurred,
  );

  if (days !== null && days <= 7) {
    reasons.push('Reported dates are within 7 days');
  } else if (days !== null && days <= 30) {
    reasons.push('Reported dates are within 30 days');
  }

  return {
    item: candidate,
    score,
    reasons,
  };
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function findMatches(itemId, userId) {
  if (!itemId || !userId) {
    throw httpError(
      400,
      'A report ID and authenticated user are required.',
    );
  }

  const source = await Item.findById(itemId).lean();

  if (source.isHidden) {
    throw httpError(404, 'Report not found.');
  }

  if (
    !source.reportedBy ||
    String(source.reportedBy) !== String(userId)
  ) {
    throw httpError(
      403,
      'Only the report owner can view private match suggestions.',
    );
  }

  if (!['lost', 'found'].includes(source.type)) {
    throw httpError(400, 'The report has an invalid type.');
  }

  if (source.status !== 'active') {
    return [];
  }

  const sourceDate = new Date(source.dateOccurred);

  if (!Number.isFinite(sourceDate.getTime())) {
    throw httpError(
      400,
      'The report has an invalid occurrence date.',
    );
  }

  const oppositeType =
    source.type === 'lost' ? 'found' : 'lost';

  const dateFrom = new Date(
    sourceDate.getTime() - MAX_DAYS_APART * DAY_MS,
  );

  const dateTo = new Date(
    sourceDate.getTime() + MAX_DAYS_APART * DAY_MS,
  );

  const candidates = await Item.find({
    _id: { $ne: source._id },
    type: oppositeType,
    category: source.category,
    status: 'active',
    isHidden: { $ne: true },

    // Exclude the owner and legacy reports without an owner.
    reportedBy: {
      $exists: true,
      $ne: source.reportedBy,
    },

    dateOccurred: {
      $gte: dateFrom,
      $lte: dateTo,
    },
  })
    .sort({ createdAt: -1 })
    .limit(MAX_CANDIDATES)
    .lean();

  return candidates
    .map((candidate) => scoreCandidate(source, candidate))
    .filter((result) => result.score >= MIN_MATCH_SCORE)
    .sort(
      (first, second) =>
        second.score - first.score ||
        new Date(second.item.createdAt) -
          new Date(first.item.createdAt),
    )
    .slice(0, MAX_RESULTS);
}

export { scoreCandidate };
