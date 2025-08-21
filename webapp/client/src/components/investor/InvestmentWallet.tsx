import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
// import { readBonds } from "../../features/bondSlice";
import { getFaucetBalance } from "../../features/userSlice";
import { useNavigate } from "react-router-dom";
import { getTokenListAndUpcomingPaymentsByInvestor, readPanels } from "../../features/solarPanelSlice";
import type { SolarPanel } from "../../SolarPanel";
import Papa from "papaparse";

const InvestmentWallet: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const bonds = useAppSelector((state) => state.bond.bonds);
  const user = useAppSelector((state) => state.user.userLoged);
  const userId = user?._id;
  // const [walletData, setWalletData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [clipboardCopy, setClipboardCopy] = useState("");
  const wallet = user?.walletAddress;
  const tokenList = useAppSelector((state) => state.solarPanel.tokenList);
  const upcomingPayment = useAppSelector((state) => state.solarPanel.upcomingPayment);
  const panels: SolarPanel[] = useAppSelector((state) => state.solarPanel.panels) || [];
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [productionRows, setProductionRows] = useState<Array<{ panelId: string; panelName: string; fecha: string; kwh: number; totalEnEuro: number }>>([]);

  const handleCopy = (e: React.MouseEvent<HTMLParagraphElement>) => {
    setClipboardCopy(e.currentTarget.innerText);
    console.log(clipboardCopy);
    navigator.clipboard.writeText(clipboardCopy);
  };

  useEffect(() => {
    dispatch(getTokenListAndUpcomingPaymentsByInvestor(userId || ""))
      .then(() => {
        setIsDataLoaded(true);
      });
    // Ensure panels are loaded to compute production
    dispatch(readPanels())
      .then(() => {
        setIsDataLoaded(true);
      });
  }, [dispatch]);

  useEffect(() => {
    // Build monthly production rows for panels owned by this user using mock CSVs
    const run = async () => {
      const ownedPanels = (panels || []).filter((p) => String(p.owner) === String(userId));
      if (ownedPanels.length === 0) {
        setProductionRows([]);
        return;
      }
      setLoadingProduction(true);
      try {
        // Group panels by installation year (fallback from name prefix)
        const yearToPanels: Record<string, SolarPanel[]> = {};
        for (const p of ownedPanels) {
          const inferredYear = (p.installationYear ?? Number(String(p.name).slice(0, 4))) || new Date().getFullYear();
          const yearStr = String(inferredYear);
          if (!yearToPanels[yearStr]) yearToPanels[yearStr] = [];
          yearToPanels[yearStr].push(p);
        }

        const getCsvUrlForYear = (year: string) => `/mockPlacas/produccion_placas_luz_${year}.csv`;
        const fetchAndParseCsv = (url: string): Promise<Array<{ Fecha: string; Produccion_Monocristalina_kWh: number; Precio_Luz_Euro_kWh: number }>> =>
          new Promise((resolve, reject) => {
            Papa.parse(url, {
              download: true,
              header: true,
              dynamicTyping: true,
              skipEmptyLines: true,
              complete: (results) => {
                if (results.errors.length > 0) reject(results.errors);
                else resolve(results.data as any);
              },
              error: (err) => reject(err),
            });
          });

        const yearEntries = Object.entries(yearToPanels);
        const fetched = await Promise.all(
          yearEntries.map(async ([yearStr]) => {
            const records = await fetchAndParseCsv(getCsvUrlForYear(yearStr));
            return [yearStr, records] as [string, Array<{ Fecha: string; Produccion_Monocristalina_kWh: number; Precio_Luz_Euro_kWh: number }>];
          })
        );
        const recordsByYear = Object.fromEntries(fetched) as Record<string, Array<{ Fecha: string; Produccion_Monocristalina_kWh: number; Precio_Luz_Euro_kWh: number }>>;

        const now = new Date();
        let targetYear = now.getFullYear();
        let targetMonth = now.getMonth() - 1; // previous month
        if (targetMonth < 0) {
          targetMonth = 11;
          targetYear -= 1;
        }
        const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        const fechaStr = `${targetYear}-${(targetMonth + 1).toString().padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`;

        // Compute per-panel totals using its year's CSV
        const buildRows: Array<{ panelId: string; panelName: string; fecha: string; kwh: number; totalEnEuro: number }> = ownedPanels.map((p) => {
          const inferredYear = (p.installationYear ?? Number(String(p.name).slice(0, 4))) || now.getFullYear();
          const yearStr = String(inferredYear);
          const records = recordsByYear[yearStr] || [];
          let monthKwh = 0;
          let monthEuro = 0;
          records.forEach(({ Fecha, Produccion_Monocristalina_kWh, Precio_Luz_Euro_kWh }) => {
            const d = new Date(Fecha);
            if (d.getMonth() === targetMonth) {
              const kwh = Number(Produccion_Monocristalina_kWh) || 0;
              const price = Number(Precio_Luz_Euro_kWh) || 0;
              monthKwh += kwh;
              monthEuro += kwh * price;
            }
          });
          return {
            panelId: p._id || "",
            panelName: p.name,
            fecha: fechaStr,
            kwh: parseFloat(monthKwh.toFixed(2)),
            totalEnEuro: parseFloat(monthEuro.toFixed(2)),
          };
        });

        setProductionRows(buildRows);
      } catch (e) {
        console.error("Error loading/processing production CSVs:", e);
        setProductionRows([]);
      } finally {
        setLoadingProduction(false);
      }
    };
    run();
  }, [panels, userId])

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(userId + " USER ID");
        // const data = await dispatch(getInvestorWalletData(userId || "")).unwrap();
        // setWalletData(data);
        console.log(user?.walletAddress + " WALLET DATA");

        const dataFaucet = await dispatch(getFaucetBalance(user?.walletAddress!)).unwrap();
        console.log(dataFaucet + " BALANCE");
        setBalanceData(dataFaucet);

      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="solar-panel-section mt-4" style={{ position: "relative", padding: "20px" }}>
      <div className="m-3" style={{ display: "flex", justifyContent: "end" }}>
        <button className="btn btn-back" onClick={() => navigate("/investor-dash")} >
          Back
        </button>
      </div>
      
      <h2 className="mb-3" style={{ color: "var(--color-green-main)" }}>MY INVESTMENT WALLET</h2>
      <h3 className="section-title">Your Wallet Address:</h3>
      <div className="wallet-address col-12">
        <p id="copyLabel" className="copy-label" onClick={handleCopy}>
          {wallet}
          <img src="/images/clip.png" id="copyButton" className="copy-button" />
        </p>
      </div>
      {!isDataLoaded ? (
        <div className="d-flex justify-content-center" style={{ width: '100%', margin: '0 0 400px 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h3 className="section-title mt-4">Account Balance:</h3>
            <strong>Total Available Balance:</strong> {balanceData}
          </div>

          <h3 className="section-title mt-4">Token List:</h3>
          {tokenList?.map((token) => (
            <div key={token.bondName} className="mb-2">
              <strong>"{token.bondName}" Token holdings:</strong> {token.amountAvaliable}
            </div>
          ))}

          <h3 className="section-title mt-4">Upcoming payments</h3>
          {/* {upcomingPayment && upcomingPayment.length > 0 ? (
            <table
              border={1}
              className="table-hl"
              style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
              <thead className="admin-table-header">
                <tr>
                  <th>Bond Name</th>
                  <th>Payment Date</th>
                  <th>Payment Amount</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPayment?.map((bond, index) => (
                  <tr key={index} className="admin-table-cell">
                    <td>{bond.bondName}</td>
                    <td>{bond.paymentDate}</td>
                    <td>{bond.paymentAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No upcoming payments available</p>
          )}

          <h3 className="section-title mt-4">Monthly Production (mock)</h3> */}
          {loadingProduction ? (
            <div className="d-flex justify-content-center" style={{ width: '100%' }}>
              <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : productionRows.length > 0 ? (
            <table
              border={1}
              className="table-hl"
              style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
              <thead className="admin-table-header">
                <tr>
                  <th>Panel</th>
                  <th>Date</th>
                  <th>kWh (month)</th>
                  <th>Total earned (€)</th>
                </tr>
              </thead>
              <tbody>
                {productionRows.map((row, idx) => (
                  <tr key={idx} className="admin-table-cell">
                    <td>{row.panelName}</td>
                    <td>{row.fecha}</td>
                    <td>{row.kwh}</td>
                    <td>{row.totalEnEuro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No upcoming payments available</p>
          )}
        </>
      )}
    </div>
  );
};

export default InvestmentWallet;
