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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
        <label htmlFor="login__password">Contraseña</label>
        <input
            id="login__password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
        <button>Iniciar sesión</button>
      </form>
      <p>¿Aún no te has registrado?</p>
      <Link to="/account/signup">Crear cuenta.</Link>
    </>
  );
};