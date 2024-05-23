import Sequelize from "sequelize";
import {User, Transfer} from "../sequelize/init.js";
import path from "path";
import msg from "./http_messages.js";
import {parseJSONFile, signedFetch, getConfirmationResponse} from "../utils.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const ITEMS_PER_PAGE = 20;
const LANGUAGE = "es";

/**
 * @api {put} /api/user/account Update user information.
 * @apiName account
 * @apiGroup User
 * 
 * @apiBody {string} [firstname]
 * @apiBody {string} [lastname]
 * @apiBody {string} [email]
 * @apiBody {number} [phone]
 * @apiBody {string} [password]

 * @apiSuccess {string} firstname
 * @apiSuccess {string} lastname
 * @apiSuccess {string} email
 * @apiSuccess {number} phone

 * @apiError (Error 400) {string} InvalidData The data provided is invalid.
 */
export async function account(req, res) {
  Object.keys(req.body).forEach((key) => {
    !req.body[key] ? delete req.body[key] : null;
  });

  const [modified, users] = await User.update(req.body, {
    where: {email: req.user.email},
    returning: true
  });

  if (!modified) {
    return res.status(400).send(msg[400].invalidData);
  };

  res.json(users[0].getAccountInfo());
};

/**
 * @api {get} /api/user/bookings Get user bookings.
 * @apiName bookings
 * @apiGroup User
 * 
 * @apiSuccess {object[]} bookings Booked transfers objects.
 */
export async function bookings(req, res) {
  const transfers = await req.user.getTransfers();
  
  const bookings = transfers.map((transfer) => transfer.data);

  res.json(bookings);
};

/**
 * @api {get} /api/hotelbeds/cache/categories Get cached transfer categories.
 * @apiName categories
 * @apiGroup Hotelbeds
 * 
 * @apiSuccess {object[]} categories List of cached transfers categories.
 * 
 * @apiError (Error 500) {string} CantReadResource The resource could not be
 * read.
 */
export function categories(req, res) {
  const pathToFile = path.join(__dirname, "cache/categories.json");

  try {
    const file = parseJSONFile(pathToFile);

    const uniqueNames = new Set();

    file.forEach((category) => uniqueNames.add(category.name));

    const categories = [];

    uniqueNames.forEach((name) => categories.push({name: name}));

    res.json(categories);
  } catch (error) {
    console.error("Error reading file: ", error);

    res.status(500).send(msg[500].cantReadResource);
  };
};

/**
 * @api {post} /api/user/bookings Confirm transfer booking.
 * @apiName confirmation
 * @apiGroup User
 * 
 * @apiBody {object} transfer Transfer object.
 * 
 * @apiSuccess {undefined} res Void response.
 * 
 * @apiError (Error 409) {undefined} TransferAlreadyExists Trying to confirm a
 * transfer already booked.
 * @apiError (Error 400) {undefined} InvalidData The data provided is invalid.
 */
export async function confirmation(req, res) {
  let transfer = req.body;

  if (!transfer.pickupInformation.date) {
    const date = transfer.rateKey.match(/\d{4}-\d{2}-\d{2}/)[0];

    transfer.pickupInformation.date = date;
  };

  if (!transfer.pickupInformation.time) {
    const time = transfer.rateKey.match(/\d{2}:\d{2}/)[0] + ":00";

    transfer.pickupInformation.time = time;
  };

  // const type = () => {
  //   switch (transfer.type) {
  //     case "A": return "FLIGHT";
  //     case "P": return "CRUISE";
  //     case "T": return "TRAIN";
  //     default: break;
  //   };
  // };

  // const request = {
  //   language: LANGUAGE,
  //   holder: {
  //     name: req.user.firstname,
  //     surname: req.user.lastname,
  //     email: req.user.email,
  //     phone: req.user.phone
  //   },
  //   transfers: {
  //     transfer: {
  //       rateKey: transfer.rateKey,
  //       transferDetails: {
  //         transferDetail: {
  //           type: type(),
  //           direction: transfer.direction,
  //           // The API does not provide information about how to obtain the
  //           // 'code' attribute.
  //           code: "XR1234"
  //         }
  //       }
  //     }
  //   }
  // };

  // const confirmation = await signedFetch("/transfer-api/1.0/bookings", request, "POST");

  /*
   * The code above is disabled because when fetching confirmation from the API
   * with the appropriate data, the API returns a server error (Code 500) and
   * fails to deliver a response.
   * This is the response error:
   *
   * {
   *   code: 'SYSTEM_ERROR',
   *   message: 'An unexpected error occurred while processing your request.
   *   Please try again later.',
   *   description: null,
   *   serviceName: 'transfer-api',
   *   isBadRequest: false,
   *   traceId: '8a96366abb5fe45e',
   *   fieldErrors: [],
   *   nestedError: null
   * }
   *
   * For this reason, and as an example, we choose to send a predefined
   * response to the client as follows:
  */

  const [reference, confirmed] = getConfirmationResponse(req, transfer);

  try {
    const [, created] = await Transfer.findOrCreate({
      where: {reference: reference},
      defaults: {
        reference: reference,
        data: confirmed,
        UserEmail: req.user.email
      }
    });

    if (!created) {
      return res.status(409).send();
    };

    res.send();
  } catch (error) {
    console.error(error);

    res.status(400).send();
  };
};

/**
 * @api {get} /api/hotelbeds/cache/countries Get cached country information.
 * @apiName countries
 * @apiGroup Hotelbeds
 * 
 * @apiSuccess {object[]} countryCodes List of cached country codes.
 * @apiSuccess {string} countryCodes.code Country code.
 * @apiSuccess {string} countryCodes.name Country name.
 * 
 * @apiError (Error 500) {string} CantReadResource The resource could not be
 * read.
 */
export function countries(req, res) {
  const pathToFile = path.join(__dirname, "cache/countryCodes.json");
  
  try {
    const countries = parseJSONFile(pathToFile);

    res.json(countries);
  } catch (error) {
    console.error("Error reading file: ", error);

    res.status(500).send(msg[500].cantReadResource);
  };
};

/**
 * @api {delete} /api/user/bookings Delete a booked transfer.
 * @apiName deleteBookings
 * @apiGroup User
 * 
 * @apiQuery {string} reference Reference value of the transfer.
 * 
 * @apiSuccess {undefined} res Void response.
 * 
 * @apiError (Error 404) {string} WasNotCancelled Transfer could not be
 * cancelled.
 */
export async function deleteBookings(req, res) {
  const destroyed = await Transfer.destroy({
    where: {reference: req.query.reference}
  });

  if (!destroyed) {
    return res.status(404).send(msg[404].wasNotCancelled);
  };

  res.send();
};

/**
 * @api {get} /api/hotelbeds/cache/destinations Get cached cities/provinces
 * information based on country.
 * @apiName destinations
 * @apiGroup Hotelbeds
 * 
 * @apiQuery {string} countryCode Code of the selected country.
 * 
 * @apiSuccess {object[]} destinations List of cached cities/provinces codes.
 * @apiSuccess {string} destinations.code City/Province code.
 * @apiSuccess {string} destinations.name City/Province name.
 * @apiSuccess (Success 204) {undefined} res No content.
 */
export async function destinations(req, res) {
  const url =
      `/transfer-cache-api/1.0/locations/destinations` +
      `?fields=ALL` +
      `&language=${LANGUAGE}` +
      `&countryCodes=${req.query.countryCode}`;

  const destinations = await signedFetch(url);

  if (!destinations) {
    return res.status(204).send();
  };

  res.json(destinations);
};

/**
 * @api {get} /api/hotelbeds/cache/hotels Get cached hotels information.
 * @apiName hotels
 * @apiGroup Hotelbeds
 * 
 * @apiQuery {number} currentPage Current hotel page.
 * @apiQuery {string} countryCode Code of the selected country.
 * @apiQuery {string} destinationCode Code of the selected city/province.
 * 
 * @apiSuccess {object[]} hotels List of hotels based on the current page.
 * @apiSuccess (Success 204) {undefined} res No content.
 */
export async function hotels(req, res) {
  const offset = ((req.query.currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const url =
      `/transfer-cache-api/1.0/hotels` +
      `?fields=code,name` +
      `&language=${LANGUAGE}` +
      `&countryCodes=${req.query.countryCode}` +
      `&destinationCodes=${req.query.destinationCode}` +
      `&offset=${offset}` +
      `&limit=${ITEMS_PER_PAGE}`;

  const hotels = await signedFetch(url);

  if (!hotels) {
    return res.status(204).send();
  };

  res.json(hotels);
};

/**
 * @api {post} /api/auth/login User log in.
 * @apiName login
 * @apiGroup Auth
 * 
 * @apiBody {email} email User email.
 * @apiBody {password} password User password.
 * 
 * @apiSuccess {string} firstname User firstname.
 * @apiSuccess {string} lastname User lastname.
 * @apiSuccess {string} email User email.
 * @apiSuccess {number} phone User phone.
 * 
 * @apiError (Error 400) {string} InvalidLogin Invalid email or password.
 */
export async function login(req, res) {
  res.set("Content-Type", "text/plain");

  const {email, password} = req.body;

  const user = await User.findOne({where: {email: email}});

  if (!user || !user.authenticate(password)) {
    return res.status(400).send(msg[400].invalidLogin);
  };

  req.secret = process.env.COOKIE_SECRET;

  res.cookie(process.env.COOKIE_NAME, user.createSessionId(), {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "strict",
    secure: "auto",
    signed: true
  });

  res.json(user.getAccountInfo());
};

/**
 * @api {post} /api/hotelbeds/search Search available transfers.
 * @apiName search
 * @apiGroup Hotelbeds
 * 
 * @apiBody {string} hotel Hotel code.
 * @apiBody {string} terminal Terminal code.
 * @apiBody {string} outbound Outbound date.
 * @apiBody {number} adults Number of adult passengers.
 * @apiBody {number} children Number of child passengers.
 * @apiBody {number} infants Number of infant passengers.
 * @apiBody {boolean} isFromTerminalToHotel If the transfer will go from the
 * terminal to the hotel, or vice versa.
 * 
 * @apiSuccess {object[]} transfers List of available transfers.
 * @apiSuccess (Success 204) {undefined} res No content.
 * 
 * @apiError (Error 400) {string} BadRequest Invalid data.
 */
export async function search(req, res) {
  res.set("Content-Type", "text/plain");

  const {
    hotel, terminal, outbound, adults, children, infants, isFromTerminalToHotel
  } = req.body;
  const from = isFromTerminalToHotel ? "IATA" : "ATLAS";
  const to = from === "IATA" ? "ATLAS" : "IATA";

  const url =
      `/transfer-api/1.0/availability/${LANGUAGE}` +
      `/from/${from}/${from === "IATA" ? terminal : hotel}` +
      `/to/${to}/${to === "ATLAS" ? hotel : terminal}` +
      `/${outbound}` +
      `/${adults}/${children}/${infants}`;

  const availability = await signedFetch(url);

  if (!availability) {
    return res.status(204).send();
  } else if (availability.isBadRequest) {
    return res.status(400).send(availability.fieldErrors[0].message);
  };

  res.json(availability.services);
};

/**
 * @api {post} /api/auth/signup Sign up user.
 * @apiName signup
 * @apiGroup Auth
 * 
 * @apiBody {string} firstname User firstname.
 * @apiBody {string} lastname User lastname.
 * @apiBody {string} email User email.
 * @apiBody {number} phone User phone.
 * @apiBody {string} password User password.
 * 
 * @apiSuccess (Success 201) {string} SuccessfulRegistered Successful
 * registered message.
 * 
 * @apiError (Error 400) {string} UserAlreadyExists User already exists.
 * @apiError (Error 400) {string} ValidationError Invalid data.
 */
export async function signup(req, res) {
  res.set("Content-Type", "text/plain");

  try {
    const [, created] = await User.findOrCreate({
      where: {email: req.body.email},
      defaults: req.body
    });

    if (!created) {
      return res.status(400).send(msg[400].userAlreadyExists);
    } else {
      return res.status(201).send(msg[201].successfulRegistered);
    };
  } catch (error) {
    console.error("ERROR", error);

    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send(msg[400].invalidData);
    };
  };
};

/**
 * @api {get} /api/auth/status Get user login status.
 * @apiName status
 * @apiGroup Auth
 * 
 * @apiSuccess {boolean} isLogged User login status.
 * @apiSuccess {object} user User account information.
 * @apiSuccess {string} user.firstname User firstname.
 * @apiSuccess {string} user.lastname User lastname.
 * @apiSuccess {string} user.email User email.
 * @apiSuccess {number} user.phone User phone.
 * @apiSuccess (Success 204) {undefined} res No content.
 */
export function status(req, res) {
  /*
   * This function is intended to provide a response that mirrors the state
   * structure of the client context, specifically the UserContext used in the
   * React application.
   */
  res.set("Content-Type", "text/plain");

  if (!req.user) {
    return res.status(204).send();
  };

  res.json({
    isLogged: true,
    user: req.user.getAccountInfo()
  });
};

/**
 * @api {get} /api/hotelbeds/cache/terminals Get cached terminals information.
 * @apiName terminals
 * @apiGroup Hotelbeds
 * 
 * @apiQuery {string} countryCode Code of the selected country.
 * 
 * @apiSuccess {object[]} terminals List of terminals based on selected country.
 * @apiSuccess (Success 204) {undefined} res No content.
 */
export async function terminals(req, res) {
  const url = 
    `/transfer-cache-api/1.0/locations/terminals` +
    `?fields=code,content` +
    `&language=${LANGUAGE}` +
    `&countryCodes=${req.query.countryCode}`;

  const terminals = await signedFetch(url);

  if (!terminals) {
    res.status(204).send();
    return;
  };

  res.json(terminals);
};

/**
 * @api {get} /api/hotelbeds/cache/transferTypes Get cached transfer types.
 * @apiName transferTypes
 * @apiGroup Hotelbeds
 * 
 * @apiSuccess {object[]} transferTypes List of transfer types.
 * @apiSuccess {string} transferTypes.code Transfer type code.
 * @apiSuccess {string} transferTypes.name Transfer type name.
 * @apiSuccess {string} transferTypes.description Transfer type description.
 * 
 * @apiError (Error 500) {string} CantReadResource The resource could not be
 * read.
 */
export function transferTypes(req, res) {
  const pathToFile = path.join(__dirname, "cache/transferTypes.json");

  try {
    const transferTypes = parseJSONFile(pathToFile);

    res.json(transferTypes);
  } catch (error) {
    console.error("Error reading file: ", error);

    res.status(500).send(msg[500].cantReadResource);
  };
};

/**
 * @api {get} /api/hotelbeds/cache/vehicleTypes Get cached vehicle types.
 * @apiName vehicleTypes
 * @apiGroup Hotelbeds
 * 
 * @apiSuccess {object[]} vehicleTypes List of transfer vehicle types.
 * @apiSuccess {string} vehicleTypes.masterTransferTypeCode Transfer type code.
 * @apiSuccess {string} vehicleTypes.masterCategoryCode Transfer category code.
 * @apiSuccess {string} vehicleTypes.masterVehicleCode Transfer vehicle code.
 * @apiSuccess {string} vehicleTypes.name Transfer vehicle name.
 * @apiSuccess {string} vehicleTypes.description Transfer vehicle description.
 * 
 * @apiError (Error 500) {string} CantReadResource The resource could not be
 * read.
 */
export function vehicleTypes(req, res) {
  const pathToFile = path.join(__dirname, "cache/vehicleTypes.json");

  try {
    const file = parseJSONFile(pathToFile);

    const uniqueNames = new Set();

    file.forEach((vehicleType) => uniqueNames.add(vehicleType.name));

    const vehicleTypes = [];

    uniqueNames.forEach((name) => vehicleTypes.push({name: name}));

    res.json(vehicleTypes);
  } catch (error) {
    console.error("Error reading file: ", error);

    res.status(500).send(msg[500].cantReadResource);
  };
};