import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { deletePanel, updatePanel } from "../features/solarPanelSlice";
import { SolarPanel } from "../SolarPanel";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const PanelDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const panelData: SolarPanel = location.state?.panelData;
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!panelData) {
      toast.error("No panel data provided.");
      navigate(-1);
    }
  }, [panelData, navigate]);

  const errorMessage = useAppSelector((state) => state.solarPanel.error);

  const [formData, setFormData] = useState<SolarPanel>(panelData);

  useEffect(() => {
    document.title = "Solar Panel Details";
    if (errorMessage !== null) console.log(errorMessage);
  }, [errorMessage]);


  const handleDelete = () => {
    dispatch(deletePanel(panelData._id!))
    toast.info("Panel deleted");
    navigate(-1)
  };

  return (
    <div className="solar-panel-section container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{formData.name || "Solar Panel Details"}</h2>
        <div className="d-flex align-items-center gap-2">
          {!formData.owner &&
            <button className="btn btn-pay-now"
              onClick={() => setEditModalOpen(true)}
              title="Edit panel">
              <span role="img" aria-label="edit">✏️</span> Edit
            </button>
          }
          {formData.owner && (
            <span className="badge bg-info text-dark">Owned by {formData.owner}</span>
          )}
        </div>
      </div>

      {/* Section: Panel Overview */}
      <div className="card mb-3">
        <h4 className="mb-2">Panel Overview</h4>
        <ul className="list-unstyled" style={{ textAlign: 'left', marginLeft: '35px' }}>
          <li>
            <strong>Panel Name:</strong> <em>{formData.name || "--"}</em>
          </li>
          <li>
            <strong>Reference Code:</strong> <em>{formData.reference || "--"}</em>
          </li>
          <li>
            <strong>Installation Year:</strong> <em>{formData.installationYear ?? "--"}</em>
          </li>
        </ul>
      </div>

      {/* Section: Location */}
      <div className="card mb-3">
        <h4 className="mb-2">Location & State</h4>
        <ul className="list-unstyled" style={{ textAlign: 'left', marginLeft: '35px' }}>
          <li>
            <strong>Location:</strong> <em>{formData.location || "--"}</em>
          </li>
          <li>
            <strong>State/Description:</strong> <em>{formData.state || "--"}</em>
          </li>
        </ul>
      </div>

      {/* Section: Financials */}
      <div className="card mb-3">
        <h4 className="mb-2">Financial Details</h4>
        <ul className="list-unstyled" style={{ textAlign: 'left', marginLeft: '35px' }}>
          <li>
            <strong>Price (€):</strong> <em>{typeof formData.price === "object" ? (formData.price?.$numberDecimal ?? "--") : (formData.price ?? "--")}</em>
          </li>
          <li>
            <strong>Payment Frequency:</strong> <em>{formData.paymentFreq || "--"}</em>
          </li>
        </ul>
      </div>

      {/* Section: Production */}
      <div className="card mb-3">
        <h4 className="mb-2">Production Estimate</h4>
        <ul className="list-unstyled" style={{ textAlign: 'left', marginLeft: '35px' }}>
          <li>
            <strong>Estimated Production (kWh):</strong> <em>{formData.stimatedProduction ?? "--"}</em>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-end gap-3">
        {!formData.owner &&
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        }
        <button type="button" className="btn btn-back" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {editModalOpen && (
        <ModalEditPanel
          panel={formData}
          onSave={async (updated) => {
            const updatedPanel: SolarPanel = { ...formData, ...updated } as SolarPanel;
            setFormData(updatedPanel);
            try {
              await dispatch(updatePanel(updatedPanel)).unwrap();
              toast.success("Panel updated successfully!");
            } catch (e) {
              toast.error("Failed to update panel");
            } finally {
              setEditModalOpen(false);
            }
          }}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
};

interface ModalEditPanelProps {
  panel: SolarPanel;
  onSave: (updated: Partial<SolarPanel>) => void;
  onClose: () => void;
}

const ModalEditPanel: React.FC<ModalEditPanelProps> = ({ panel, onSave, onClose }) => {
  const [form, setForm] = useState({
    _id: panel._id,
    name: panel.name || "",
    reference: panel.reference || "",
    installationYear: panel.installationYear || undefined,
    location: panel.location || "",
    state: panel.state || "",
    price: typeof panel.price === "object" ? (panel.price?.$numberDecimal ?? "") : (panel.price ?? ""),
    stimatedProduction: panel.stimatedProduction ?? undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      _id: (form as any)._id,
      name: (form as any).name,
      reference: (form as any).reference,
      installationYear: (form as any).installationYear ? Number((form as any).installationYear) : undefined,
      location: (form as any).location,
      state: (form as any).state,
      price: (form as any).price === "" ? undefined : Number((form as any).price),
      stimatedProduction: (form as any).stimatedProduction === undefined || (form as any).stimatedProduction === null || (form as any).stimatedProduction === ""
        ? undefined
        : Number((form as any).stimatedProduction),
    });
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div className="card p-4" style={{ minWidth: 400, position: "relative" }}>
        <button onClick={onClose} className="btn-close position-absolute" style={{ top: 12, right: 12 }}></button>
        <h4>Edit Panel</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">Name</label>
            <input name="name" className="form-control" value={(form as any).name} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label className="form-label">Reference</label>
            <input name="reference" className="form-control" value={(form as any).reference} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label className="form-label">Installation Year</label>
            <input name="installationYear" type="number" className="form-control" value={(form as any).installationYear ?? ""} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Location</label>
            <input name="location" className="form-control" value={(form as any).location} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">State</label>
            <input name="state" className="form-control" value={(form as any).state} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Price (€)</label>
            <input name="price" type="number" min="0" step="any" className="form-control" value={(form as any).price as any} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Estimated Production (kWh)</label>
            <input name="stimatedProduction" type="number" min="0" className="form-control" value={(form as any).stimatedProduction ?? ""} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-pay-now mt-2 w-100">Save</button>
        </form>
      </div>
    </div>
  );
};

export default PanelDetails;
