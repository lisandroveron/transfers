import {createHash, randomBytes} from "crypto";

export function createSignature() {
  const key = process.env.API_KEY;
  const secret = process.env.API_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);

  const hash = createHash("sha256");

  hash.update(`${key}${secret}${timestamp}`);
  
  return hash.digest("hex");
};

export function saltPassword(password, salt) {
  if (!salt) {
    salt = randomBytes(16).toString("hex");
  };

  const hash = createHash("sha256");
  
  hash.update(password + salt);

  return [hash.digest("hex"), salt];
};

export function signedFetch(url) {
  return fetch(process.env.API_URL + url, {
    headers: {
      "Content-Type": "application/json",
      "Api-key": process.env.API_KEY,
      "X-Signature": () => createSignature
    }
  }).then((response) => {
    if (response.status === 204) {
      return null;
    };
    return response.json();
  });
};