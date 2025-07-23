import React, { FormEvent, useEffect, useState } from "react";
import { addRetailMarketPanel, getRetailMarketPanels } from "../features/solarPanelSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import { readPanels } from "../features/solarPanelSlice";

export interface MarketData {
  _id?: string;
  reference: string;
  location: string;
  owner?: string;
}

const RetailMarket = () => {
  const errorMessage = useAppSelector((state) => state.solarPanel.error);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const registeredPanels = useAppSelector((state) => state.solarPanel.panels);
  const retailMarketPanels = useAppSelector((state) => state.solarPanel.retailMarketPanels);

  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const [created, setCreated] = useState(null);
  const [marketData, setMarketData] = useState<MarketData>({
    _id: undefined,
    reference: "",
    location: "",
    owner: "",
  });

  const handleData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "reference") {
      const selected = registeredPanels?.find(panel => panel.reference === value);
      setMarketData((prevData) => ({
        ...prevData,
        reference: value,
        location: selected?.location || "",
      }));
    } else {
      setMarketData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    document.title = "Add to retail market";
    dispatch(readPanels());
    dispatch(getRetailMarketPanels());
    if (errorMessage !== null && errorMessage !== undefined) {
      console.log(errorMessage);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (created) {
      navigate("/admin-dash");
    }
  }, [created]);

  // Get references of panels not already in the retail market
  const retailReferences = retailMarketPanels?.map((item: any) => item.reference) || [];
  const availablePanels = registeredPanels?.filter(panel => !retailReferences.includes(panel.reference));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handleConfirmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const market = await dispatch(addRetailMarketPanel({ reference: marketData.reference, location: marketData.location, owner: "" })).unwrap();
    setCreated(market);
  };

  const selectedPanel = registeredPanels?.find(panel => panel.reference === marketData.reference);

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="solar-panel-section mt-3">
        <form className="container row mt-4" style={{ textAlign: "left" }}>
          <h2 style={{ textAlign: "center" }}>ADD TO RETAIL MARKET</h2>

          <div className="col-sm-6 mb-3">
            <label htmlFor="reference" className="form-label">
              Token Selection:
            </label>
            <select
              id="reference"
              name="reference"
              className="form-control bg-form"
              value={marketData.reference}
              onChange={handleData}
            >
              <option value="" disabled>Select panel reference</option>
              {availablePanels?.map(panel => (
                <option key={panel._id} value={panel.reference}>{panel.reference}</option>
              ))}
            </select>
          </div>

          {marketData.reference && selectedPanel && (
            <div className="row">
              <div className="col-sm-6 mb-3 d-flex align-items-end">
                <div className="price-display p-3" style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  width: '100%'
                }}>
                  <span className="h4 mb-0 text-primary">
                    {selectedPanel.price?.toFixed(2)} €
                  </span>
                  <span className="text-muted ms-2">per token</span>
                </div>
              </div>
            </div>
          )}

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
              onClick={() => navigate("/manage-bonds")}>Cancel</button>
          </div>
        </form>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2 style={{ textAlign: "left" }}>ADD TO RETAIL MARKET</h2>

              <h5 className="mt-4"><em>Final Summary</em></h5>

              <ul style={{ listStyle: "none", padding: 0 }}>
                <li>
                  <strong>Reference:</strong> <em>{marketData.reference}</em>
                </li>
                {selectedPanel && (
                  <li>
                    <strong>Location:</strong> <em>{selectedPanel.location}</em>
                  </li>
                )}
                {selectedPanel && (
                  <li>
                    <strong>Price:</strong> <em>{selectedPanel.price?.toFixed(2)} €</em>
                  </li>
                )}
              </ul>

              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-pay-now" onClick={handleConfirmSubmit}>
                  CONFIRM
                </button>
                <button className="btn btn-back" onClick={() => setShowPopup(false)}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailMarket;
