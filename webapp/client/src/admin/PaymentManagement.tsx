import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { updatePayment } from "../features/solarPanelSlice";
import { SolarPanel } from "../SolarPanel";
import { useNavigate } from "react-router-dom";
import { getPayments } from "../features/userSlice";


const PaymentManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const panels: any[] = useAppSelector((state) => state.solarPanel.panels) || [];
  const user = useAppSelector((state) => state.user.userLoged);
  const upcomingPayments = useAppSelector((state) => state.user.upcomingPayments);
  const pastDuePayments = useAppSelector((state) => state.user.pastDuePayments);
  const [selectedPanel, setSelectedPanel] = useState<SolarPanel | null>(null);
  const payBatch: string[] = [];
  const handlePanel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPanel(panels?.find((panel) => panel.name === e.target.value) || null);
  };

  useEffect(() => {
    document.title = "Payment Management";
    const fetchData = async () => {
      await dispatch(getPayments(user?._id!));
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    console.log(upcomingPayments);
    console.log(pastDuePayments);
  }, [upcomingPayments, pastDuePayments]);

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

  async function handlePay(payments: Array<{userId: string, panelId: string, network: string}>): Promise<void> {
    try {
      setIsLoading(true);
      for (const payment of payments) {
        console.log("Llamar funcion Update para cambiar estado del pago de ", payment.userId, " en el bono ", payment.panelId);
        await dispatch(updatePayment({ 
          userId: payment.userId,
          panelId: payment.panelId, 
          network: payment.network 
        }));
      }
      // Refresh payment data after all updates
      await dispatch(getPayments(user?._id!));
      // Limpiar la selección después de procesar los pagos
      payBatch.length = 0;
      console.log('Pagos procesados exitosamente');
    } catch (error) {
      console.error('Error al procesar los pagos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="solar-panel-section mt-4">
      <div className="position-absolute top-0 end-0 m-3" style={{ display: "flex", justifyContent: "end" }}>
        <button
          type="button"
          className="btn btn-back col-sm-2"
          onClick={() => navigate("/admin-dash")}
          style={{ width: '90px'}}>
          Cancel
        </button>
      </div>
      <h2 className="mb-3">PAYMENT MANAGEMENT</h2>

      {/* <h2 className="section-title mt-4" style={{ alignSelf: "start" }}>
        Overview of Balance
      </h2>
      <p
        data-bs-toggle="collapse"
        data-bs-target="#balance-collapse"
        role="button"
        aria-expanded="false"
        aria-controls="balance-collapse">
        <strong>Total Available Balance:</strong> "50.000€"
      </p>
      <div className="collapse" id="balance-collapse">
        <ul>
          <li>Alastria: "20.000€"</li>
          <li>Ethereum: "20.000€"</li>
          <li>Polygon: "10.000€"</li>
        </ul>
      </div> */}

      <h2 className="section-title mt-4" style={{ alignSelf: "start" }}>
        Token Selection:
      </h2>
      <div className="wallet-box">
        <select
          id="bond"
          name="bond"
          className="form-control bg-form"
          value={selectedPanel?.name}
          onChange={handlePanel}>
          <option value="">Select bond</option>
          {panels?.map((panel) => (
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
        Total amount to pay: {upcomingPayments.find((payment) => payment.bondName === selectedPanel?.name)?.amount}
        <button 
          className="btn-pay-now" 
          style={{ marginLeft: "30px" }}
          disabled={isLoading}
          onClick={() => {
            const payment = upcomingPayments.find((payment) => payment.bondName === selectedPanel?.name);
            console.log('Procesando pagos seleccionados');
            if (payment) {
              const paymentsToProcess = payment.investors
                .filter((investor: { userId: string, amount: number, numberToken: number }) => 
                  payBatch.includes(investor.userId))
                .map((investor: { userId: string, amount: number, numberToken: number }) => ({
                  userId: investor.userId,
                  panelId: selectedPanel?._id!,
                  network: payment.network
                }));
              console.log('Pagos a procesar:', paymentsToProcess);
              if (paymentsToProcess.length > 0) {
                handlePay(paymentsToProcess);
              } else {
                console.log('No hay pagos seleccionados para procesar');
              }
            } else {
              console.log('No se encontró el pago para el bono seleccionado');
            }
          }}>
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            'Pay Now'
          )}
        </button>
      </p>
      {(() => {
        const payment = upcomingPayments.find((payment) => payment.bondName === selectedPanel?.name);
        console.log('payment', payment);
        if (!payment) return null;

        return (
          <table border={1} style={{ borderCollapse: "collapse", width: "100%", textAlign: "center", backgroundColor: "#d9e8fc" }}>
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
              {payment.investors.map((investor: any) => (
                !payment.paid && (
                  <tr key={investor.userId}>
                    <td>
                      <input type="checkbox" onChange={() => handleAddToPay(investor.userId)} style={{textAlign: "start", marginRight: "10px"}}/>
                      {investor.userId}
                    </td>
                    <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ''}</td>
                    <td>{investor.amount}</td>
                    <td>{investor.numberToken}</td>
                    <td>
                      <button 
                        className="btn-pay-now" 
                        disabled={isLoading}
                        onClick={() => handlePay([{userId: investor.userId, panelId: selectedPanel?._id!, network: payment.network}])}>
                        {isLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          'Pay'
                        )}
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        );
      })()}

      {/* <div className="collapse" id="pending-payments-collapse">
        <ul style={{ listStyleType: "none" }}>
          {selectedBond?.tokenState.map((block) => (
            <li key={block.blockchain}>
              <input type="checkbox" />
              <strong>{block.blockchain}: </strong> {block.amount}€
            </li>
          ))}
        </ul>
      </div> */}

      <h2 className="section-title mt-4">Next Payments:</h2>
      <table border={1} style={{ borderCollapse: "collapse", width: "100%", textAlign: "center", backgroundColor: "#d9e8fc" }}>
        <thead style={{ backgroundColor: "#7ba6e9", color: "white" }}>
          <tr>
            <th>Investor</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {pastDuePayments.find((payment) => payment.bondName === selectedPanel?.name)?.map((payment: any) => (
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
