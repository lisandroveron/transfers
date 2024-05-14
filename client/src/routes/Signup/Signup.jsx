import {useNavigate, Link} from "react-router-dom";
import UserInfoForm from "../../components/UserInfoForm/UserInfoForm.jsx";

export default function Signup() {
  const navigate = useNavigate();

  const handleResponse = async (response) => {
    const body = await response.text();

    if (response.status !== 201) throw new Error(body);
    
    alert(body);
    navigate("/account/login");
  };

  return (
    <>
      <Link to="/">Inicio</Link>
      <UserInfoForm
          url="/api/auth/signup"
          handleResponse={handleResponse}
          handleData={() => {}}
          buttonText="Registrarme" />
    </>
  );
};