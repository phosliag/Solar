import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import "../components/components.css";
import { useNavigate } from "react-router-dom";
import { getTokenListAndUpcomingPaymentsByIssuer, readPanels } from "../features/solarPanelSlice";
import { getFaucetBalance } from "../features/userSlice";

export interface PaymentRecord {
  bondName: string;
  paymentDate: string; // Fecha de cobro
  amount: number;
}


const EnterpriseWallet = () => {

  const [clipboardCopy, setClipboardCopy] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const tokenList: any[] = useAppSelector((state) => state.solarPanel.tokenList) || [];
  const upcomingPayment: any[] = useAppSelector((state) => state.solarPanel.upcomingPayment) || [];
  console.log("tokenList: ", tokenList);
  console.log("upcomingPayment: ", upcomingPayment);
  const [balanceData, setBalanceData] = useState(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate()

  const userId = useAppSelector((state) => state.user.userLoged?._id);
  const wallet = process.env.ADMIN_ACCOUNTS_PUBLIC_KEY || "0x0480927822BA8f929D448B7EC30E65Eb4a986983"

  const panels = useAppSelector((state) => state.solarPanel.panels) || [];
  // Paginación para la tabla de panels
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 10;
  const totalItems = panels.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPanels = panels.slice((currentPage - 1) * PAGE_SIZE, (currentPage - 1) * PAGE_SIZE + PAGE_SIZE);


  useEffect(() => {
    dispatch(getTokenListAndUpcomingPaymentsByIssuer(userId || ""))
      .then(() => {
        setIsDataLoaded(true);
      });

    dispatch(readPanels())
  }, [dispatch]);

  useEffect(() => {

    const fetchData = async () => {
      try {
        console.log(userId + " USER ID");

        console.log(wallet + " WALLET DATA");

        const dataFaucet = await dispatch(getFaucetBalance(wallet!)).unwrap();
        console.log(dataFaucet + " BALANCE");
        setBalanceData(dataFaucet);

      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchData();
  }, [dispatch, userId, wallet]);

  const handleCopy = (e: React.MouseEvent<HTMLParagraphElement>) => {
    setClipboardCopy(e.currentTarget.innerText);
    console.log(clipboardCopy);
    navigator.clipboard.writeText(clipboardCopy);
  };

  return (
    <>
      <div className="solar-panel-section mt-4">
        <div className="d-flex justify-content-end w-100 position-absolute top-0 end-0 p-3" style={{ zIndex: 10 }}>
          <button className="btn btn-back" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
        <h2 className="section-title mb-3" style={{ textAlign: "center" }}>ENTERPRISE WALLET</h2>

        <h3 className="section-title">Your Wallet Address:</h3>
        <div className="wallet-address col-12">
          <p id="copyLabel" className="copy-label" onClick={handleCopy}>
            {wallet}
            <img src="/images/clip.png" id="copyButton" className="copy-button" />
          </p>
        </div>
        {!isDataLoaded ? (
          <div className="d-flex justify-content-center" style={{ width: '100%', margin: '0 0 400px 0' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <h3 className="section-title mt-4">Total stable coins: {balanceData}</h3>

            {/* <h3 className="section-title mt-4">Overview of Balance</h3>
            <h4
              data-bs-toggle="collapse"
              data-bs-target="#balance-collapse"
              role="button"
              aria-expanded="false"
              aria-controls="balance-collapse"
              style={{ color: "var(--color-green-accent)" }}
            >
              <strong>Total Available Balance:</strong> {totalSum}
            </h4>
            <div className="collapse" id="balance-collapse">
              <ul>
                <li>
                  <strong>Alastria:</strong> {sumByNetwork.ALASTRIA}
                </li>
                <li>
                  <strong>Amoy:</strong> {sumByNetwork.AMOY}
                </li>
              </ul>
            </div> */}

            <h3 className="section-title mt-4">Tokens in circulation</h3>

            {panels && panels.length > 0 ? (
              <>
                <table
                  border={1}
                  className="table-hl"
                  style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
                  <thead className="admin-table-header">
                    <tr>
                      <th>Panel Name</th>
                      <th>Reference</th>
                      <th>Owner</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPanels.map((panel) => (
                      <tr key={panel.name} className="admin-table-cell">
                        <td>{panel.name}</td>
                        <td>{panel.reference}</td>
                        <td>{panel.owner}</td>
                        <td>
                          {typeof panel.price === 'object' && '$numberDecimal' in panel.price
                            ? panel.price.$numberDecimal
                            : String(panel.price)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    {`Showing ${totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems}`}
                  </div>
                  <nav aria-label="Page navigation">
                    <ul className="pagination pagination-themed justify-content-center mb-0">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous">
                          <span aria-hidden="true">&laquo;</span>
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                          <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next">
                          <span aria-hidden="true">&raquo;</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </>
            ) : (
              <p>There are no tokens available in circulation.</p>
            )}
          </>
        )}

        {/* <h3 className="section-title mt-4">Upcoming payments</h3>
        <table
          border={1}
          style={{ borderCollapse: "collapse", width: "100%", textAlign: "center", backgroundColor: "#d9e8fc" }}>
          <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
            <tr>
              <th>Bond Name</th>
              <th>Payment Date</th>
              <th>Payment Amount</th>
            </tr>
          </thead>
          <tbody>
            {record.slice(0, visibleCount).map((record: PaymentRecord) => (
              <tr key={record.paymentDate}>
                <td>{record.bondName}</td>
                <td>{record.paymentDate}</td>
                <td>{record.amount} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleCount < record.length && ( // Muestra el botón si hay más registros
          <button onClick={handleShowMore}>Show More</button>
        )} */}
      </div>
    </>
  );
};

export default EnterpriseWallet;
