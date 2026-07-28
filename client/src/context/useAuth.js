import { useContext } from "react";
import AuthContext from "./authContext.js";

const useAuth = () => useContext(AuthContext);

export default useAuth;
