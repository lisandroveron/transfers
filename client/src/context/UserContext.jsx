import {useState, createContext} from "react";

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [userStatus, setUserStatus] = useState({
    isLogged: false,
    name: ""
  });

  const changeUserStatus = (newStatus) => setUserStatus((prevData) => ({
    ...prevData,
    ...newStatus
  }));

  return (
    <UserContext.Provider value={{userStatus, changeUserStatus}}>
      {children}
    </UserContext.Provider>
  );
};