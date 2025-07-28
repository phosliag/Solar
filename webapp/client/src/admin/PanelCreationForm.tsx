import React, { useEffect, useState } from "react";
import { SolarPanel } from "../SolarPanel";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import { newPanel } from "../features/solarPanelSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PanelCreationForm = () => {
  // const dispatch = useAppDispatch();
  const errorMessage = useAppSelector((state) => state.solarPanel.error);
  const navigate = useNavigate();

  const panels = useAppSelector((state) => state.solarPanel.panels);
  const [errors, setErrors] = useState<{ name?: string; reference?: string }>({});

  // Define the state to manage form inputs
  const [formData, setFormData] = useState<SolarPanel>({
    _id: undefined,
    name: "",
    location: "",
    reference: "",
    price: 0,
    state: "",
    owner: "",
    stimatedProduction: undefined,
    paymentFreq: "Annualy",
    installationYear: undefined, // Añadido campo año de instalación
  });

  const [showPopup, setShowPopup] = useState(false); // State to toggle popup visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [transactionMessages, setTransactionMessages] = useState<{ createCompanyBond?: string; mintBond?: string }>({}); // State for transaction messages
  const [loading, setLoading] = useState(false); // State for loading indicator
  const dispatch = useAppDispatch();

  const handleConfirmSubmit = async () => {
    try {
      setLoading(true); // Set loading to true when starting the process
      console.log("Form data submitted:", formData);
      //TODO: cambiar el newBond por el newSolarPanel
      const response = await dispatch(newPanel(formData)).unwrap(); // Dispatch the data and capture the response
      toast.success("Panel created successfully!");
      setLoading(false); // Reset loading state
      setTransactionMessages(response.trx || {}); // Set transaction messages from the response
      setShowSuccessModal(true); // Show success modal
    } catch (error) {
      toast.error(`Failed to create panel. Please try again.\n ${error}`);
    } finally {
      setShowPopup(false); // Close the popup
      // navigate('/')
    }
  };

  const handleSaveBond = async () => {
    try {
      console.log("Form data submitted:", formData);
      await dispatch(newPanel(formData)).unwrap(); // Dispatch the data
      toast.success("Draft created successfully!");
    } catch (error) {
      toast.error(`Failed to save draft.\n Erorr: ${error}`);
    }
  };

  const validateUniqueness = (field: "name" | "reference", value: string) => {
    const normalizedValue = value.trim().toLowerCase();
    return !panels?.some((panel) => panel[field]?.trim().toLowerCase() === normalizedValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "name" || name === "reference") {
      const isUnique = validateUniqueness(name, value);

      if (!isUnique) {
        setErrors((prev) => ({
          ...prev,
          [name]: `${name === "name" ? "Name" : "Reference"} already exists.`,
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  useEffect(() => {
    document.title = "Register Panel";
    if (errorMessage !== null) {
      console.log(errorMessage);
    } else {
      // navigate("/dashboard", {state:{email}})
    }
  }, [errorMessage]);

  // Handle input changes and update the state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; // Extract name and value from the event
    //setFormData({ ...formData, [name]: value }); // Update state dynamically
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "bondMaturityDate" || name === "bondStartDate" || name === "redemptionFinishDate"
          ? new Date(value) // Convierte cadena a Date
          : name === "walletAddress"
            ? value // No convertir walletAddress
            : value
              ? value
              : value, // Convierte a número si es posible
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log("Form data submitted:", formData); // Log the form data
    setShowPopup(true); // Show the confirmation popup on form submission
    // await dispatch(newBond(formData))
    // navigate("/confirm", { state: { formData } });
  };

  return (
    <div className="container-fluid mt-3 d-flex justify-content-center align-items-center">
      <div className="solar-panel-section mt-3">
        <form className="container mt-4" style={{ textAlign: "left" }} onSubmit={handleSubmit}>
          <h2 style={{ textAlign: "center" }}>Solar Panel Creation</h2>

          {/* Section 1.1: Basic Panel Information */}
          <div className="container-md row m-3">
            <h3>Panel Information</h3>
            <div className="row">
              <div className="col-8 mb-3">
                <label htmlFor="name" className="form-label">
                  Panel Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control bg-form"
                  placeholder="E.g., Solar Panel 2024"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>{errors.name && <div className="invalid-feedback">{errors.name}</div>}
              <div className="col-4 mb-3">
                <label htmlFor="reference" className="form-label">
                  Reference Code:
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  className="form-control bg-form"
                  placeholder="E.g., PV-24"
                  value={formData.reference}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>{errors.reference && <div className="invalid-feedback">{errors.reference}</div>}
              {/* Año de instalación */}
              <div className="col-4 mb-3">
                <label htmlFor="installationYear" className="form-label">
                  Installation Year:
                </label>
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
                />
              </div>
            </div>
          </div>

          {/* Section 1.2: Location & State */}
          <div className="container-md row m-3">
            <h3>Location & State</h3>
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="location" className="form-label">
                  Location:
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control bg-form"
                  placeholder="E.g., Bilbao"
                  value={formData.location}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="state" className="form-label">
                  State/Description:
                </label>
                <input
                  type="text"
                  name="state"
                  className="form-control bg-form"
                  id="state"
                  placeholder="State of the panel or installation details"
                  value={formData.state}
                  onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 1.3: Financial Details */}
          <div className="container-md row m-3">
            <h3>Financial Details</h3>
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="price" className="form-label">
                  Price (€):
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="form-control bg-form"
                  placeholder="E.g., 1000€"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-6 mb-3">
                <label htmlFor="paymentFreq" className="form-label">
                  Payment Frequency:
                </label>
                <select
                  id="paymentFreq"
                  name="paymentFreq"
                  className="form-control bg-form"
                  value={formData.paymentFreq}
                  onChange={handleChange}
                  disabled>
                  <option value="Annualy" disabled>Annually</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1.4: Production Estimate */}
          <div className="container-md row m-3">
            <h3>Production Estimate</h3>
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="stimatedProduction" className="form-label">
                  Estimated Production (kWh):
                </label>
                <input
                  type="number"
                  id="stimatedProduction"
                  name="stimatedProduction"
                  className="form-control bg-form"
                  placeholder="E.g., 7 kWh"
                  value={formData.stimatedProduction}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <ToastContainer />
          {/* Action Buttons */}
          <div className="container-md row m-3" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <button type="submit" className="btn btn-pay-now col-sm-3">
              Confirm
            </button>
            <button
              type="button"
              className="btn btn-back col-sm-2"
              onClick={() => navigate("/admin-dash")}
            >
              Cancel
            </button>
          </div>
        </form>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">

              <h4 className="fst-italic text-secondary">Final Summary</h4>

              <h5 className="fw-bold fst-italic mt-4" style={{ textAlign: 'left' }}>Panel Details:</h5>
              <ul>
                <li>
                  <strong>Panel Name:</strong> <em>{formData.name}</em>
                </li>
                <li>
                  <strong>State:</strong> <em>{formData.state}</em>
                </li>
              </ul>

              <h5 className="fw-bold fst-italic mt-4 text-left" style={{ textAlign: 'left' }}>Key Dates:</h5>
              <ul>
                <li>
                  <strong>Location:</strong>{" "}
                  <em>
                    {formData.location}
                  </em>
                </li>
                <li>
                  <strong>Owner:</strong>{" "}
                  <em>
                    {formData.owner}
                  </em>
                </li>
              </ul>

              <h5 className="fw-bold fst-italic mt-4 text-left" style={{ textAlign: 'left' }}>Financial Terms:</h5>
              <ul>
                <li>
                  <strong>Price:</strong> <em>{formData.price}</em>
                </li>
                <li>
                  <strong>Coupon Payment Frequency:</strong> <em>{formData.paymentFreq}</em>
                </li>
              </ul>

              <h5 className="fw-bold fst-italic mt-4 text-left" style={{ textAlign: 'left' }}>Production Details:</h5>
              <ul>
                <li>
                  <strong>Estimated Production:</strong> <em>{formData.stimatedProduction?.toLocaleString()}</em>
                </li>
                <li>
                  <strong>Installation Year:</strong> <em>{formData.installationYear || '-'}</em>
                </li>
              </ul>

              <div className="popup-actions mt-5">
                <button className="btn btn-pay-now" onClick={handleConfirmSubmit} disabled={loading}>
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    "Create panel"
                  )}
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
              <h2 className="text-success mb-4" style={{ textAlign: "center" }}>
                Successful Panel Creation!
              </h2>
              <div className="purchase-details mb-4">
                <h4 className="text-primary mb-3">Panel Details:</h4>
                <ul className="list-unstyled">
                  <li className="mb-3">
                    <strong>Name:</strong> <em>{formData.name}</em>
                  </li>
                  <li className="mb-3">
                    <strong>Create Company Message:</strong> <em>{transactionMessages.createCompanyBond}</em>
                  </li>
                  <li className="mb-3">
                    <strong>Mint Message:</strong> <em>{transactionMessages.mintBond}</em>
                  </li>
                </ul>
              </div>
              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-pay-now" onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/admin-dash');
                }}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelCreationForm;
