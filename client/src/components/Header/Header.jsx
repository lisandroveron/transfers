import {useContext} from "react";
import {Link} from "react-router-dom";

import {UserContext} from "../../context/UserContext.jsx";

import "./Header.css";

export default function Header() {
  const {isLogged} = useContext(UserContext).userStatus;

  return (
    <header>
      <nav>
        <ul><Link to={"/"}><h1>Transfers</h1></Link></ul>
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