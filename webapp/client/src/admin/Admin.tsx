import { useEffect, useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { Form, Button } from 'react-bootstrap';
import { faucetStable } from "../features/userSlice";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    document.title = "Admin - Solar Panels";
  }, [dispatch]);

  const handleFaucet = async () => {
    console.log("doFaucet");
    const response = await dispatch(faucetStable({ address: address, amount: amount }));
    if (response.payload) {
      console.log("Faucet exitoso");
    } else {
      console.log("Faucet fallido");
    }
  }


  return (
    <div className="p-4" style={{ maxWidth: '100%' }}>

      <div className="col-12 col-md-6 position-absolute top-0 end-0 p-3">
        <Button className="btn btn-back" onClick={() => navigate("/")}>Log out</Button>
      </div>
      <h1 className="mb-4 p-4" style={{ color: 'var(--color-green-main)' }}>Admin Dashboard</h1>

      <div className="container-md d-flex flex-column align-items-center mb-4">
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/form")}>TOKENIZED SOLAR PANEL CREATION</button>
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/manage-bonds")}>MANAGE PANELS</button>
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/management-menu")}>WALLET</button>
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/payment-management")}>PAYMENT MANAGEMENT</button>
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/transactions")}>TRANXACTIONS DETAILS</button>
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/user-list")}>REGISTERED INVESTORS</button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg)', padding: '20px', marginBottom: '24px' }}>
        <h5 className="mb-3">Faucet</h5>
        <div className="row">
          <div className="col-12 col-md-6 mb-3">
            <Form className="d-flex gap-2">
              <Form.Control type="text" placeholder="Wallet Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Form.Control type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              <Button className="btn-pay-now" onClick={handleFaucet}>Faucet</Button>
            </Form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Admin;