import {useState} from "react";

export default function Signup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Remove extra spaces.
    setFirstname(firstname.trim().replace(/\s+/g, " "));
    setLastname(lastname.trim().replace(/\s+/g, " "));
    setEmail(email.trim().replace(/\s+/g, " "));
  };

  return (<>
    <form onSubmit={handleSubmit}>
      <label htmlFor="signup__firstname">Nombres</label>
      <input
          id="signup__firstname"
          type="text"
          value={firstname}
          pattern="[a-zA-ZáéíóúÁÉÍÓÚñ ]+"
          required
          onChange={(e) => setFirstname(e.target.value)} />
      <label htmlFor="signup__lastname">Apellidos</label>
      <input
          id="signup__lastname"
          type="text"
          value={lastname}
          pattern="[a-zA-ZáéíóúÁÉÍÓÚñ ]+"
          required
          onChange={(e) => setLastname(e.target.value)} />
      <label htmlFor="signup__email">Correo electrónico</label>
      <input
          id="signup__email"
          type="email"
          value={email}
          pattern="[a-zA-Z0-9.]+@(hotmail|outlook|gmail).com(.ar)?"
          required
          onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="signup__password">Contraseña</label>
      <input
          id="signup__password"
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)} />
      <button>Registrarme</button>
    </form>
  </>);
};