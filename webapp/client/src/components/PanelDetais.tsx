import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { deletePanel, newPanel, updatePanel } from "../features/solarPanelSlice";
import { SolarPanel } from "../SolarPanel";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PanelDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const panelData: SolarPanel = location.state?.panelData;

  useEffect(() => {
    if (!panelData) {
      toast.error("No panel data provided.");
      navigate(-1);
    }
  }, [panelData, navigate]);

  const panels = useAppSelector((state) => state.solarPanel.panels);
  const errorMessage = useAppSelector((state) => state.solarPanel.error);

  const [formData, setFormData] = useState<SolarPanel>(panelData);
  const [originalFormData] = useState<SolarPanel>(panelData);
  const [hasChanged, setHasChanged] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; reference?: string }>({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionMessages, setTransactionMessages] = useState<{ createCompanyBond?: string; mintBond?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHasChanged(JSON.stringify(formData) !== JSON.stringify(originalFormData));
  }, [formData, originalFormData]);

  useEffect(() => {
    document.title = "Solar Panel Details";
    if (errorMessage !== null) console.log(errorMessage);
  }, [errorMessage]);

  const validateUniqueness = (field: "name" | "reference", value: string) => {
    const normalizedValue = value.trim().toLowerCase();
    return !panels?.some((panel) => panel[field]?.trim().toLowerCase() === normalizedValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "name" || name === "reference") {
      const isUnique = validateUniqueness(name as "name" | "reference", value);
      if (!isUnique) {
        setErrors((prev) => ({ ...prev, [name]: `${name === "name" ? "Name" : "Reference"} already exists.` }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);
      const response = await dispatch(updatePanel(formData)).unwrap();
      toast.success("Panel updated successfully!");
      setTransactionMessages(response.trx || {});
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(`Failed to update panel. Please try again.\n ${error}`);
    } finally {
      setShowPopup(false);
      setLoading(false);
    }
  };

  const handleDelete = () => {
    // Implementar lógica de borrado aquí
    setShowPopup(true)
    toast.info("Delete logic goes here.");
  };

  const handleConfirmDelete = () => {
    dispatch(deletePanel(panelData._id!))
    setShowPopup(false)
    navigate(-1)
  };

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="solar-panel-section mt-3">
        <form className="container mt-4" style={{ textAlign: "left" }} onSubmit={handleSubmit}>
          <h2 className="text-center">Solar Panel Details</h2>

          {formData.owner && (
            <div className="alert alert-info text-center" role="alert">
              <strong>Owner:</strong> {formData.owner}
            </div>
          )}

          <div className="container-md row m-3">
            <h3>Panel Information</h3>
            <div className="row">
              <div className="col-8 mb-3">
                <label htmlFor="name" className="form-label">Panel Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control bg-form"
                  placeholder="E.g., Solar Panel 2024"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  readOnly={!!formData.owner}
                />
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
              </div>

              <div className="col-4 mb-3">
                <label htmlFor="reference" className="form-label">Reference Code:</label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  className="form-control bg-form"
                  placeholder="E.g., PV-24"
                  value={formData.reference}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  readOnly={!!formData.owner}
                />
                {errors.reference && <div className="invalid-feedback d-block">{errors.reference}</div>}
              </div>

              <div className="col-4 mb-3">
                <label htmlFor="installationYear" className="form-label">Installation Year:</label>
                <input
                  type="number"
                  id="installationYear"
                  name="installationYear"
                  className="form-control bg-form"
                  placeholder="E.g., 2024"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.installationYear || ''}
                  onChange={handleChange}
                  readOnly={!!formData.owner}
                />
              </div>
            </div>
          </div>

          <div className="container-md row m-3">
            <h3>Location & State</h3>
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="location" className="form-label">Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control bg-form"
                  placeholder="E.g., Bilbao"
                  value={formData.location}
                  onChange={handleChange}
                  readOnly={!!formData.owner}
                />
              </div>

              <div className="col-sm-6 mb-3">
                <label htmlFor="state" className="form-label">State/Description:</label>
                <input
                  type="text"
                  name="state"
                  className="form-control bg-form"
                  id="state"
                  placeholder="State of the panel or installation details"
                  value={formData.state}
                  onChange={handleChange}
                  readOnly={!!formData.owner}
                />
              </div>
            </div>
          </div>

          <div className="container-md row m-3">
            <h3>Financial Details</h3>
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="price" className="form-label">Price (€):</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="form-control bg-form"
                  placeholder="E.g., 1000€"
                  value={formData.price}
                  onChange={handleChange}
                  readOnly={!!formData.owner}
                />
              </div>

              <div className="col-sm-6 mb-3">
                <label htmlFor="paymentFreq" className="form-label">Payment Frequency:</label>
                <select
                  id="paymentFreq"
                  name="paymentFreq"
                  className="form-control bg-form"
                  value={formData.paymentFreq}
                  onChange={handleChange}
                  disabled
                >
                  <option value="Annualy" disabled>Annually</option>
                </select>
              </div>
            </div>
          </div>

          <div className="container-md row m-3">
            <h3>Production Estimate</h3>
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="stimatedProduction" className="form-label">Estimated Production (kWh):</label>
                <input
                  type="number"
                  id="stimatedProduction"
                  name="stimatedProduction"
                  className="form-control bg-form"
                  placeholder="E.g., 7 kWh"
                  value={formData.stimatedProduction || ''}
                  onChange={handleChange}
                  readOnly={!!formData.owner}
                />
              </div>
            </div>
          </div>

          <ToastContainer />
          <div className="container-md row m-3" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            {!formData.owner && (
              <>
                <button type="button" className="btn btn-danger col-sm-3" onClick={handleDelete}>
                  Delete
                </button>
                <button type="button" className="btn btn-primary col-sm-3" disabled={!hasChanged} onClick={handleConfirmSubmit}>
                  Edit
                </button>
              </>
            )}
            <button type="button" className="btn btn-secondary col-sm-2" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </form>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup text-center">

              <h4 className="fst-italic">Delete panel</h4>
              
              <p>Are you sure yo want to delete it?</p>

              <div className="popup-actions mt-5">
                <button className="btn btn-pay-now" onClick={handleConfirmDelete}>
                    Yes
                </button>
                <button className="btn btn-back" onClick={() => setShowPopup(false)}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelDetails;
