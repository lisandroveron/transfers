import {useState} from "react";

export default function UserInfoForm({
  url, method = "POST", handleResponse, handleData, required = true, buttonText
}) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setFirstname(firstname.trim().replace(/\s+/g, " "));
    setLastname(lastname.trim().replace(/\s+/g, " "));
    setEmail(email.trim().replace(/\s+/g, " "));
    setPassword(password.trim());

    fetch(url, {
      method: method,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: phone,
        password: password
      })
    })
      .then(handleResponse)
      .then(handleData)
      .catch((error) => alert(error));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="userinfoform__firstname">Nombres</label>
        <input
            id="userinfoform__firstname"
            type="text"
            pattern="[a-zA-ZáéíóúÁÉÍÓÚñ ]+"
            minLength="2"
            maxLength="64"
            value={firstname}
            required={required}
            onChange={(e) => setFirstname(e.target.value)} />
        <label htmlFor="userinfoform__lastname">Apellidos</label>
        <input
            id="userinfoform__lastname"
            type="text"
            pattern="[a-zA-ZáéíóúÁÉÍÓÚñ ]+"
            minLength="2"
            maxLength="64"
            value={lastname}
            required={required}
            onChange={(e) => setLastname(e.target.value)} />
        <label htmlFor="userinfoform__email">Correo electrónico</label>
        <input
            id="userinfoform__email"
            type="email"
            pattern="[a-zA-Z0-9.]+@(hotmail|outlook|live|gmail).com(.ar)?"
            minLength="10"
            maxLength="64"
            value={email}
            required={required}
            onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="userinfoform__phone">Teléfono</label>
        <input
            id="userinfoform__phone"
            type="tel"
            pattern="\d+"
            value={phone}
            onChange={(e) => setPhone(e.target.value)} />
        <label htmlFor="userinfoform__password">Contraseña</label>
        <input
            id="userinfoform__password"
            type="password"
            minLength="8"
            maxLength="255"
            value={password}
            required={required}
            onChange={(e) => setPassword(e.target.value)} />
        <button>{buttonText}</button>
      </form>
    </>
  );
};