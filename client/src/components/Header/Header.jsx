import {useContext} from "react";
import {Link} from "react-router-dom";
// Context
import {UserContext} from "../../context/UserContext.jsx";

export default function Header() {
  const {userStatus} = useContext(UserContext);

  return (
    <header>
      <h1>Transfers</h1>
      {userStatus.isLogged
        ? <Link to={"/account"}>Mi cuenta</Link>
        : <Link to={"/account/login"}>Iniciar sesión</Link>
      }
    </header>
  );
};