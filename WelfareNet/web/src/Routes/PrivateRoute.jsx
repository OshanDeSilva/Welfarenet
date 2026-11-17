import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from '../config';
import { jwtDecode } from "jwt-decode";


export default function PrivateRoute({ children,role }) {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    const validateToken = ()=>{
        if(!token){
            console.log("No token found!");
            return false;
        }

        const decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);
        const isExpired = decodedToken.exp * 1000 < Date.now();

        if(!isExpired){
            return true;
        }

        return false;
       
    }

    useEffect(()=>{
        if(!token || userRole !== role){
            localStorage.clear();
            navigate("/");
        }
        const checkToken = async ()=>{
            const isValid = validateToken();
            if(!isValid){
                localStorage.clear();
                navigate("/");
            }
        }
        checkToken();
    },[role,userRole,token]);

    return children;
}