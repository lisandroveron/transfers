import {useState, createContext} from "react";

export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [isLogged, setIsLogged] = useState(false);

  const changeIsLogged = () => setIsLogged((prevData) => !prevData);

  return (
    <UserContext.Provider value={{isLogged, changeIsLogged}}>
      {children}
    </UserContext.Provider>
  );
};