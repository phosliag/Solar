import React, { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
// import { readBonds } from "../../features/bondSlice";
import { getInvestorWalletData, getFaucetBalance } from "../../features/userSlice";
import { PaymentRecord } from "../../admin/EnterpriseWallet";
import { data, useNavigate } from "react-router-dom";
import { generatePaymentRecords } from "../../utils";
import { getTokenListAndUpcomingPaymentsByInvestor } from "../../features/solarPanelSlice";

const InvestmentWallet: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const bonds = useAppSelector((state) => state.bond.bonds);
  const user = useAppSelector((state) => state.user.userLoged);
  const userId = user?._id;
  const [record, setRecord] = useState<PaymentRecord[]>([]);
  // const [walletData, setWalletData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [clipboardCopy, setClipboardCopy] = useState("");
  const wallet = user?.walletAddress;
  const tokenList = useAppSelector((state) => state.solarPanel.tokenList);
  const upcomingPayment = useAppSelector((state) => state.solarPanel.upcomingPayment);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const priceTotal = tokenList?.reduce((acc: Record<string, number[]>, token: any) => {
    if (!acc[token.network]) {
      acc[token.network] = [];
    }
    acc[token.network].push(token.amountAvaliable || 0);
    return acc;
  }, {} as Record<string, number[]>);

  // Calcular suma por red
  const sumByNetwork = priceTotal ? Object.entries(priceTotal).reduce((acc: Record<string, number>, [network, values]) => {
    acc[network] = (values as number[]).reduce((sum: number, value: number) => sum + value, 0);
    return acc;
  }, {} as Record<string, number>) : {};

  // Calcular total general
  const totalSum = Object.values(sumByNetwork).reduce((sum, value) => sum + value, 0);

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
  }, [dispatch]);

  useEffect(() => {
    // dispatch(readBonds(userId || ""));
    
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

  // useEffect(() => {
  //   const rec = generatePaymentRecords(bonds!);
  //   setRecord(rec);
  //   console.log(record);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <div className="solar-panel-section mt-4" style={{ position: "relative", padding: "20px" }}>
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

      <h3 className="section-title mt-4">Token List:</h3>
      {tokenList?.map((token) => (
        <div key={token.bondName} className="mb-2">
          <strong>"{token.bondName}" Token holdings:</strong> {token.amountAvaliable}
        </div>
      ))}

      <h3 className="section-title mt-4">Upcoming payments</h3>
      {upcomingPayment && upcomingPayment.length > 0 ? (
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
      <div className="position-absolute top-0 end-0 m-3" style={{ display: "flex", justifyContent: "end" }}>
        <button
          type="button"
          className="btn btn-back col-sm-2"
          onClick={() => navigate(-1)}
          style={{ width: "90px" }}>
          Cancel
        </button>
      </div>
      </>
      )}
    </div>
  );
};

export default InvestmentWallet;
