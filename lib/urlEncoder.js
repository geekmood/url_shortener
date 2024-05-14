import Redis from "ioredis";
import randomstring from "randomstring";

const redis = new Redis();

// Main function that will get the URL to be encoded and stored.
// Used Redis for both fast retrieval and asynchronous behavior
export default async function urlEncoder(url) {
  if ((await getURL(url)) === null) {
    const redisRes = await persistURL(url);

    // Keeping in view the need of getting the URL from the shortened URL itself, this method will store
    // the `key:value` and `value:key` pairs in Redis.
    if (
      redisRes === "OK" &&
      (await persistURL(await redis.get(url), url)) === "OK"
    ) {
      return await redis.get(url);
    } else {
      return null;
    }
  } else {
    return false;
  }
}

// Main Logic for creating a random string and persisting in the Redis cache.
async function persistURL(key, value) {
  if (!value) {
    let shortURLValue = randomstring.generate({
      length: 10,
      charset: "alphanumeric",
      capitalization: "lowercase",
    });

    // A small check to see if the generated URL might be generated once again, as this library is using Math.random()
    // which don't guarantee randomness every single time
    if ((await getURL(shortURLValue)) === null)
      return await redis.set(
        key,
        randomstring.generate({
          length: 10,
          charset: "alphanumeric",
          capitalization: "lowercase",
        })
      );
    else {
      console.log(
        "The generated random URL was already generated previously ans stored\nRetrying again"
      );
      persistURL(key, value);
    }
  } else {
    return await redis.set(key, value);
  }
}

// Simple method to retrieve the short URL from the Redis
async function getURL(key) {
  return await redis.get(key);
}

// Method facilitating the retrieval of original URL from the shorter one.
export const getOriginalURL = async (shortURL) => {
  return getURL(shortURL);
};

// Creating the full URL to respond the client with
export const urlResponseMaker = (encodedURL) => {
  return `${process.env.BASE_URL}/${encodedURL}`;
};
