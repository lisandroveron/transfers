import {useEffect, useState} from "react";

export default function Search() {
  const [searchParameters, setSearchParameters] = useState({
    countryCode: "ES",
    hotel: null,
    terminal: null,
    outbound: null,
    adults: null,
    children: null,
    infants: null
  });
  const [selectOptions, setSelectOptions] = useState({
    countries: [],
    hotels: [],
    terminals: []
  });
  const [currentHotelPage, setCurrentHotelPage] = useState(1);

  useEffect(() => {
    fetch("/api/hotelbeds/cache/countries")
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());

        return await response.json();
      })
      .then((countries) => {
        setSelectOptions((prevState) => ({
          ...prevState,
          countries: countries
        }));
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
        if (response.status !== 200) throw new Error(response.statusText);

        return await response.json();
      })
      .then((hotels) => {
        setSelectOptions((prevState) => ({
          ...prevState,
          hotels: hotels
        }));
      })
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
        setSelectOptions((prevState) => ({
          ...prevState,
          terminals: terminals
        }));
      })
      .catch((error) => console.error("Error:", error.message));
  }, [searchParameters.countryCode]);

  return (
    <>
    </>
  );
};