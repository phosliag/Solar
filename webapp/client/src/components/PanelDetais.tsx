import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { deletePanel, updatePanel } from "../features/solarPanelSlice";
import { SolarPanel } from "../SolarPanel";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "react-toastify/dist/ReactToastify.css";
import { ProductionRecord } from "../admin/PaymentManagement";


const PanelDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const panelData: SolarPanel = location.state?.panelData;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [energySeries, setEnergySeries] = useState<{ data: { date: string; total: number }[]; avg: number | null }>({ data: [], avg: null });

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
  const getCsvUrlForYear = (year: string) => `/mockPlacas/produccion_placas_luz_${year}.csv`;

  // Función para cargar y parsear el CSV
  const fetchAndParseCsv = (url: string): Promise<ProductionRecord[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(results.errors);
          } else {
            const rows = (results.data as any[]).map((r) => ({
              Fecha: String(r["Fecha"]),
              Produccion_Monocristalina_kWh: Number(r["Produccion_Monocristalina_kWh"]) || 0,
              Precio_Luz_Euro_kWh: r["Precio_Luz_Euro_kWh"] !== undefined ? Number(r["Precio_Luz_Euro_kWh"]) : 0,
            }));
            resolve(rows);
          }
        },
        error: (error) => reject(error),
      });
    });
  };

  useEffect(() => {
    // Carga los datos de producción de kWh del csv para mock de datos
    const run = async () => {
      try {
        const inferredYear = (panelData.installationYear ?? Number(String(panelData.name).slice(0, 4))) || new Date().getFullYear();
        const url = getCsvUrlForYear(String(inferredYear));
        const records = await fetchAndParseCsv(url);
        setEnergySeries(buildLast30(records));
      } catch (e) {
        console.error("Error cargando producción:", e);
        setEnergySeries({ data: [], avg: null });
      }
    };
    if (panelData) run();
  }, [panelData]);



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

      {/* Section: Real Production (last 30 days) */}
      <div className="card mb-3">
        <div className="d-flex align-items-center w-100">
          <h4 className="mb-0">Real Production (last 30 days)</h4>
          <button className="btn btn-pay-now ms-auto" onClick={() => setShowChart((v) => !v)}>
            {showChart ? 'Hide chart' : 'Show chart'}
          </button>
        </div>
        {showChart && (
          <div className="mt-3 w-100">
            {energySeries.avg !== null && energySeries.data.length > 0 ? (
              <>
                <div className="mb-2 w-100"><strong>Daily average:</strong> <em>{energySeries.avg.toFixed(2)} kWh</em></div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={energySeries.data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value} kWh`} />
                      <Bar dataKey="total" fill="#82ca9d" name="Producción diaria (kWh)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div>No hay datos de producción disponibles.</div>
            )}
          </div>
        )}
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

// Funcion para construir los datos de los últimos 30 días para la grafica
function buildLast30(records: ProductionRecord[]): { data: { date: string; total: number }[]; avg: number | null } {
  const monthDayToKwh: Record<string, number> = {};
  for (const r of records) {
    if (!r.Fecha) continue;
    const d = new Date(r.Fecha);
    if (isNaN(d.getTime())) continue;
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    monthDayToKwh[key] = Number(r.Produccion_Monocristalina_kWh) || 0;
  }
  const today = new Date();
  const series: { date: string; total: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const val = monthDayToKwh[key] ?? 0;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    series.push({ date: iso, total: val });
  }
  const avg = series.length > 0 ? series.reduce((s, p) => s + p.total, 0) / series.length : null;
  return { data: series, avg };
}

export default PanelDetails;
