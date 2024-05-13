import {useContext, useEffect, useState} from "react";
import {Link, Outlet} from "react-router-dom";
import {UserContext} from "../../context/UserContext.jsx";

export default function Account() {
  const [bookings, setBookings] = useState([]);

  const {userStatus} = useContext(UserContext);

  if (!userStatus.isLogged) {
    return (<Outlet />);
  };

  useEffect(() => {
    fetch("/api/user/bookings")
      .then((response) => response.json())
      .then((bookings) => setBookings(bookings));
  }, []);

  const Booking = ({booking}) => {
    const day = booking.transfers[0].pickupInformation.date;
    const from = booking.transfers[0].pickupInformation.from.description;
    const hour = booking.transfers[0].pickupInformation.time;
    const reference = booking.reference;
    const status = booking.status;
    const to = booking.transfers[0].pickupInformation.to.description;

    const handleClick = () => {
      const confirmDelete = window.confirm(
        "¿Seguro que deseas cancelar esta reserva?"
      );

      if (confirmDelete) {
        fetch(`/api/user/bookings?reference=${reference}`, {method: "DELETE"})
          .then(async (response) => {
            if (response.status !== 200) throw new Error(await response.text());

            setBookings(bookings.filter((booking) => (
              booking.reference !== reference
            )));
          })
          .catch((error) => alert(error.message));
      };
    };

    return (
      <>
        <p>Estado: {status}</p>
        <p>El {day} a las {hour}</p>
        <p>Desde {from} hasta {to}</p>
        <input type="button" value="Cancelar" onClick={handleClick} />
      </>
    );
  };

  return (
    <>
      <Link to={"/"}>Inicio</Link>
      <h2>Cuenta</h2>
      <h3>{userStatus.name}</h3>
      <h2>Mis reservas</h2>
      {bookings.map((booking) => (
        <Booking key={`booking-${booking.reference}`} booking={booking} />
      ))}
    </>
  );
};