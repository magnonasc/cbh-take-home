const { deterministicPartitionKey } = require('./dpk');

describe('deterministicPartitionKey', () => {
  it("Should return the literal '0' when given no input", () => {
    const trivialKey = deterministicPartitionKey();

    expect(trivialKey).toBe('0');
  });

  it('Should return the partition key when it is a string value', () => {
    const event = { partitionKey: 'partition-key' };

    const partitionKey = deterministicPartitionKey(event);

    expect(partitionKey).toBe('partition-key');
  });

  it('Should return a hashed representation of the partition key when it is a string value with length greater than 256', () => {
    const event = {
      partitionKey:
        'big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key'
    };

    const partitionKey = deterministicPartitionKey(event);

    expect(partitionKey).toBe(
      'd24a7b9c15d162325e3c588734e711ef260fbde5a4e787dad117d0ec39083ef259b96dce08e3c44a5ae8907649d216ababc6337ccbd0b42bf09340b1f4214297'
    );
  });

  it('Should return the stringified partition key when it is not a string value', () => {
    const event = { partitionKey: { objectPartitionKey: 'partition-key' } };

    const partitionKey = deterministicPartitionKey(event);

    expect(partitionKey).toBe(JSON.stringify(event.partitionKey));
  });

  it('Should return a hashed representation of the stringified partition key when it is not a string value and its stringified version has length greater than 256', () => {
    const event = {
      partitionKey: {
        objectPartitionKey:
          'big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key-big-partition-key'
      }
    };

    const partitionKey = deterministicPartitionKey(event);

    expect(partitionKey).toBe(
      'e03d415f7b749a2315dbb2569a0b3a2f3d6033a1980fce6c63ac6feefc093d0b3e4eee899ff4e5a765db34be77244144e53a0f0bb56175f1f26218939b350aa3'
    );
  });

  it('Should return a hashed representation of the stringified event when the partition key is not present', () => {
    const event = { noPartitionKey: true };

    const partitionKey = deterministicPartitionKey(event);

    expect(partitionKey).toBe(
      '6a5f8ecb80993c3cef6396e182365a74879edab27736adbec13db5ef0a34e1beda4e0fe33ea70c3d2be237f6c25a3ac0b1061e67907c7a3b0b3e851832415866'
    );
  });
});
