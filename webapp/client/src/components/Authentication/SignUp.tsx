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

  const signUp = useGoogleLogin({
    onSuccess: (credentialRes) => {
      console.log(credentialRes);
      const decodedInfo: GoogleJwtPayload = jwtDecode(credentialRes.access_token || "");
      console.log(decodedInfo);

      const investor: Investor = {
        name: decodedInfo.given_name,
        surname: decodedInfo.family_name,
        email: decodedInfo.email,
        idCard: '',
        country: '',
        walletAddress: '',
        accounts: [],
        _id: undefined,
      };

      dispatch(registerInvestor(investor));
    },
    onError: () => console.log("failed"),
  });

  // const handleGoogleLoginSuccess = (credentialRes: any) => {
  //   console.log(credentialRes);
  //   const decodedInfo: GoogleJwtPayload = jwtDecode(credentialRes.credential || "");
  //   console.log(decodedInfo);

  //   const investor: Investor = {
  //     name: decodedInfo.given_name,
  //     surname: decodedInfo.family_name,
  //     email: decodedInfo.email,
  //     idCard: '',
  //     country: '',
  //     walletAddress: '',
  //     accounts: [],
  //     _id: undefined,
  //   };

  //   dispatch(registerInvestor(investor));
  // };

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="solar-panel-section mt-3">
        <h2 className="mb-4" style={{ textAlign: "center", color: "var(--color-green-main)" }}>SIGN UP</h2>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          {/* <button className="btn"
            onClick={() => signUp()}
            style={{
              padding: "10px 25px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img
              src="/images/Google_Favicon_2025.svg"
              alt="Google"
              style={{ width: "20px", height: "20px" }}
            />
            Sign in with Google
          </button> */}
          <GoogleLogin
            onSuccess={
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
