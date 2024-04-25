import {useContext, useEffect} from "react";
import {UserContext} from "../../context/UserContext.jsx";

export default function GetStatus({setIsLoading}) {
  const {changeUserStatus} = useContext(UserContext);

  useEffect(() => {
    fetch("/api/auth/status")
      .then(async (response) => {
        return response.status === 200 ? await response.json() : {};
      })
      .then((status) => {
        changeUserStatus(status);
        setIsLoading(false);
      });
  }, []);
};