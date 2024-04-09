import {useContext, useEffect} from "react";
import {UserContext} from "../../context/UserContext.jsx";

export default function GetStatus() {
  const {changeUserStatus} = useContext(UserContext);

  useEffect(() => {
    fetch("/api/auth/status", {
      method: "POST"
    })
      .then(async response => {
        return {
          authenticated: response.ok,
          status: response.ok ? await response.json() : null
        };
      })
      .then(({authenticated, status}) => {
        if (authenticated) {
          changeUserStatus(status);
        };
      });
  }, []);
};