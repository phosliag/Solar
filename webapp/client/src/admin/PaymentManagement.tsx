import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { readPanels, updatePayment } from "../features/solarPanelSlice";
import { SolarPanel } from "../SolarPanel";
import { useNavigate } from "react-router-dom";
import { getPayments } from "../features/userSlice";
import Papa from "papaparse";


interface ProductionRecord {
  Fecha: string;
  Produccion_Monocristalina_kWh: number;
  Precio_Luz_Euro_kWh: number;
}

interface MonthlyProduction {
  inversor: string; // panel name
  fecha: string;    // ultimo día mes YYYY-MM-DD
  totalEnEuro: number;
}

const PaymentManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const panels: SolarPanel[] = useAppSelector((state) => state.solarPanel.panels) || [];
  const user = useAppSelector((state) => state.user.userLoged);
  const upcomingPayments = useAppSelector((state) => state.user.upcomingPayments);
  const pastDuePayments = useAppSelector((state) => state.user.pastDuePayments);

  const [selectedPanel, setSelectedPanel] = useState<SolarPanel | null>(null);
  const payBatch: string[] = [];

  // Estados para producción mensual
  const [productionSummary, setProductionSummary] = useState<MonthlyProduction[]>([]);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [errorProduction, setErrorProduction] = useState<string | null>(null);

  const handlePanel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPanel(panels?.find((panel) => panel.name === e.target.value) || null);
  };

  const getCsvUrlForYear = (year: string) => `/mockPlacas/produccion_placas_luz_${year}.csv`;

  const fetchAndParseCsv = (url: string): Promise<ProductionRecord[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results: { errors: string | any[]; data: ProductionRecord[]; }) => {
          if (results.errors.length > 0) reject(results.errors);
          else resolve(results.data as ProductionRecord[]);
        },
        error: (error: any) => reject(error),
      });
    });
  };

  const calcularProduccionMensual = (records: ProductionRecord[], panelName: string): MonthlyProduction[] => {
    const grouped: Record<string, { produccionSum: number; costeSum: number }> = {};

    records.forEach(({ Fecha, Produccion_Monocristalina_kWh, Precio_Luz_Euro_kWh }) => {
      const date = new Date(Fecha);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

      if (!grouped[monthKey]) grouped[monthKey] = { produccionSum: 0, costeSum: 0 };

      grouped[monthKey].produccionSum += Produccion_Monocristalina_kWh;
      grouped[monthKey].costeSum += Precio_Luz_Euro_kWh * Produccion_Monocristalina_kWh;
    });

    return Object.entries(grouped).map(([month, { produccionSum, costeSum }]) => {
      const [year, monthStr] = month.split("-");
      const y = parseInt(year);
      const m = parseInt(monthStr);
      const lastDay = new Date(y, m, 0).getDate();
      const costeMedio = costeSum / produccionSum || 0;
      const totalEnEuro = produccionSum * costeMedio;

      return {
        inversor: panelName,
        fecha: `${year}-${monthStr}-${lastDay.toString().padStart(2, "0")}`,
        totalEnEuro: parseFloat(totalEnEuro.toFixed(2)),
      };
    });
  };

  useEffect(() => {
    document.title = "Payment Management";
    const fetchData = async () => {
      await dispatch(getPayments(user?._id!));
    };
    dispatch(readPanels());
    fetchData();
  }, [dispatch, user?._id]);

  useEffect(() => {
    console.log(upcomingPayments);
    console.log(pastDuePayments);
  }, [upcomingPayments, pastDuePayments]);

  useEffect(() => {
    // Al seleccionar panel con owner válido, cargar CSV y calcular producción
    if (!selectedPanel || !selectedPanel.owner) {
      setProductionSummary([]);
      return;
    }

    // Obtener año instalado, si no existe, intentar detectar con substring nombre (ajustar si tienes otro campo)
    const year = selectedPanel.installationYear ?? selectedPanel.name.slice(0, 4);

    setLoadingProduction(true);
    setErrorProduction(null);

    fetchAndParseCsv(getCsvUrlForYear(year.toString()))
      .then((data) => {
        const resumen = calcularProduccionMensual(data, selectedPanel.owner);
        setProductionSummary(resumen);
      })
      .catch((error) => {
        console.error("Error al cargar o parsear CSV:", error);
        setErrorProduction(`Error cargando o procesando datos producción: ${JSON.stringify(error)}`);
        setProductionSummary([]);
      })
      .finally(() => setLoadingProduction(false));
  }, [selectedPanel]);

  function handleAddToPay(value: string): void {
    if (payBatch.includes(value)) {
      const filteredBatch = payBatch.filter((item) => item !== value);
      payBatch.length = 0;
      payBatch.push(...filteredBatch);
    } else {
      payBatch.push(value);
    }
    console.log(payBatch);
  }

  async function handlePay(payments: Array<{ userId: string; panelId: string; network: string }>): Promise<void> {
    try {
      setIsLoading(true);
      for (const payment of payments) {
        console.log("Llamar funcion Update para cambiar estado del pago de ", payment.userId, " en el bono ", payment.panelId);
        await dispatch(
          updatePayment({
            userId: payment.userId,
            panelId: payment.panelId,
            network: payment.network,
          })
        );
      }
      // Refrescar datos después de actualizar pagos
      await dispatch(getPayments(user?._id!));
      // Limpiar selección
      payBatch.length = 0;
      console.log("Pagos procesados exitosamente");
    } catch (error) {
      console.error("Error al procesar los pagos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="solar-panel-section mt-4" style={{ position: "relative" }}>
      <div className="position-absolute top-0 end-0 m-3" style={{ display: "flex", justifyContent: "end" }}>
        <button
          type="button"
          className="btn btn-back"
          onClick={() => navigate("/admin-dash")}
          style={{ width: "90px" }}
        >
          Cancel
        </button>
      </div>
      <h2 className="mb-3">PAYMENT MANAGEMENT</h2>

      <h2 className="section-title mt-4" style={{ alignSelf: "start" }}>
        Token Selection:
      </h2>
      <div className="wallet-box">
        <select
          id="panel"
          name="panel"
          className="form-control bg-form"
          value={selectedPanel?.name || ""}
          onChange={handlePanel}
        >
          <option value="">Select panel</option>
          {panels?.map((panel) => (
            <option value={panel.name} key={panel._id}>
              {panel.name}
            </option>
          ))}
        </select>
      </div>

      {/* PRODUCCIÓN MENSUAL Y TOTAL € */}
      <div style={{ marginTop: "2em" }}>
        <h3>Producción y ganancias mensuales</h3>
        {loadingProduction && <p>Cargando producción...</p>}
        {errorProduction && <p style={{ color: "red" }}>{errorProduction}</p>}
        {!loadingProduction && !errorProduction && productionSummary.length === 0 && <p>No hay datos para mostrar</p>}
        {productionSummary.length > 0 && (
          <table className="table-hl"
            // border={1}
            // style={{ width: "100%", textAlign: "center", borderCollapse: "collapse", backgroundColor: "#f0f9f0" }}
          >
            <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
              <tr>
                <th>Investor</th>
                <th>Date</th>
                <th>Total earned (€)</th>
              </tr>
            </thead>
            <tbody>
              {productionSummary.map((item) => (
                <tr key={item.fecha}>
                  <td>{item.inversor}</td>
                  <td>{item.fecha}</td>
                  <td>{item.totalEnEuro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h4 className="pending-payments mt-4" style={{ textAlign: "left" }}>
        Pending Payments:
      </h4>
      <p className="text-danger">**Only if there are pending payments</p>
      <p>
        Total amount to pay:{" "}
        {upcomingPayments.find((payment) => payment.bondName === selectedPanel?.name)?.amount || 0}
        <button
          className="btn-pay-now"
          style={{ marginLeft: "30px" }}
          disabled={isLoading}
          onClick={() => {
            const payment = upcomingPayments.find((payment) => payment.bondName === selectedPanel?.name);
            console.log("Procesando pagos seleccionados");
            if (payment) {
              const paymentsToProcess = payment.investors
                .filter((investor: { userId: string; amount: number; numberToken: number }) => payBatch.includes(investor.userId))
                .map((investor: { userId: string; amount: number; numberToken: number }) => ({
                  userId: investor.userId,
                  panelId: selectedPanel?._id!,
                  network: payment.network,
                }));
              console.log("Pagos a procesar:", paymentsToProcess);
              if (paymentsToProcess.length > 0) {
                handlePay(paymentsToProcess);
              } else {
                console.log("No hay pagos seleccionados para procesar");
              }
            } else {
              console.log("No se encontró el pago para el bono seleccionado");
            }
          }}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            "Pay Now"
          )}
        </button>
      </p>
      {(() => {
        const payment = upcomingPayments.find((payment) => payment.bondName === selectedPanel?.name);
        if (!payment) return null;

        return (
          <table
            border={1}
            style={{ borderCollapse: "collapse", width: "100%", textAlign: "center", backgroundColor: "#d9e8fc" }}
          >
            <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
              <tr>
                <th>Investor</th>
                <th>Date</th>
                <th>Amount of Tokens</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payment.investors.map(
                (investor: any) =>
                  !payment.paid && (
                    <tr key={investor.userId}>
                      <td>
                        <input
                          type="checkbox"
                          onChange={() => handleAddToPay(investor.userId)}
                          style={{ textAlign: "start", marginRight: "10px" }}
                        />
                        {investor.userId}
                      </td>
                      <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ""}</td>
                      <td>{investor.amount}</td>
                      <td>{investor.numberToken}</td>
                      <td>
                        <button
                          className="btn-pay-now"
                          disabled={isLoading}
                          onClick={() => handlePay([{ userId: investor.userId, panelId: selectedPanel?._id!, network: payment.network }])}
                        >
                          {isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            "Pay"
                          )}
                        </button>
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        );
      })()}

      <h2 className="section-title mt-4">Next Payments:</h2>
      <table
        border={1}
        style={{ borderCollapse: "collapse", width: "100%", textAlign: "center", backgroundColor: "#d9e8fc" }}
      >
        <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
          <tr>
            <th>Investor</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {pastDuePayments
            .find((payment) => payment.bondName === selectedPanel?.name)
            ?.map((payment: any) => (
              <tr key={payment.paymentDate}>
                <td>{payment.investors.userId}</td>
                <td>{payment.paymentDate}</td>
                <td>{payment.amount}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <button className="btn-back mt-4" onClick={() => navigate(-1)}>
        BACK
      </button>
    </div>
  );
};

export default PaymentManagement;
