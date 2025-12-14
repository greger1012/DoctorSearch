// App-wide constants

// Cache TTL for vocabulary (15 minutes)
const VOCAB_CACHE_TTL_MS = 15 * 60 * 1000;

// Month names for parsing date queries
const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

module.exports = {
  VOCAB_CACHE_TTL_MS,
  MONTH_NAMES
};

