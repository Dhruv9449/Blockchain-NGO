import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

function Auth({ type }) {
  return type === "login" ? <Login /> : <Register />;
}

export default Auth;
