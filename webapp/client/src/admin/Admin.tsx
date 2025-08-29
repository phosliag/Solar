import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import { Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin - Solar Panels";
  }, [dispatch]);

  return (
    <div className="p-4" style={{ maxWidth: '100%' }}>

      <div className="d-flex justify-content-end w-100 position-absolute top-0 end-0 p-3" style={{ zIndex: 10 }}>
        <Button className="btn btn-back" onClick={() => navigate("/")}>Log out</Button>
      </div>

      <div className="solar-panel-section">
        <h1 className="mb-4 p-4" style={{ color: 'var(--color-green-main)', textAlign: 'center' }}>Admin Dashboard</h1>

        <div className="container-md d-flex flex-column align-items-center mb-4">
          <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/form")}>TOKENIZED SOLAR PANEL CREATION</button>
          <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/manage-bonds")}>MANAGE PANELS</button>
          <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/management-menu")}>WALLET</button>
          <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/payment-management")}>PAYMENT MANAGEMENT</button>
          <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/transactions")}>TRANSACTIONS DETAILS</button>
          <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/user-list")}>REGISTERED INVESTORS</button>
        </div>

      </div>
    </div>
  );
};

export default Admin;