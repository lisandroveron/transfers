import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";

export default function Signup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Remove extra spaces.
    setFirstname(firstname.trim().replace(/\s+/g, " "));
    setLastname(lastname.trim().replace(/\s+/g, " "));
    setEmail(email.trim().replace(/\s+/g, " "));
    setPassword(password.trim());

    fetch("/api/auth/signup", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password
      })
    })
      .then(async response => {
        return {
          authenticated: response.ok,
          msg: await response.text()
        };
      })
      .then(({authenticated, msg}) => {
        if (authenticated) {
          alert(msg);
          navigate("/account/login");
        };
      });
  };

  return (<>
    <Link to="/">Inicio</Link>
    <form onSubmit={handleSubmit}>
      <label htmlFor="signup__firstname">Nombres</label>
      <input
          id="signup__firstname"
          type="text"
          pattern="[a-zA-ZáéíóúÁÉÍÓÚñ ]+"
          minLength="2"
          maxLength="64"
          value={firstname}
          required
          onChange={(e) => setFirstname(e.target.value)} />
      <label htmlFor="signup__lastname">Apellidos</label>
      <input
          id="signup__lastname"
          type="text"
          pattern="[a-zA-ZáéíóúÁÉÍÓÚñ ]+"
          minLength="2"
          maxLength="64"
          value={lastname}
          required
          onChange={(e) => setLastname(e.target.value)} />
      <label htmlFor="signup__email">Correo electrónico</label>
      <input
          id="signup__email"
          type="email"
          pattern="[a-zA-Z0-9.]+@(hotmail|outlook|live|gmail).com(.ar)?"
          minLength="10"
          maxLength="64"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="signup__password">Contraseña</label>
      <input
          id="signup__password"
          type="password"
          minLength="8"
          maxLength="255"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)} />
      <button>Registrarme</button>
    </form>
  </>);
};