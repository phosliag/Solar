import { useEffect, useState } from "react";
import { SolarPanel } from "../../SolarPanel";
import { Investor } from "../Authentication/InvestorRegistration";
import { PurchaseData } from "../../admin/BuyToken";
import { useLocation, useNavigate } from "react-router-dom";
import { registerPurchase } from "../../features/solarPanelSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toast, ToastContainer } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import csvText from '../../2025.csv?raw';

const BondDetails = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { solarPanel, user }: { solarPanel: SolarPanel; user: Investor } = location.state;

  const error = useAppSelector((state) => state.solarPanel.error);

  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestResult, setRequestResult] = useState<any>(null);
  const [energyData, setEnergyData] = useState<{ date: string; total: number }[]>([]);
  const [energyAverage, setEnergyAverage] = useState<number | null>(null);

  // Use the correct PurchaseData type
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    userId: user._id || '',
    reference: solarPanel._id || '', // Envia el _id de la placa
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/investor-dash");
  };

  const getPrefixedTrx = (network: string, trx: string) => {
    switch (network) {
      case 'ALASTRIA':
        return `https://b-network.alastria.izer.tech/tx/${trx}`;
      case 'AMOY':
        return `https://amoy.polygonscan.com/tx/${trx}`;
      default:
        return trx;
    }
  };

  // Función para leer y procesar el CSV
  const fetchEnergyProduction = async (plateId: string) => {
    try {
      console.log('DEBUG: plateId buscado:', plateId);
      // Usar el texto importado en vez de fetch
      const text = csvText;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      const header = lines[0].split(",");
      const allPlateIds = lines.slice(1).map(line => line.split(",")[0]);
      console.log('DEBUG: PlateIDs en CSV:', Array.from(new Set(allPlateIds)));
      // Mostrar las primeras 5 líneas parseadas para depuración
      console.log('DEBUG: Primeras 5 líneas parseadas:', lines.slice(1, 6).map(line => line.split(",")));
      const data = lines.slice(1)
        .map(line => line.split(","))
        .filter(cols => {
          if (cols.length < 26) {
            console.warn('Línea ignorada por tener menos de 26 columnas:', cols);
            return false;
          }
          return cols[0].trim().toLowerCase() === plateId.trim().toLowerCase();
        })
        .map(cols => ({
          date: cols[1],
          total: cols.slice(2).reduce((sum, val) => sum + parseFloat(val || "0"), 0)
        }));
      // Ordenar por fecha descendente y tomar los últimos 30 días
      const sorted = data.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).reverse();
      setEnergyData(sorted);
      if (sorted.length > 0) {
        const avg = sorted.reduce((sum, d) => sum + d.total, 0) / sorted.length;
        setEnergyAverage(avg);
      } else {
        setEnergyAverage(null);
        console.error('No se encontraron datos para el PlateID:', plateId);
      }
    } catch (err) {
      setEnergyData([]);
      setEnergyAverage(null);
      console.error('Error leyendo el CSV:', err);
    }
  };

  useEffect(() => {
    if (solarPanel && solarPanel.reference) {
      fetchEnergyProduction(solarPanel.reference);
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
              <strong>Price:</strong> <em>{solarPanel.price}</em>
            </li>
            <li>
              <strong>Stimated Production:</strong> <em>{solarPanel.stimatedProduction}</em>
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
                    User ID:
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
        {/* {showSuccessModal && (
          <div className="popup-overlay">
            <div className="popup" style={{ width: '600px' }}>
              <h2 className="text-success mb-4" style={{ textAlign: "center" }}>
                {requestResult?.meta?.requestStatus === 'rejected' ? 'Purchase Error!' : 'Successful Purchase!'}
              </h2>
              <div className="purchase-details mb-4">
                {requestResult?.meta?.requestStatus === 'rejected' ? (
                  <div className="alert alert-danger" role="alert">
                    {JSON.stringify(transactionDetails, null, 2)}
                  </div>
                ) : (
                  <>
                    <h4 className="text-primary mb-3">Transaction Details:</h4>
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong>Stable:</strong> 
                        <div className="text-break" style={{ wordBreak: 'break-all' }}>
                          <a href={getPrefixedTrx(purchaseDetails.destinationBlockchain, transactionDetails.stable)} target="_blank" rel="noopener noreferrer">{transactionDetails.stable}</a>
                        </div>
                      </li>
                      <li className="mb-3">
                        <strong>Transfer:</strong>
                        <div className="text-break" style={{ wordBreak: 'break-all' }}>
                          <a href={getPrefixedTrx(purchaseDetails.destinationBlockchain, transactionDetails.transfer)} target="_blank" rel="noopener noreferrer">{transactionDetails.transfer}</a>
                        </div>
                      </li>
                    </ul>
                  </>
                )}
              </div>
              <div className="popup-actions mt-5" style={{ textAlign: "center" }}>
                <button className="btn btn-success" onClick={handleCloseSuccessModal}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )} */}
        <div className="mb-3">
          <h4 className="text-start" style={{ marginLeft: "5rem" }}>
            Producción de Energía (últimos 30 días):
          </h4>
          <div>
            {energyAverage !== null ? (
              <>
                <div style={{ marginLeft: "5rem", marginBottom: "1rem" }}>
                  <strong>Media diaria:</strong> <em>{energyAverage.toFixed(2)} kWh</em>
                </div>
                <div style={{ width: "90%", height: 300, margin: "0 auto" }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={energyData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
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
              <div style={{ marginLeft: "5rem" }}>
                <em>No hay datos de producción disponibles para esta placa.</em>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondDetails;
