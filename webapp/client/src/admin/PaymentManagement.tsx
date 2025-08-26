import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { readPanels, updatePayment, getPendingPayments } from "../features/solarPanelSlice";
import { SolarPanel } from "../SolarPanel";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

interface ProductionRecord {
  Fecha: string;
  Produccion_Monocristalina_kWh: number;
  Precio_Luz_Euro_kWh: number;
}
interface MonthlyPanelPayment {
  panelId: string;
  panelName: string;
  owner: string;
  fecha: string; // último día del mes actual YYYY-MM-DD
  kwh: number;
  totalEnEuro: number;
}

const PaymentManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const panels: SolarPanel[] = useAppSelector((state) => state.solarPanel.panels) || [];
  const invoices: any[] = useAppSelector((state) => state.solarPanel.invoices) || [];
  
  const [rows, setRows] = useState<MonthlyPanelPayment[]>([]);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [errorProduction, setErrorProduction] = useState<string | null>(null);
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>([]);

  // Devuelve la ruta del CSV mock correspondiente al año indicado
  const getCsvUrlForYear = (year: string) => `/mockPlacas/produccion_placas_luz_${year}.csv`;

  // Descarga y parsea un CSV a un array de ProductionRecord usando Papa.parse
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

  // Calcula la producción (kWh) y el importe (€) del mes objetivo (0-11), ignorando el año del CSV
  const computeMonthTotals = (records: ProductionRecord[], targetMonthIndex: number): { kwh: number; euro: number } => {
    let monthKwh = 0;
    let monthEuro = 0;
    records.forEach(({ Fecha, Produccion_Monocristalina_kWh, Precio_Luz_Euro_kWh }) => {
      const d = new Date(Fecha);
      // Usar el mes objetivo, ignorando el año del CSV
      if (d.getMonth() === targetMonthIndex) {
        const kwh = Number(Produccion_Monocristalina_kWh) || 0;
        const price = Number(Precio_Luz_Euro_kWh) || 0;
        monthKwh += kwh;
        monthEuro += kwh * price;
      }
    });
    return { kwh: parseFloat(monthKwh.toFixed(2)), euro: parseFloat(monthEuro.toFixed(2)) };
  };

  // Carga inicial: establece el título y solicita las placas disponibles
  useEffect(() => {
    document.title = "Payment Management";
    dispatch(readPanels());
    dispatch(getPendingPayments());
  }, [dispatch]);

  // Construye las filas mensuales por placa con owner:
  //  - Agrupa placas por año de instalación
  //  - Carga en paralelo los CSV necesarios
  //  - Calcula kWh y € del mes objetivo (mes anterior al actual)
  //  - Fija la fecha al último día del periodo mostrado
  useEffect(() => {
    const run = async () => {
      const panelsWithOwner = (panels || []).filter((p) => Boolean(p.owner));
      if (panelsWithOwner.length === 0) {
        setRows([]);
        return;
      }
      setLoadingProduction(true);
      setErrorProduction(null);
      try {
        // Dedupe años por panel
        const yearToPanels: Record<string, SolarPanel[]> = {};
        for (const p of panelsWithOwner) {
          const inferredYear = (p.installationYear ?? Number(String(p.name).slice(0, 4))) || new Date().getFullYear();
          const yearStr = String(inferredYear);
          if (!yearToPanels[yearStr]) yearToPanels[yearStr] = [];
          yearToPanels[yearStr].push(p);
        }

        // Cargar CSV por año en paralelo
        const yearEntries = Object.entries(yearToPanels);
        const fetched = await Promise.all(
          yearEntries.map(async ([yearStr]) => {
            const records = await fetchAndParseCsv(getCsvUrlForYear(yearStr));
            return [yearStr, records] as [string, ProductionRecord[]];
          })
        );
        const recordsByYear = Object.fromEntries(fetched) as Record<string, ProductionRecord[]>;

        // Construir filas por panel con sus datos de año correspondiente
        const now = new Date();
        // Periodo objetivo: mes anterior al actual
        let targetYear = now.getFullYear();
        let targetMonth = now.getMonth() - 1; // mes anterior
        if (targetMonth < 0) {
          targetMonth = 11;
          targetYear -= 1;
        }
        const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        const fechaStr = `${targetYear}-${(targetMonth + 1)
          .toString()
          .padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`;

        // Mapear fecha desde invoices (primer payment pendiente por panel)
        const panelNextPaymentDate: Record<string, string> = {};
        for (const inv of invoices) {
          const unpaid = (inv.payments || []).find((p: any) => !p.paid);
          if (unpaid) {
            const d = new Date(unpaid.timeStamp);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            panelNextPaymentDate[inv.panelId] = `${y}-${m}-${day}`;
          }
        }

        const builtRows: MonthlyPanelPayment[] = panelsWithOwner.map((p) => {
          const inferredYear = (p.installationYear ?? Number(String(p.name).slice(0, 4))) || now.getFullYear();
          const yearStr = String(inferredYear);
          const records = recordsByYear[yearStr] || [];
          const totals = computeMonthTotals(records, targetMonth);
          return {
            panelId: p._id || "",
            panelName: p.name,
            owner: p.owner,
            // Fecha viene del invoice si existe payment pendiente; si no, usar periodo objetivo por defecto
            fecha: panelNextPaymentDate[p._id || ""] || fechaStr,
            kwh: totals.kwh,
            totalEnEuro: totals.euro,
          };
        });

        setRows(builtRows);
      } catch (error) {
        console.error("Error cargando/parsing CSV:", error);
        setErrorProduction(`Error cargando o procesando datos: ${JSON.stringify(error)}`);
        setRows([]);
      } finally {
        setLoadingProduction(false);
      }
    };
    run();
  }, [panels, invoices]);

  // Permite pagar el periodo mostrado (mes anterior) cuando ya ha finalizado, incluyendo el mes siguiente
  // Indica si una fila (periodo) ya es pagable: hoy es posterior al final del periodo
  const isRowPayable = (row: MonthlyPanelPayment) => {
    const now = new Date();
    const rowDate = new Date(row.fecha + "T23:59:59Z");
    return now >= rowDate;
  };

  // Lanza el pago de una sola fila (un panel) con amount y timeStamp del periodo
  async function handlePaySingle(row: MonthlyPanelPayment) {
    try {
      setIsLoading(true);
      await dispatch(
        updatePayment({
          userId: row.owner,
          panelId: row.panelId,
          amount: row.totalEnEuro,
          timeStamp: row.fecha + "T12:00:00.000Z"
        })
      );
    } catch (e) {
      console.error("Error procesando pago:", e);
    } finally {
      setIsLoading(false);
    }
  }

  // Añade o quita un panel de la selección para pago en lote
  function toggleSelect(panelId: string) {
    setSelectedPanelIds((prev) =>
      prev.includes(panelId) ? prev.filter((id) => id !== panelId) : [...prev, panelId]
    );
  }

  // Selecciona o deselecciona todos los paneles de la tabla
  function toggleSelectAll(checked: boolean) {
    if (checked) setSelectedPanelIds(rows.map((r) => r.panelId));
    else setSelectedPanelIds([]);
  }

  // Suma el importe total de las filas seleccionadas
  const totalSelectedAmount = rows
    .filter((r) => selectedPanelIds.includes(r.panelId))
    .reduce((sum, r) => sum + r.totalEnEuro, 0);

  // Procesa los pagos en lote para las filas seleccionadas
  async function handlePayBatch() {
    try {
      setIsLoading(true);
      for (const row of rows) {
        if (!selectedPanelIds.includes(row.panelId)) continue;
        await dispatch(
          updatePayment({
            userId: row.owner,
            panelId: row.panelId,
            amount: row.totalEnEuro,
            timeStamp: row.fecha + "T12:00:00.000Z",
          })
        );
      }
      setSelectedPanelIds([]);
    } catch (e) {
      console.error("Error procesando pagos en batch:", e);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="solar-panel-section mt-4" style={{ position: "relative" }}>
      <div className="m-3" style={{ display: "flex", justifyContent: "end" }}>
        <button className="btn btn-back" onClick={() => navigate("/admin-dash")} >
          Back
        </button>
      </div>

      <h2 className="mb-3">PAYMENT MANAGEMENT</h2>

      <h4 className="pending-payments mt-4" style={{ textAlign: "left" }}>
        Pending Payments:
      </h4>
      <p className="text-danger">**Only if there are pending payments</p>
      <p>
        Total amount to pay: {totalSelectedAmount.toFixed(2)} €
        <button
          className="btn-pay-now"
          style={{ marginLeft: 30 }}
          disabled={
            isLoading ||
            selectedPanelIds.length === 0 ||
            !rows.every((r) => !selectedPanelIds.includes(r.panelId) || isRowPayable(r))
          }
          onClick={handlePayBatch}
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
      {!loadingProduction && !errorProduction && rows.length === 0 && (
        <p>No hay datos para mostrar</p>
      )}

      {rows.length > 0 && (
        <table className="table-hl">
          <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={selectedPanelIds.length > 0 && selectedPanelIds.length === rows.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </th>
              <th>Panel</th>
              <th>Owner</th>
              <th>Date</th>
              <th>kWh (mes)</th>
              <th>Total earned (€)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.panelId}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPanelIds.includes(row.panelId)}
                    onChange={() => toggleSelect(row.panelId)}
                  />
                </td>
                <td>{row.panelName}</td>
                <td>{row.owner}</td>
                <td>{row.fecha}</td>
                <td>{row.kwh}</td>
                <td>{row.totalEnEuro}</td>
                <td>
                  <button
                    className="btn-pay-now"
                    disabled={isLoading || !isRowPayable(row)}
                    onClick={() => handlePaySingle(row)}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      "Pay"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {false}

      <button className="btn-back mt-4" onClick={() => navigate(-1)}>
        BACK
      </button>
    </div>
  );
};

export default PaymentManagement;
