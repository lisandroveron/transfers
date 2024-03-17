import {useRouteError} from "react-router-dom";

export default function Error() {
  const error = useRouteError();
  console.error(error);

  return (
    <>
      <h1>Ups!</h1>
      <p>Ocurrió un error inesperado</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </>
  );
};