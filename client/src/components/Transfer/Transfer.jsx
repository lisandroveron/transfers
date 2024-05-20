import {useState} from "react";

import "./Transfer.css";

export default function Transfer({
  transfer, booked = false, handleCancellationClick = undefined
}) {
  const [isBooked, setIsBooked] = useState(booked);
  const {
    cancellationPolicies: [{amount: cancellationAmount}],
    category: {name: vehicleCategory},
    pickupInformation: {date, time},
    price: {totalAmount: price, currencyId: currency},
    transferType,
    vehicle: {name: vehicleName}
  } = transfer;
  const image = transfer.content.images.find((image) => (
    image.type === "EXTRALARGE"
  )).url;
  const vehicleType = (() => {
    switch (transferType) {
      case "PRIVATE": return "Privado";
      case "SHARED": return "Compartido";
      case "SHUTTLE": return "Autobús";
    };
  })();

  const handleConfirmationClick = () => {
    const confirmBooking = window.confirm(
      "¿Reservar este transfer?"
    );

    if (confirmBooking) {
      fetch("/api/user/bookings", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(transfer)
      })
        .then((response) => {
          if (response.ok || response.status === 409) setIsBooked(true);
        });
    };
  };

  return (
    <div className="transfer">
      <img src={image} alt="Foto del vehículo." />

      <div className="transfer__details">
        <p>{vehicleName} {vehicleType} {vehicleCategory}</p>

        {transfer.content.transferDetailInfo.map((detail) => (
          <p key={detail.id}>{detail.description}</p>
        ))
        }

        {!isBooked
          ? <>
            <p>
              <a
                  className="confirmation"
                  onClick={handleConfirmationClick}>Reserva </a>
              por {price} {currency}
            </p>
          </>
          : <>
            <p>Reservado para el {date} a las {time}.</p>
            <p>
              <a
                  className="cancellation"
                  onClick={handleCancellationClick}>Cancelar </a>
              por {cancellationAmount} {currency}
            </p>
          </>
        }
      </div>
    </div>
  );
};