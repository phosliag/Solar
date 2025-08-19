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
  inversor: string;  // panel name or investor id si quieres
  fecha: string;     // último día mes YYYY-MM-DD
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

  // CAMBIO: payBatch ahora es estado React para que checkbox funcione
  const [payBatch, setPayBatch] = useState<string[]>([]);

  const [productionSummary, setProductionSummary] = useState<MonthlyProduction[]>([]);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [errorProduction, setErrorProduction] = useState<string | null>(null);

  const handlePanel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPanel(panels.find((panel) => panel.name === e.target.value) || null);
    setPayBatch([]); // resetear selección al cambiar panel
  };

  const getCsvUrlForYear = (year: string) => `/mockPlacas/produccion_placas_luz_${year}.csv`;

  const fetchAndParseCsv = (url: string): Promise<ProductionRecord[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("Papaparse errors:", results.errors);
            reject(results.errors);
          } else {
            resolve(results.data as ProductionRecord[]);
          }
        },
        error: (error) => {
          console.error("Papaparse fetch error:", error);
          reject(error);
        },
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
    dispatch(readPanels());
    dispatch(getPayments(user?._id!));
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (!selectedPanel || !selectedPanel.owner) {
      setProductionSummary([]);
      return;
    }
    const year = selectedPanel.installationYear ?? selectedPanel.name.slice(0, 4);
    setLoadingProduction(true);
    setErrorProduction(null);
    fetchAndParseCsv(getCsvUrlForYear(year.toString()))
      .then((data) => {
        const resumen = calcularProduccionMensual(data, selectedPanel.owner!);
        setProductionSummary(resumen);
      })
      .catch((error) => {
        console.error("Error cargando/parsing CSV:", error);
        setErrorProduction(`Error cargando o procesando datos: ${JSON.stringify(error)}`);
        setProductionSummary([]);
      })
      .finally(() => setLoadingProduction(false));
  }, [selectedPanel]);

  // CAMBIO: actualizar opción checkbox con estado React
  function handleAddToPay(value: string) {
    setPayBatch((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  }

  async function handlePay(payments: { userId: string; panelId: string; network: string }[]) {
    try {
      setIsLoading(true);
      for (const payment of payments) {
        console.log("Actualizando pago para", payment.userId, payment.panelId);
        await dispatch(updatePayment(payment));
      }
      await dispatch(getPayments(user?._id!));
      setPayBatch([]);
    } catch (e) {
      console.error("Error procesando pagos:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const totalSelectedAmount = productionSummary
  .filter(({ inversor, fecha }) => payBatch.includes(`${inversor}-${fecha}`))
  .reduce((acc, item) => acc + item.totalEnEuro, 0);


  return (
    <div className="solar-panel-section mt-4" style={{ position: "relative" }}>
      <div className="position-absolute top-0 end-0 m-3" style={{ display: "flex", justifyContent: "end" }}>
        <button className="btn btn-back" onClick={() => navigate("/admin-dash")} style={{ width: 90 }}>
          Cancel
        </button>
      </div>

      <h2 className="mb-3">PAYMENT MANAGEMENT</h2>

      // TODO - Quitar la seleccion
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
          {panels.map((panel) => (
            <option value={panel.name} key={panel._id}>
              {panel.name}
            </option>
          ))}
        </select>
      </div>

      <h4 className="pending-payments mt-4" style={{ textAlign: "left" }}>
        Pending Payments:
      </h4>
      <p className="text-danger">**Only if there are pending payments</p>
      <p>
        Total amount to pay: {totalSelectedAmount.toFixed(2)} €
        <button
          className="btn-pay-now"
          style={{ marginLeft: 30 }}
          disabled={isLoading}
          onClick={() => {
            const payment = upcomingPayments.find((p) => p.bondName === selectedPanel?.name);
            console.log("Procesando pagos seleccionados");
            if (payment) {
              const paymentsToProcess = payment.investors
                .filter((investor: { userId: string }) => payBatch.includes(investor.userId))
                .map((investor: { userId: string }) => ({
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

      {loadingProduction && <p>Cargando producción...</p>}
      {errorProduction && <p style={{ color: "red" }}>{errorProduction}</p>}
      {!loadingProduction && !errorProduction && productionSummary.length === 0 && (
        <p>No hay datos para mostrar</p>
      )}

      {productionSummary.length > 0 && (
        <table className="table-hl">
          <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
            <tr>
              <th>
                <input
                  type="checkbox"
                  disabled
                  aria-label="Select all (Not implemented)"
                />
              </th>
              <th>Date</th>
              <th>Total earned (€)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productionSummary.map(({ inversor, fecha, totalEnEuro }) => {
              const rowId = `${inversor}-${fecha}`;
              return (
                <tr key={rowId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={payBatch.includes(rowId)}
                      onChange={() => handleAddToPay(rowId)}
                      style={{ textAlign: "center", marginRight: 10 }}
                    />
                    {inversor}
                  </td>
                  <td>{fecha}</td>
                  <td>{totalEnEuro}</td>
                  <td>
                    <button
                      className="btn-pay-now"
                      disabled={isLoading}
                      onClick={() =>
                        handlePay([
                          {
                            userId: rowId,
                            panelId: selectedPanel?._id || "",
                            network: "mock-network",
                          },
                        ])
                      }
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        "Pay"
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <h2 className="section-title mt-4">Next Payments:</h2>
      <table className="table-hl">
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
