import {Link} from "react-router-dom";

export default function Header() {
  return (
    <header>
      <h1>Transfers</h1>
      <Link to={"login"}>Iniciar sesión</Link>
    </header>
  );
};