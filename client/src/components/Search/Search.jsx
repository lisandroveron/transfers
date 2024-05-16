import React, {useContext, useEffect, useState} from "react";
import {UserContext} from "../../context/UserContext.jsx";

export default function Search() {
  const [searchParameters, setSearchParameters] = useState({
    countryCode: "ES",
    destinationCode: "BCN",
    hotel: "",
    terminal: "",
    outbound: new Date().toISOString(),
    adults: 1,
    children: 0,
    infants: 0
  });
  const [selectOptions, setSelectOptions] = useState({
    countries: [],
    destinations: [],
    hotels: [],
    terminals: []
  });
  const [transfers, setTransfers] = useState([]);
  const [currentHotelPage, setCurrentHotelPage] = useState(1);
  const [isLastHotelPage, setIsLastHotelPage] = useState(false);
  const [isFromTerminalToHotel, setIsFromTerminalToHotel] = useState(true);

  const {isLogged} = useContext(UserContext).userStatus;

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
          case "destinations":
            updateState(setSelectOptions, {destinations: data});
            updateState(setSearchParameters, {
              destinationCode: data[0].code
            });
            break;
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

    fetch("/api/hotelbeds/search", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        ...searchParameters,
        isFromTerminalToHotel: isFromTerminalToHotel
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
        `/api/hotelbeds/cache/destinations` +
        `?countryCode=${searchParameters.countryCode}`;

    fetchOption(url, "destinations");
  }, [searchParameters.countryCode]);

  useEffect(() => {
    const url =
        `/api/hotelbeds/cache/hotels` +
        `?countryCode=${searchParameters.countryCode}` +
        `&destinationCode=${searchParameters.destinationCode}` +
        `&currentPage=${currentHotelPage}`;

    fetchOption(url, "hotels");
  }, [
    currentHotelPage,
    searchParameters.countryCode,
    searchParameters.destinationCode
  ]);

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
    const [isBooked, setIsBooked] = useState(false);

    const category = {...transfer.content.category};
    const price = {...transfer.price};
    const details = transfer.content.transferDetailInfo;
    const vehicle = {...transfer.content.vehicle};
    const type = () => {
      const terminal = selectOptions.terminals.find((terminal) => (
        terminal.code === searchParameters.terminal
      ));

      return terminal.content.type;
    };
    const vehicleType = () => {
      switch (transfer.transferType) {
        case "SHARED": return "compartido";
        case "PRIVATE": return "privado";
        case "SHUTTLE": return "shuttle";
      };
    };

    const handleClick = () => {
      fetch("/api/hotelbeds/booking/confirmation", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          ...transfer,
          type: type()
        })
      })
        .then((response) => {
          response.ok || response.status === 409 ? setIsBooked(true) : null;
        });
    };

    return (
      <>
        <p>{vehicle.name} {vehicleType()} de categoría {category.name}</p>
        <p>{price.totalAmount + " " + price.currencyId}</p>
        {details.map((detail) => (
          <React.Fragment key={detail.id}>
            <p>{detail.description}.</p>
          </React.Fragment>
        ))}
        {!isLogged
          ? <p>Debes iniciar sesión para hacer reservas.</p>
          : <input
              type="button"
              value={!isBooked ? "Reservar" : "Reservado"}
              onClick={!isBooked ? handleClick : null} />
        }
      </>
    );
  };

  const Results = () => {
    if (!transfers.length) {
      return <p>No hay resultados.</p>;
    };

    const [filters, setFilters] = useState({
      vehicleType: "",
      transferType: "",
      category: "",
      minPrice: 0,
      maxPrice: 0
    });
    const [filteredTransfers, setFilteredTransfers] = useState(transfers);
    const [selectOptions, setSelectOptions] = useState({
      vehicleTypes: [],
      transferTypes: [],
      categories: []
    });

    const handleFilterChange = (e) => {
      let {id, value} = e.target;

      setFilters((prevState) => {
        const newState = {...prevState};

        const isFloat = /\d+(\.{1})?\d*/;

        value = isFloat.test(value) ? parseFloat(value) : value;

        newState[id] = value;

        return newState;
      });
    };

    useEffect(() => {
      fetch("/api/hotelbeds/cache/vehicleTypes")
        .then(async (response) => {
          if (!response.ok) throw new Error(await response.text());

          return await response.json();
        })
        .then((vehicleTypes) => setSelectOptions((prevState) => ({
          ...prevState,
          vehicleTypes: vehicleTypes
        })))
        .catch((error) => alert(error));

      fetch("/api/hotelbeds/cache/transferTypes")
        .then(async (response) => {
          if (!response.ok) throw new Error(await response.text());

          return await response.json();
        })
        .then((transferTypes) => setSelectOptions((prevState) => ({
          ...prevState,
          transferTypes: transferTypes
        })))
        .catch((error) => alert(error));

      fetch("/api/hotelbeds/cache/categories")
        .then(async (response) => {
          if (!response.ok) throw new Error(await response.text());

          return await response.json();
        })
        .then((categories) => setSelectOptions((prevState) => ({
          ...prevState,
          categories: categories
        })))
        .catch((error) => alert(error));
    }, []);

    useEffect(() => {
      setFilteredTransfers(transfers.filter((transfer) => {
        const transferType =
            !filters.transferType ||
            transfer.transferType === filters.transferType;

        const vehicleType =
            !filters.vehicleType ||
            transfer.vehicle.name === filters.vehicleType;

        const category =
            !filters.category ||
            transfer.category.name === filters.category;

        const priceRange = (
          !filters.minPrice ||
          transfer.price.totalAmount >= filters.minPrice
        ) && (
          !filters.maxPrice ||
          transfer.price.totalAmount <= filters.maxPrice
        );

        return transferType && vehicleType && category && priceRange;
      }));
    }, [filters]);

    return (
      <>
        <h2>Filtrar por:</h2>

        <label htmlFor="vehicleType">Tipo de vehículo:</label>
        <select
            id="vehicleType"
            value={filters.vehicleType}
            onChange={handleFilterChange}>
          <option value=""></option>
          {selectOptions.vehicleTypes.map((vehicleType) => (
            <option
                key={`vehicleType-${vehicleType.name}`}
                value={vehicleType.name}>
              {vehicleType.name}
            </option>
          ))
          }
        </select>

        <label htmlFor="transferType">Tipo de servicio:</label>
        <select
            id="transferType"
            value={filters.transferType}
            onChange={handleFilterChange}>
          <option value=""></option>
          {selectOptions.transferTypes.map((transferType) => (
            <option
                key={`transferType-${transferType.code}`}
                value={transferType.code}>
              {transferType.name}
            </option>
          ))
          }
        </select>

        <label htmlFor="category">Categoría:</label>
        <select
            id="category"
            value={filters.category}
            onChange={handleFilterChange}>
          <option value=""></option>
          {selectOptions.categories.map((category) => (
            <option
                key={`category-${category.name}`}
                value={category.name}>
              {category.name}
            </option>
          ))
          }
        </select>

        <label htmlFor="minPrice">Precio mínimo:</label>
        <input
            id="minPrice"
            type="number"
            step="0.01"
            value={filters.minPrice}
            onChange={handleFilterChange} />

        <label htmlFor="maxPrice">Precio máximo:</label>
        <input
            id="maxPrice"
            type="number"
            step="0.01"
            value={filters.maxPrice}
            onChange={handleFilterChange} />

        {filteredTransfers.map((transfer) => (
          <Transfer key={transfer.id} transfer={transfer} />
        ))
        }
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
        <label htmlFor="destinations">Ciudad/Provincia:</label>
        <select
            id="destinations"
            value={searchParameters.destinationCode}
            required
            onChange={(e) => {
              updateState(setSearchParameters, {destinationCode: e.target.value})
            }}>
          {selectOptions.destinations.map((destination) => (
            <option
                key={`destination-${destination.name}`}
                value={destination.code}>
              {destination.name}
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

      <Results />
    </>
  );
};