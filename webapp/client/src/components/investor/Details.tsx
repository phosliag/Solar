import { useEffect, useState } from "react";
import { useMemo } from "react";
import { SolarPanel } from "../../SolarPanel";
import { Investor } from "../Authentication/InvestorRegistration";
import { PurchaseData } from "../../admin/BuyToken";
import { useLocation, useNavigate } from "react-router-dom";
import { registerPurchase } from "../../features/solarPanelSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toast, ToastContainer } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Papa from "papaparse";

const Details = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { solarPanel, user }: { solarPanel: SolarPanel; user: Investor } = location.state;

  // Redirigir si user es null
  useEffect(() => {
    if (!user) {
      navigate('/user-access');
    }
  }, [user, navigate]);

  const error = useAppSelector((state) => state.solarPanel.error);

  const [showPopup, setShowPopup] = useState(false);
  const [showChartPopup, setShowChartPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestResult, setRequestResult] = useState<any>(null);
  const [records, setRecords] = useState<Array<{ Fecha: string; Produccion_Monocristalina_kWh: number }>>([]);

  // Use the correct PurchaseData type
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    userId: user._id || '',
    panelId: solarPanel._id || '', // Envia el _id de la placa
  });

  useEffect(() => {
    document.title = `${solarPanel.name} - Details`;
    console.log("Bond:", solarPanel);
    console.log("User:", user);
  }, [solarPanel, user]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right", // Posición del toast
        autoClose: 3000, // Se cierra en 3 segundos
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark", // También puedes usar "light", "colored", etc.
      });
    }
  }, [error]);

  const handleBuy = () => {
    setShowPopup(true);
    console.log(showPopup);
  };

  const handleClosePopup = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si el clic es en el overlay (fuera del popup), cierra el popup
    if (e.target === e.currentTarget) {
      setShowPopup(false);
    }
  };

  const handleConfirmBuy = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(registerPurchase(purchaseData));
      setRequestResult(result);
      if (result.meta.requestStatus === 'rejected') {
        setShowPopup(false);
        setShowSuccessModal(true);
        setTransactionDetails(result.payload);
      } else if (result.payload) {
        console.log('Resultado de registerPurchase:', result.payload);
        setPurchaseDetails(result.payload.purchase);
        setTransactionDetails(result.payload.transactions);
        setShowPopup(false);
        setShowSuccessModal(true);
        // Redirige a la pantalla anterior tras compra exitosa
        navigate(-1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers para seleccionar y leer el CSV mock por año como en Payment
  const getCsvUrlForYear = (year: string) => `/mockPlacas/produccion_placas_luz_${year}.csv`;

  const fetchAndParseCsv = (url: string): Promise<Array<{ Fecha: string; Produccion_Monocristalina_kWh: number }>> => {
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
            }));
            resolve(rows);
          }
        },
        error: (error) => reject(error),
      });
    });
  };

  // Carga y prepara los últimos 30 días de kWh según el año de instalación
  // Igual que en MyPanels pero para un solo panel
  function buildLast30(records: Array<{ Fecha: string; Produccion_Monocristalina_kWh: number }>): { data: { date: string; total: number }[]; avg: number | null } {
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

  useEffect(() => {
    if (solarPanel) {
      const inferredYear = (solarPanel.installationYear ?? Number(String(solarPanel.name).slice(0, 4))) || new Date().getFullYear();
      const url = getCsvUrlForYear(String(inferredYear));
      fetchAndParseCsv(url)
        .then(setRecords)
        .catch(() => setRecords([]));
    }
  }, [solarPanel]);

  return (
  <div className="container d-flex justify-content-center" style={{ width: "140vh" }}>
      <style>
        {`
          .spinner-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            border-radius: 8px;
          }
          .popup {
            position: relative;
          }
        `}
      </style>
      <div className="solar-panel-section mt-3 p-4">
        <h2 className="mb-4 text-center">Panel "{solarPanel.name}"</h2>

        {/* <div className="mb-3">
          <h4 className="text-primary text-start" style={{ marginLeft: "5rem" }}>
            Issuer Company Details:
          </h4>
          <ul>
            <li>
              <strong>Company Name:</strong> <em>{issuer?.entityLegalName}</em>
            </li>
            <li>
              <strong>Tax ID Number:</strong> <em>{issuer?.taxIdNumber}</em>
            </li>
            <li>
              <strong>Website:</strong> <em>{issuer?.website}</em>
            </li>
          </ul>
        </div> */}

        <div className="mb-3">
          <h4 className="text-start" style={{ marginLeft: "5rem" }}>
            Bond Details:
          </h4>
          <ul>
            <li>
              <strong>Bond Name:</strong> <em>{solarPanel.name}</em>
            </li>
            <li>
              <strong>Bond Purpose:</strong> <em>{solarPanel.reference}</em>
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="text-start" style={{ marginLeft: "5rem" }}>
            Key Dates:
          </h4>
          <ul>
            <li>
              <strong>Location:</strong>{" "}
              <em>{solarPanel.location}</em>
            </li>
            <li>
              <strong>State:</strong>{" "}
              <em>{solarPanel.state}</em>
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="text-start" style={{ marginLeft: "5rem" }}>
            Financial Terms:
          </h4>
          <ul>
            <li>
              <strong>Coupon Payment Frequency:</strong> <em>{solarPanel.paymentFreq}</em>
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="text-start" style={{ marginLeft: "5rem" }}>
            Tokenization Details:
          </h4>
          <ul>
            <li>
              <strong>Price:</strong> <em>
                {typeof solarPanel.price === 'object' && '$numberDecimal' in solarPanel.price
                  ? solarPanel.price.$numberDecimal : String(solarPanel.price)} €
              </em>
            </li>
            <li>
              <strong>Stimated Production:</strong> <em>{solarPanel.stimatedProduction}</em>
              <span style={{ marginLeft: '1rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowChartPopup(true); }}>
                  Ver gráfica de producción
                </a>
              </span>
            </li>
          </ul>
        </div>

        <div className="d-flex justify-content-between align-items-center w-100">
          <div style={{ width: "33%" }}></div>
          <div style={{ width: "33%", textAlign: "center" }}>
            <button className="btn btn-pay-now" onClick={handleBuy}>
              BUY
            </button>
          </div>
          <div style={{ width: "33%", textAlign: "right" }}>
            <button className="btn btn-back" onClick={() => navigate(-1)}>
              BACK
            </button>
          </div>
        </div>
        <ToastContainer />
        {showPopup && (
          <div className="popup-overlay" onClick={handleClosePopup}>
            <div className="popup">
              {isLoading && (
                <div className="spinner-overlay">
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              <h2 className="mb-4" style={{ textAlign: "left" }}>
                BUY TOKEN
              </h2>

              <div className="row d-flex justify-content-center align-items-center">
                <div className="col-sm-6 mb-3 text-start">
                  <label htmlFor="userId" className="form-label text-start">
                    User:
                  </label>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    className="form-control bg-form"
                    placeholder="Id"
                    value={user.email}
                    disabled
                  />
                </div>

                <div className="col-sm-6 mb-3 text-start">
                  <label htmlFor="reference" className="form-label text-start">
                    Token Selection:
                  </label>
                  <input
                    id="reference"
                    name="reference"
                    className="form-control bg-form"
                    value={solarPanel._id}
                    disabled
                  />
                </div>
              </div>

              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-pay-now" onClick={handleConfirmBuy}>
                  CONFIRM
                </button>
                <button className="btn btn-back" onClick={() => setShowPopup(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Popup para gráfica de producción */}
        {showChartPopup && (
          <div className="popup-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowChartPopup(false); }} style={{ zIndex: 2000 }}>
            <div className="popup" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '700px', margin: '5rem auto' }}>
              <h4 className="text-start mb-3">Producción de Energía (últimos 30 días)</h4>
              {(() => {
                const { data, avg } = buildLast30(records);
                return avg !== null ? (
                  <>
                    <div style={{ marginBottom: "1rem" }}>
                      <strong>Media diaria:</strong> <em>{avg.toFixed(2)} kWh</em>
                    </div>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
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
                  <div>
                    <em>No hay datos de producción disponibles para esta placa.</em>
                  </div>
                );
              })()}
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn btn-back" onClick={() => setShowChartPopup(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
