
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  scoreCandidate,
  textSimilarity,
} from './matchingService.js';

const source = {
  _id: 'lost-1',
  type: 'lost',
  category: 'electronics',
  title: 'Black Samsung phone',
  description: 'Black phone with a cracked screen and blue case',
  color: 'black',
  location: 'Thamel Kathmandu',
  dateOccurred: '2026-10-20T10:00:00.000Z',
};

test('textSimilarity ignores case and punctuation', () => {
  assert.equal(
    textSimilarity('Black Samsung Phone!', 'black samsung phone'),
    1,
  );
});

test('textSimilarity returns zero for unrelated words', () => {
  assert.equal(
    textSimilarity('black samsung phone', 'red leather wallet'),
    0,
  );
});

test('a similar found report receives a high score', () => {
  const candidate = {
    _id: 'found-1',
    type: 'found',
    category: 'electronics',
    title: 'Samsung phone black',
    description: 'Black Samsung phone with cracked screen and blue case',
    color: 'black',
    location: 'Thamel Kathmandu',
    dateOccurred: '2026-10-21T10:00:00.000Z',
    createdAt: '2026-10-21T11:00:00.000Z',
  };

  const result = scoreCandidate(source, candidate);

  assert.ok(result.score >= 80, `Score was ${result.score}`);
  assert.ok(result.reasons.includes('Same category'));
  assert.ok(result.reasons.includes('Similar item title'));
  assert.ok(result.reasons.includes('Similar color'));
  assert.ok(result.reasons.includes('Similar location text'));
});

test('a report with unrelated title and description scores lower', () => {
  const candidate = {
    _id: 'found-2',
    type: 'found',
    category: 'electronics',
    title: 'Old digital camera',
    description: 'Silver camera with a broken lens',
    color: 'silver',
    location: 'Patan',
    dateOccurred: '2026-10-20T10:00:00.000Z',
    createdAt: '2026-10-20T11:00:00.000Z',
  };

  const result = scoreCandidate(source, candidate);

  assert.ok(result.score < 60, `Score was ${result.score}`);
});

test('matching score never exceeds 100', () => {
  const candidate = {
    ...source,
    _id: 'found-3',
    type: 'found',
    createdAt: '2026-10-20T11:00:00.000Z',
  };

  const result = scoreCandidate(source, candidate);

  assert.ok(result.score >= 0);
  assert.ok(result.score <= 100);
});
