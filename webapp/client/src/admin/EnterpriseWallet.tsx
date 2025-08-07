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
  const [record, setRecord] = useState<PaymentRecord[]>([]);
  const [visibleCount, setVisibleCount] = useState(5); // Número inicial de registros visibles
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const tokenList: any[] = useAppSelector((state) => state.solarPanel.tokenList) || [];
  const upcomingPayment: any[] = useAppSelector((state) => state.solarPanel.upcomingPayment) || [];
  console.log("tokenList: ", tokenList);
  console.log("upcomingPayment: ", upcomingPayment);
  const [balanceData, setBalanceData] = useState(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate()

  const userId = useAppSelector((state) => state.user.userLoged?._id);
  //TODO: Que wallet utilizar ya que ahora no existe usuario tipo Issuer
  const wallet = process.env.ADMIN_ACCOUNTS_PUBLIC_KEY || "0x0480927822BA8f929D448B7EC30E65Eb4a986983"

  const panels = useAppSelector((state) => state.solarPanel.panels) || [];

  const priceTotal = tokenList?.reduce((acc, token) => {
    if (!acc[token.network]) {
      acc[token.network] = [];
    }
    acc[token.network].push(token.amountAvaliable || 0);
    return acc;
  }, {} as Record<string, number[]>);

  // Calcular suma por red
  const sumByNetwork = priceTotal ? Object.entries(priceTotal).reduce((acc, [network, values]) => {
    acc[network] = (values as number[]).reduce((sum: number, value: number) => sum + value, 0);
    return acc;
  }, {} as Record<string, number>) : {};

  // Calcular total general
  const totalSum = Object.values(sumByNetwork).reduce((sum, value) => sum + value, 0);


  useEffect(() => {
    dispatch(getTokenListAndUpcomingPaymentsByIssuer(userId || ""))
      .then(() => {
        setIsDataLoaded(true);
      });

    dispatch(readPanels())
  }, [dispatch]);

  useEffect(() => {
    // dispatch(readBonds(userId || ""));

    const fetchData = async () => {
      try {
        console.log(userId + " USER ID");
        // const data = await dispatch(getInvestorWalletData(userId || "")).unwrap();
        // setWalletData(data);
        console.log(wallet + " WALLET DATA");

        //TODO: Que wallet es necesaria 
        const dataFaucet = await dispatch(getFaucetBalance(wallet!)).unwrap();
        console.log(dataFaucet + " BALANCE");
        setBalanceData(dataFaucet);

      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCopy = (e: React.MouseEvent<HTMLParagraphElement>) => {
    setClipboardCopy(e.currentTarget.innerText);
    console.log(clipboardCopy);
    navigator.clipboard.writeText(clipboardCopy);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5); // Incrementa el número de registros visibles
  };

  return (
    <>
      <div className="solar-panel-section mt-4">
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
          <button
            type="button"
            className="btn btn-back mr-3"
            onClick={() => navigate("/admin-dash")}
            style={{ width: '90px', whiteSpace: 'nowrap' }}>
            Back
          </button>
        </div>
        <h2 className="mb-3" style={{ color: "var(--color-green-main)" }}>ENTERPRISE WALLET</h2>

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

            <h3 className="section-title mt-4">Overview of Balance</h3>
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
            </div>

            <h3 className="section-title mt-4">Tokens in circulation</h3>

            {panels && panels.length > 0 ? (
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
                  {panels.map((panel) => (
                    <tr key={panel.name} className="admin-table-cell">
                      <td>{panel.name}</td>
                      <td>{panel.reference}</td>
                      <td>{panel.owner}</td>
                      <td>{panel.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
