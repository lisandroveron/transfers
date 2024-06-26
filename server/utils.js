/**
 * @fileoverview Utility functions.
 * @module Utils
 */
import {createHash, randomBytes} from "crypto";
import fs from "fs";

/**
 * Create a valid signature for the X-Signature header of the fetches to
 * Hotelbeds. Signature is generated combining the API key, the API secret and
 * a UNIX timestamp, then calculates a SHA-256 hash based on them.
 * @return {string} Signature in hexadecimal.
 */
export function createSignature() {
  const key = process.env.API_KEY;
  const secret = process.env.API_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);

  const hash = createHash("sha256");

  hash.update(`${key}${secret}${timestamp}`);
  
  return hash.digest("hex");
};

// eslint-disable-next-line jsdoc/require-returns-check
/**
 * Parse a JSON file given the path.
 * @param {string} pathToFile Path to the JSON file.
 * @return {object} The parsed JSON.
 */
export function parseJSONFile(pathToFile) {
  try {
    const file = fs.readFileSync(pathToFile);
    return JSON.parse(file);
  } catch (error) {
    throw error;
  };
};

/**
 * Creates a salt (if it was not given) and uses it to salt the password.
 * @param {string} password The given password.
 * @param {string} [salt] Salt used to encrypt the password parameter.
 * @return {string} Salted password in hexadecimal.
 */
export function saltPassword(password, salt) {
  if (!salt) {
    salt = randomBytes(16).toString("hex");
  };

  const hash = createHash("sha256");
  
  hash.update(password + salt);

  return [hash.digest("hex"), salt];
};

/**
 * Performs a signed fetch to the specified URL.
 * @param {string} url The Hotelbeds URL to fetch.
 * @param {object} [body] The body parameters if Hotelbeds API requests it.
 * @param {string} [method] The HTTP method to use.
 * @return {Promise<*>} A Promise that resolves with the parsed JSON response,
 * or null if the response status is 204.
 */
export function signedFetch(url, body = undefined, method = "GET") {
  return fetch(process.env.API_URL + url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Api-key": process.env.API_KEY,
      "X-Signature": () => createSignature
    },
    body: JSON.stringify(body)
  }).then((response) => {
    if (response.status === 204) {
      return null;
    };
    
    return response.json();
  });
};

/**
 * Takes the transfer object to be booked and generates a custom confirmation
 * response. This function was created to avoid the Hotelbeds server error when
 * getting confirmation.
 * Note: This function should be removed when the Hotelbeds API fixes it's
 * issue.
 * @param {object} req Express Request object.
 * @param {object} transfer The transfer object to be booked.
 * @return {Array} Array that contains the booked transfer reference and the
 * generated response itself.
 */
export function getConfirmationResponse(req, transfer) {
  const creationDate = new Date().toISOString().replace(/\.[0-9]+Z/, "");
  const currency = transfer.cancellationPolicies[0].currencyId;
  const totalAmount = transfer.cancellationPolicies[0].amount;
  const reference = transfer.rateKey;

  const type = () => {
    switch (transfer.type) {
      case "A": return "FLIGHT";
      case "P": return "CRUISE";
      case "T": return "TRAIN";
      default: break;
    };
  };

  const response = {
    bookings: [{
      reference: reference,
      bookingFileId: null,
      creationDate: creationDate,
      status: "CONFIRMED",
      modificationsPolicies: {
        cancellation: true,
        modification: true
      },
      holder: {
        name: req.user.firstname,
        surname: req.user.lastname,
        email: req.user.email,
        phone: req.user.phone
      },
      transfers: [
        {
          id: 1,
          rateKey: transfer.rateKey,
          status: "CONFIRMED",
          transferType: transfer.transferType,
          vehicle: {...transfer.vehicle},
          category: {...transfer.category},
          pickupInformation: {...transfer.pickupInformation},
          paxes: [
            {
              type: "ADULT",
              age: 30
            },
          ],
          content: {...transfer.content},
          price: {...transfer.price},
          cancellationPolicies: [...transfer.cancellationPolicies],
          factsheetId: transfer.factsheetId,
          arrivalFlightNumber: "XR1234",
          departureFlightNumber: null,
          arrivalShipName: null,
          departureShipName: null,
          arrivalTrainInfo: null,
          departureTrainInfo: null,
          transferDetails: [{
            type: type(),
            direction: transfer.direction,
            code: "XR1234",
            companyName: null
          }],
          sourceMarketEmergencyNumber: "34871180153",
          links: [...transfer.links]
        }
      ],
      clientReference: "BOSTON#12-203#456754",
      remark: "",
      invoiceCompany: {
        code: "E14"
      },
      supplier: {
        name: "HOTELBEDS SPAIN, S.L.U",
        vatNumber: "ESB28916765"
      },
      totalAmount: totalAmount,
      totalNetAmount: totalAmount,
      pendingAmount: totalAmount,
      currency: currency,
      links: [
        {
          rel: "self",
          href: `/booking/en/reference/${reference}`,
          method: "GET"
        },
        {
          rel: "bookingDetail",
          href: `/booking/en/reference/${reference}`,
          method: "GET"
        },
        {
          rel: "bookingCancel",
          href: `/booking/en/reference/${reference}`,
          method: "DELETE"
        }
      ],
      paymentDataRequired: false
    }]
  };

  return [response.bookings[0].reference, response.bookings[0]];
};