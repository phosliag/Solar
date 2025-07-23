import { useEffect } from "react";
import InvestorRegistration from "./InvestorRegistration";

const SignUp = () => {

  useEffect(() => {
    document.title = "Register User";
  }, []);

  
  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="solar-panel-section mt-3">
        <h2 className="mb-4" style={{ textAlign: "center", color: "var(--color-green-main)" }}>SIGN UP</h2>
        <InvestorRegistration/>
      </div>
    </div>
  );
};

export default SignUp;
