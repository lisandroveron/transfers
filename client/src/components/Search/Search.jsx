import React, {useEffect, useState} from "react";

export default function Search() {
  const [searchParameters, setSearchParameters] = useState({
    countryCode: "ES",
    hotel: "",
    terminal: "",
    outbound: new Date().toISOString(),
    adults: 1,
    children: 0,
    infants: 0
  });
  const [selectOptions, setSelectOptions] = useState({
    countries: [],
    hotels: [],
    terminals: []
  });
  const [transfers, setTransfers] = useState([]);
  const [currentHotelPage, setCurrentHotelPage] = useState(1);
  const [isLastHotelPage, setIsLastHotelPage] = useState(false);
  const [isFromTerminalToHotel, setIsFromTerminalToHotel] = useState(true);

  const fetchOption = (url, option) => {
    fetch(url)
      .then(async (response) => {
        if(!response.ok) {
          throw new Error(response.statusText + await response.text());
        };

        if (response.status === 204) {
          setIsLastHotelPage(true);
          throw new Error(response.statusText);
        };

        setIsLastHotelPage(false);
        return await response.json();
      })
      .then((data) => {
        switch (option) {
          case "countries":
            updateState(setSelectOptions, {countries: data}); break;
          case "hotels":
            updateState(setSelectOptions, {hotels: data});
            updateState(setSearchParameters, {hotel: data[0].code});
            break;
          case "terminals":
            updateState(setSelectOptions, {terminals: data});
            updateState(setSearchParameters, {terminal: data[0].code});
            break;
          default: break;
        };
      })
      .catch((error) => console.error(error.message));
  };

  const updateState = (setFunction, options) => {
    setFunction((prevState) => ({
      ...prevState,
      ...options
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("/api/search", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        ...searchParameters,
        from: isFromTerminalToHotel ? "IATA" : "ATLAS"
      })
    })
      .then(async (response) => {
        if (response.status === 204) return [];
        if (response.status !== 200) throw new Error(await response.text());

        return await response.json();
      })
      .then((transfers) => setTransfers(transfers))
      .catch((error) => {
        setTransfers([]);
        alert(error.message);
      });
  };

  useEffect(() => {
    fetchOption("/api/hotelbeds/cache/countries", "countries");
  }, []);

  useEffect(() => {
    const url =
        `/api/hotelbeds/cache/hotels` +
        `?countryCode=${searchParameters.countryCode}` +
        `&currentPage=${currentHotelPage}`;

    fetchOption(url, "hotels");
  }, [currentHotelPage, searchParameters.countryCode]);

  useEffect(() => {
    const url =
        `/api/hotelbeds/cache/terminals` +
        `?countryCode=${searchParameters.countryCode}`;

    fetchOption(url, "terminals");
  }, [searchParameters.countryCode]);

  const Hotel = () => {
    const handleChange = (e) => {
      switch (e.target.value) {
        case "prev":
          setCurrentHotelPage((prevState) => prevState - 1); break;
        case "next":
          setCurrentHotelPage((prevState) => prevState + 1); break;
        default:
          updateState(setSearchParameters, {hotel: e.target.value});
          break;
      };
    };

    return (
      <>
        <label htmlFor="hotel">Hotel:</label>
        <select
            id="hotel"
            value={searchParameters.hotel}
            required
            onChange={handleChange}>
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

  const Transfer = ({transfer}) => {
    const vehicle = {...transfer.content.vehicle};
    const category = {...transfer.content.category};
    const price = {...transfer.price};
    const details = transfer.content.transferDetailInfo;
    const type = () => {
      const terminal = selectOptions.terminals.find((terminal) => {
        terminal.code === searchParameters.terminal;
      });

      return terminal.content.type;
    };

    // To Do. Function for booking the selected transfer.
    const handleClick = () => {};

    return (
      <>
        <p>{vehicle.name} de categoría {category.name}</p>
        <p>{price.totalAmount + " " + price.currencyId}</p>
        {details.map((detail) => (
          <React.Fragment key={detail.id}>
            <p>{detail.description}.</p>
          </React.Fragment>
        ))}
        <input
            type="button"
            value="Reservar"
            onClick={handleClick} />
      </>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
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

        <button>Buscar</button>
      </form>

      <h2>Resultados:</h2>
      {transfers.length
        ? transfers.map((transfer) => (
          <Transfer key={transfer.id} transfer={transfer} />
        ))
        : <p>Sin resultados.</p>
      }
    </>
  );
};