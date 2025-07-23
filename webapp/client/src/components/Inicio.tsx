import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Trustchain Solar Panels";
  }, []);

  return (
    <>
      <div className="container mt-3 ">
        <div className="solar-panel-section mt-3 d-flex justify-content-center align-items-center" style={{ minWidth: "100vh" }}>
          <div className="position-absolute top-0 end-0 m-3">
            <button className="btn btn-pay-now me-2" onClick={() => navigate('/user-registration')}>Sign Up</button>
            <button className="btn btn-back" onClick={() => navigate('/user-access')}>Access</button>
          </div>
          <div className="d-flex flex-column align-items-center">
            <h1 className="m-5" >Trustchain Solar Panels</h1>
            <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/lux")}>
              CHECK LIGHT PRICE
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Inicio;
