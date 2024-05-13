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

export function getConfirmationResponse(req, transfer) {
  const creationDate = new Date().toISOString().replace(/\.[0-9]+Z/, "");
  const currency = transfer.cancellationPolicies[0].currencyId;
  const reference = createHash("sha256").update(transfer.rateKey).digest("hex");
  const totalAmount = transfer.cancellationPolicies[0].amount;

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

  return [reference, response.bookings[0]];
};