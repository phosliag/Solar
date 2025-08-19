import React, { FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { registerPurchase } from "../features/solarPanelSlice";
import { useNavigate } from "react-router-dom";
import { readInvestors } from "../features/userSlice";
import InvestorRegistration from "../components/Authentication/InvestorRegistration";
import { readPanels } from "../features/solarPanelSlice";

export interface PurchaseData {
  _id?: undefined
  userId: string;
  panelId: string;
}

const BuyToken = () => {
  const errorMessage = useAppSelector((state) => state.solarPanel.error);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const registeredPanels = useAppSelector((state) => state.solarPanel.panels);
  const retailPanels = useAppSelector((state) => state.solarPanel.retailMarketPanels);
  const investors = useAppSelector((state) => state.user.investors);

  const [showPopupUser, setShowPopupUser] = useState(false); // State to toggle popup visibility
  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const [errorData, setErrorData] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    _id: undefined,
    userId: "",
    panelId: "",
  });
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success/error modal
  const [transactionDetails, setTransactionDetails] = useState<any>(null); // State for transaction details
  const [requestResult, setRequestResult] = useState<any>(null); // State for request result

  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPurchaseData((prevData) => ({
      ...prevData,
      [name]: name === "userId" ? investors.find(investor => investor.walletAddress === value)?._id : value,
    }));
  };

  useEffect(() => {
    document.title = "Register User";
    dispatch(readPanels());
    dispatch(readInvestors());
  }, [dispatch]);

  useEffect(() => {
    console.log(registeredPanels);
  }, [registeredPanels]);

  const handleUser = () => {
    for (const user of investors) {
      console.log('user._id', user._id);
      console.log('purchaseData.userId', purchaseData.userId);
      if (user._id!== purchaseData.userId) {
        setErrorData(true);
        console.log(errorData);
      } else {
        setErrorData(false);
      }
    }
  };

  const handleCloseUserPopup = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si el clic es en el overlay (fuera del popup), cierra el popup
    if (e.target === e.currentTarget) {
      setShowPopupUser(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorData(false);
    setShowPopup(true);
    console.log(purchaseData);
  };
  const handleConfirmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Activar el loader
    try {
      const result = await dispatch(registerPurchase(purchaseData));
      if (result.meta.requestStatus === 'fulfilled') {
        setRequestResult(result);
        setTransactionDetails(result.payload.transactions); // Guardar los detalles de la transacción
        setShowSuccessModal(true); // Mostrar el modal de éxito
      } else {
        setTransactionDetails(result.payload); // Guardar los detalles del error
        setShowSuccessModal(true); // Mostrar el modal de error
      }
    } catch (error) {
      setTransactionDetails(error); // Guardar el error
      setShowSuccessModal(true); // Mostrar el modal de error
    } finally {
      setIsLoading(false); // Desactivar el loader
      setShowPopup(false); // Cerrar el popup de confirmación
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/admin-dash");
  };

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="solar-panel-section mt-3">
        <form className="container row mt-4" style={{ textAlign: "left" }}>
          <h2 className="mb-4" style={{ textAlign: "center", color: "var(--color-green-main)" }}>
            ADD INVESTOR
          </h2>

          <div className="col-sm-6 mb-3">
            <label htmlFor="userId" className="form-label">
              User Wallet:
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              className="form-control bg-form"
              placeholder={`Wallet address`}
              onChange={handleData}
              onBlur={handleUser}
            />
          </div>
          {errorData && (
            <p className="text-danger" style={{ fontSize: "13px", marginLeft: "10px" }}>
              User wallet doesn't exists.
              <button type="button" className="btn-link" onClick={() => setShowPopupUser(true)}>Crear</button>
            </p>
          )}
          <div className="col-sm-6 mb-3">
            <label htmlFor="investToken" className="form-label">
              Token Selection:
            </label>
            <select
              id="investToken"
              name="investToken"
              className="form-control bg-form"
              value={purchaseData.panelId}
              onChange={handleData}>
              <option value="" disabled>
                Select token
              </option>
              {!errorMessage &&
                registeredPanels?.map((panel) => {
                  return (
                    <option key={panel._id} value={panel.name}>
                      {panel.name}
                    </option>
                  );
                })}
            </select>
          </div>
         
          <div className="container-md row m-3" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <button
              type="submit"
              className="btn btn-pay-now col-sm-4"
              style={{ alignItems: "right" }}
              onClick={handleSubmit}>
              Confirm
            </button>
            <button
              type="button"
              className="btn btn-back col-sm-2"
              onClick={() => navigate("/manage-bonds")}
            >
              Cancel
            </button>
          </div>
        </form>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2 className="mb-4" style={{ textAlign: "left", color: "var(--color-green-main)" }}>
                ADD INVESTOR
              </h2>

              <h5 className="section-title mt-4">
                <em>Final Summary</em>
              </h5>

              <ul style={{ listStyle: "none", padding: 0 }}>
                <li>
                  <strong>User:</strong> <em>{purchaseData?.userId}</em>
                </li>
                <li>
                  <strong>Token Sent Name:</strong> <em>{purchaseData?.panelId}</em>
                </li>
              </ul>

              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-pay-now" onClick={handleConfirmSubmit} disabled={isLoading}>
                  {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'CONFIRM'}
                </button>
                <button className="btn btn-back" onClick={() => setShowPopup(false)}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div className="popup-overlay">
            <div className="popup" style={{ width: '600px' }}>
              <h2 className="mb-4" style={{ textAlign: "center", color: "var(--color-green-main)" }}>
                {requestResult?.meta?.requestStatus === 'rejected' ? 'Purchase Error!' : 'Successful Purchase!'}
              </h2>
              <div className="purchase-details mb-4">
                {requestResult?.meta?.requestStatus === 'rejected' ? (
                  <div className="alert alert-danger" role="alert">
                    {JSON.stringify(transactionDetails, null, 2)}
                  </div>
                ) : (
                  <>
                    <h4 className="section-title mb-3">Transaction Details:</h4>
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong>Stable:</strong> 
                        <div className="text-break" style={{ wordBreak: 'break-all' }}>
                          {transactionDetails?.stable}
                        </div>
                      </li>
                      <li className="mb-3">
                        <strong>Transfer:</strong>
                        <div className="text-break" style={{ wordBreak: 'break-all' }}>
                          {transactionDetails?.transfer}
                        </div>
                      </li>
                    </ul>
                  </>
                )}
              </div>
              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-pay-now" onClick={handleCloseSuccessModal}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
        {showPopupUser && (
          <div className="popup-overlay" onClick={handleCloseUserPopup}>
            <div className="popup">
              <InvestorRegistration/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyToken;
