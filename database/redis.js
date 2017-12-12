import Promise from 'bluebird';
import redis from 'redis';

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

// client.on('error', err => {
//   console.log('Error connecting to Redis:', err);
// });

// client.setAsync('string key', 'string val', redis.print);
// client.hsetAsync('hash key', 'hashtest 1', 'some value', redis.print);
// client.hsetAsync(['hash key', 'hashtest 2', 'some other value'], redis.print);
// client.hkeysAsync('hash key', (err, replies) => {
//   console.log(`${replies.length} replies:`);
//   replies.forEach((reply, i) => {
//     console.log(`    ${i}: ${reply}`);
//   });
//   client.quit();
// });

export default client;
