import {useContext, useEffect, useState} from "react";
import {Outlet} from "react-router-dom";
import {UserContext} from "../../context/UserContext.jsx";
import UserInfoForm from "../../components/UserInfoForm/UserInfoForm.jsx";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";

export default function Account() {
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const {userStatus, changeUserStatus} = useContext(UserContext);
  const {isLogged, user} = userStatus;

  if (!isLogged) {
    return (
      <>
        <Header />
        <div id="account">
          <Outlet />
        </div>
        <Footer />
      </>
    );
  };

  const handleResponse = async (response) => {
    if (!response.ok) throw new Error(await response.text());

    return await response.json();
  };

  const handleData = (newUserInfo) => {
    changeUserStatus({user: {...user, ...newUserInfo}});
    setIsEditing(false);
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

  const Info = () => {
    if (isEditing) {
      return (
        <>
          <UserInfoForm
              url="/api/user/account"
              method="PUT"
              handleResponse={handleResponse}
              handleData={handleData}
              required={false}
              buttonText="Confirmar" />
          <input
              type="button"
              value="Cancelar"
              onClick={() => setIsEditing(false)} />
        </>
      );
    };

    return (
      <>
        <h2>Cuenta</h2>
        <p>{user.firstname} {user.lastname}</p>
        <p>{user.email}</p>
        <p>{user.phone}</p>
        <input
            type="button"
            value="Editar"
            onClick={() => setIsEditing(true)} />
      </>
    );
  };

  return (
    <>
      <Header />
      <div id="account">
        <Info />
        <h2>Mis reservas</h2>
        {bookings.map((booking) => (
          <Booking
              key={`booking-${booking.reference}`}
              booking={booking}
              setBookings={setBookings} />
        ))
        }
      </div>
      <Footer />
    </>
  );
};
