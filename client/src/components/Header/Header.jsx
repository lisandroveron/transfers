import {useContext} from "react";
import {Link} from "react-router-dom";
// Context
import {UserContext} from "../../context/UserContext.jsx";

export default function Header() {
  const {isLogged} = useContext(UserContext).userStatus;

  return (
    <header>
      <h1>Transfers</h1>
      <nav>
        <ul><Link to={"/"}>Inicio</Link></ul>
        <ul>
          {isLogged
            ? <Link to={"/account"}>Mi cuenta</Link>
            : <Link to={"/account/login"}>Iniciar sesión</Link>
          }
        </ul>
      </nav>
    </header>
  );
};