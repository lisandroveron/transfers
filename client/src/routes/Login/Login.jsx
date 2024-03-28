import {useState} from "react";
import {Link} from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOnSubmit = (e) => {
    e.preventDefault();

    fetch("/api/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
  };

  return (
    <>
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