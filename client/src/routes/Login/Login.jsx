import {useState} from "react";
import {Link} from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleOnSubmit = e => {
    e.preventDefault();

    fetch("/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
  };

  return (
    <>
      <Link to={"/"}>Inicio</Link>
      <form onSubmit={handleOnSubmit}>
        <label htmlFor="">Usuario</label>
        <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}/>
        <label htmlFor="">Contraseña</label>
        <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)} />
        <button>Iniciar sesión</button>
      </form>
    </>
  );
};