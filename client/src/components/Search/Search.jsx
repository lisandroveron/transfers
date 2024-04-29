import {useEffect, useState} from "react";

export default function Search() {
  const [searchParameters, setSearchParameters] = useState({
    countryCode: "ES",
    hotel: "",
    terminal: "",
    outbound: null,
    adults: 1,
    children: 0,
    infants: 0
  });
  const [selectOptions, setSelectOptions] = useState({
    countries: [],
    hotels: [],
    terminals: []
  });
  const [currentHotelPage, setCurrentHotelPage] = useState(1);
  const [isLastHotelPage, setIsLastHotelPage] = useState(false);
  const [isFromTerminalToHotel, setIsFromTerminalToHotel] = useState(true);

  const updateState = (setFunction, options) => {
    setFunction((prevState) => ({
      ...prevState,
      ...options
    }));
  };

  useEffect(() => {
    fetch("/api/hotelbeds/cache/countries")
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());

        return await response.json();
      })
      .then((countries) => {
        updateState(setSelectOptions, {countries: countries});
      })
      .catch((error) => console.error("Error:", error.message));
  }, []);

  useEffect(() => {
    fetch(
        `/api/hotelbeds/cache/hotels` +
        `?countryCode=${searchParameters.countryCode}` +
        `&currentPage=${currentHotelPage}`
    )
      .then(async (response) => {
        if (response.status < 200 || response.status > 299) {
          throw new Error(response.statusText);
        } else if (response.status === 204) {
          setIsLastHotelPage(true);
        };

        return await response.json();
      })
      .then((hotels) => updateState(setSelectOptions, {hotels: hotels}))
      .catch((error) => console.error("Error:", error.message));
  }, [currentHotelPage, searchParameters.countryCode]);

  useEffect(() => {
    fetch(
        `/api/hotelbeds/cache/terminals` +
        `?countryCode=${searchParameters.countryCode}`
    )
      .then(async (response) => {
        if (response.status !== 200) throw new Error(response.statusText);

        return await response.json();
      })
      .then((terminals) => {
        updateState(setSelectOptions, {terminals: terminals});
      })
      .catch((error) => console.error("Error:", error.message));
  }, [searchParameters.countryCode]);

  const Hotel = () => {
    return (
      <>
        <label htmlFor="hotel">Hotel:</label>
        <select
            id="hotel"
            value={searchParameters.hotel}
            required
            onChange={(e) => {
              switch (e.target.value) {
                case "prev":
                  setCurrentHotelPage((prevState) => prevState - 1); break;
                case "next":
                  setCurrentHotelPage((prevState) => prevState + 1); break;
                default:
                  updateState(setSearchParameters, {hotel: e.target.value});
                  break;
              };
            }}>
          {selectOptions.hotels.map((hotel) => (
            <option key={`hotel-${hotel.code}`} value={hotel.code}>
              {hotel.name}
            </option>
          ))}
          <option value="prev" disabled={currentHotelPage === 1}>
            Anterior
          </option>
          <option value="next" disabled={isLastHotelPage}>
            Siguiente
          </option>
        </select>
      </>
    );
  };

  const Swap = () => {
    const handleClick = () => {
      setIsFromTerminalToHotel((prevState) => !prevState);
    };

    return (
      <>
        <input type="button" value="Cambiar" onClick={handleClick} />
      </>
    );
  };

  const Terminal = () => {
    return (
      <>
        <label htmlFor="terminal">Terminal:</label>
        <select
            id="terminal"
            value={searchParameters.terminal}
            required
            onChange={(e) => {
              updateState(setSearchParameters, {terminal: e.target.value});
            }}>
          {selectOptions.terminals.map((terminal) => (
            <option key={`terminal-${terminal.code}`} value={terminal.code}>
              {terminal.content.description}
            </option>
          ))}
        </select>
      </>
    );
  };

  return (
    <>
      <form>
        <label htmlFor="countryCode">País:</label>
        <select
            id="countryCode"
            value={searchParameters.countryCode}
            required
            onChange={(e) => {
              updateState(setSearchParameters, {countryCode: e.target.value});
            }}>
          {selectOptions.countries.map((country) => (
            <option key={`country-${country.code}`} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        {isFromTerminalToHotel
          ? <><Terminal /> <Swap /> <Hotel /></>
          : <><Hotel /> <Swap /> <Terminal /></>
        }

        <label htmlFor="outbound">Ida:</label>
        <input
            id="outbound"
            type="datetime-local"
            value={searchParameters.outbound}
            required
            onChange={(e) => {
              updateState(setSearchParameters, {
                outbound: e.target.value + ":00"
              });
            }} />

        <label htmlFor="adults">Adultos:</label>
        <input
            id="adults"
            type="number"
            min="1"
            value={searchParameters.adults}
            required
            onChange={(e) => {
              updateState(setSearchParameters, {adults: e.target.value});
            }} />
        <label htmlFor="children">Niños:</label>
        <input
            id="children"
            type="number"
            min="0"
            value={searchParameters.children}
            required
            onChange={(e) => {
              updateState(setSearchParameters, {children: e.target.value});
            }} />
        <label htmlFor="infants">Infantes:</label>
        <input
            id="infants"
            type="number"
            min="0"
            value={searchParameters.infants}
            required
            onChange={(e) => {
              updateState(setSearchParameters, {infants: e.target.value});
            }} />
      </form>
    </>
  );
};