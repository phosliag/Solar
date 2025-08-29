import { useEffect } from "react";
import InvestorRegistration, { Investor } from "./InvestorRegistration";
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode"
import { useAppDispatch } from "../../app/hooks";
import { registerInvestor } from "../../features/userSlice";
import { useNavigate } from "react-router-dom";

export interface GoogleJwtPayload {
  iss: string;
  nbf: number;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

const SignUp = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register User";
  }, []);

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="solar-panel-section mt-3">
        <h2 className="mb-4" style={{ textAlign: "center", color: "var(--color-green-main)" }}>SIGN UP</h2>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          {/* Boton para registrarse usando una cuenta de Google */}
          <GoogleLogin
            onSuccess={
              // Manejar el inicio de sesión exitoso, extrayendo la información del usuario para crear
              // un nuevo objeto Investor con los datos que devuelve el token
              (credentialRes) => {
                console.log(credentialRes)
                const decodedInfo: GoogleJwtPayload = jwtDecode(credentialRes.credential || '')
                console.log(decodedInfo)
                const investor: Investor = {
                  name: decodedInfo.given_name,
                  surname: decodedInfo.family_name,
                  email: decodedInfo.email,
                  idCard: '',
                  country: '',
                  walletAddress: '',
                  accounts: [],
                  _id: undefined,
                }
                dispatch(registerInvestor(investor))
                navigate("/investor-dash");
              }
            }
            // Manejar el error en caso de fallo
            onError={() => console.log('failed')}
            width={'100px'} theme="outline" size="large" shape="rectangular" text="signup_with" locale="en"/>

        </div>

        <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ccc" }} />
          <span style={{ margin: "0 10px", color: "#666" }}>or</span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ccc" }} />
        </div>

        <InvestorRegistration />


      </div>
    </div>
  );
};

export default SignUp;
