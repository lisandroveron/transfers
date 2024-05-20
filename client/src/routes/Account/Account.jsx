import {useContext, useEffect, useState} from "react";
import {Outlet} from "react-router-dom";
import {UserContext} from "../../context/UserContext.jsx";

import UserInfoForm from "../../components/UserInfoForm/UserInfoForm.jsx";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Transfer from "../../components/Transfer/Transfer.jsx";

import "./Account.css";

export default function Account() {
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const {userStatus, changeUserStatus} = useContext(UserContext);
  const {isLogged, user} = userStatus;

  if (!isLogged) {
    return (
      <>
        <Header />
        <div className="account">
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
    const reference = booking.reference;

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
      <Transfer
          transfer={booking.transfers[0]}
          booked={true}
          handleCancellationClick={handleClick} />
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
      <div className="info">
        <p>{user.firstname} {user.lastname}</p>
        <p>{user.email}</p>
        <p>{user.phone}</p>
        <input
            type="button"
            value="Editar"
            onClick={() => setIsEditing(true)} />
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="account">
        <h2>Cuenta</h2>
        <Info />
        <h2>Mis reservas</h2>
        <div className="transferslist">
          {bookings.map((booking) => (
            <Booking
                key={`booking-${booking.reference}`}
                booking={booking}
                setBookings={setBookings} />
          ))
          }
        </div>
      </div>
      <Footer />
    </>
  );
};
