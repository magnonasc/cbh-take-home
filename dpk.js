const crypto = require('crypto');

const TRIVIAL_PARTITION_KEY = '0';
const MAX_PARTITION_KEY_LENGTH = 256;

exports.deterministicPartitionKey = (event) => {
  if (!event) {
    return TRIVIAL_PARTITION_KEY;
  }

  if (!event.partitionKey) {
    return createHash(JSON.stringify(event));
  }

  let candidate = event.partitionKey;

  if (typeof candidate !== 'string') {
    candidate = JSON.stringify(candidate);
  }

  if (candidate.length > MAX_PARTITION_KEY_LENGTH) {
    candidate = createHash(candidate);
  }
  
  return candidate;
};

const createHash = (source) => crypto.createHash('sha3-512').update(source).digest('hex');
