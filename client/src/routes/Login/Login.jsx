import {useContext, useState} from "react";
import {useNavigate, Link, Navigate} from "react-router-dom";
// Context
import {UserContext} from "../../context/UserContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {userStatus, changeUserStatus} = useContext(UserContext);

  const navigate = useNavigate();

  const handleOnSubmit = (e) => {
    e.preventDefault();

    fetch("/api/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
      .then(async (response) => {
        return {
          authenticated: response.ok,
          body: response.ok ? await response.json() : await response.text()
        };
      })
      .then(({authenticated, body}) => {
        if (authenticated) {
          changeUserStatus({
            isLogged: true,
            name: body.name
          });
          navigate("/account");
        } else {
          alert(body);
        };
      });
  };

  return (
    <>
      {userStatus.isLogged ? <Navigate to="/account" /> : null}
      <Link to={"/"}>Inicio</Link>
      <form onSubmit={handleOnSubmit}>
        <label htmlFor="login__email">Correo electrónico</label>
        <input
            id="login__email"
            type="text"
            pattern="[a-zA-Z0-9.]+@(hotmail|outlook|live|gmail).com(.ar)?"
            minLength="10"
            maxLength="64"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="login__password">Contraseña</label>
        <input
            id="login__password"
            type="password"
            minLength="8"
            maxLength="255"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)} />
        <button>Iniciar sesión</button>
      </form>
      <p>¿Aún no te has registrado?</p>
      <Link to="/account/signup">Crear cuenta.</Link>
    </>
  );
};