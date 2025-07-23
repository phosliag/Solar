import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getTrxSuccess, getTrxError } from "../features/adminSlice";
import { Container, Form, Button, Dropdown } from 'react-bootstrap';
import { faucetStable } from "../features/userSlice";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const dispatch = useAppDispatch();
  const { trxSuccess, trxError } = useAppSelector(state => state.admin);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [trxTypeFilter, setTrxTypeFilter] = useState<string>("");
  const [searchUserId, setSearchUserId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    document.title = "Admin - Solar Panels";
    dispatch(getTrxSuccess());
    dispatch(getTrxError());
  }, [dispatch]);

  const handleFaucet = async () => {
    console.log("doFaucet");
    const response = await dispatch(faucetStable({ address: address, amount: amount }));
    if (response.payload) {
      console.log("Faucet exitoso");
    } else {
      console.log("Faucet fallido");
    }
  }

  const getPrefixedTrx = (network: string, trx: string) => {
    switch (network) {
      case 'ALASTRIA':
        return `https://b-network.alastria.izer.tech/tx/${trx}`;
      case 'AMOY':
        return `https://amoy.polygonscan.com/tx/${trx}`;
      default:
        return trx; // Sin prefijo si no coincide
    }
  };

  const filteredTrxSuccess = trxSuccess.filter(trx =>
    trxTypeFilter ? trx.trx_type === trxTypeFilter : true
  ).filter(trx =>
    searchUserId ? trx.userId.includes(searchUserId) : true
  );
  const filteredTrxError = trxError.filter(trx =>
    trxTypeFilter ? trx.trx_type === trxTypeFilter : true
  ).filter(trx =>
    searchUserId ? trx.userId.includes(searchUserId) : true
  );
  const navigate = useNavigate();
  return (
    <Container fluid className="p-4" style={{ maxWidth: '100%' }}>
      <h1 className="mb-4" style={{ color: 'var(--color-green-main)' }}>Admin Dashboard</h1>

      <div className="container-md d-flex flex-column align-items-center mb-4">
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/form")}>TOKENIZED SOLAR PANEL CREATION</button>
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/manage-bonds")}>MANAGE PANELS</button>
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/management-menu")}>WALLET</button>
        <button className="btn btn-pay-now mb-2 p-3 col-9" onClick={() => navigate("/payment-management")}>PAYMENT MANAGEMENT</button>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h5 className="mb-3">Faucet</h5>
        <div className="row">
          <div className="col-12 col-md-6 mb-3">
            <Form className="d-flex gap-2">
              <Form.Control type="text" placeholder="Wallet Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Form.Control type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              <Button className="btn-pay-now" onClick={handleFaucet}>Faucet</Button>
            </Form>
          </div>
          <div className="col-12 col-md-6 text-end mb-3">
            <Button className="btn btn-back" onClick={() => navigate("/")}>Log out</Button>
          </div>
        </div>

        <div className="mb-4">
          <h5 className="section-title" style={{ fontSize: '24px', margin: 0, marginBottom: '20px' }}>
            Transactions {status === "success" ? "exitosas" : "fallidas"}
          </h5>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="row">
              <div className="col-md-6">
                <Form className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    style={{ width: "300px" }}
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                  />
                  {/* <Button variant="primary" onClick={() => setSearchUserId(searchUserId)}>Search</Button> */}
                </Form>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button
                className={status === "success" ? "btn-pay-now" : "btn-back"}
                onClick={() => setStatus("success")}>Success</Button>
              <Button
                className={status === "error" ? "btn-pay-now" : "btn-back"}
                onClick={() => setStatus("error")}>Error</Button>
            </div>
          </div>
        </div>

        <div style={{
          overflowX: 'visible',
          overflowY: 'visible',
          position: 'relative',
          zIndex: 1,
          margin: '0 -24px',
          width: '100%'
        }}>
          <div style={{ minWidth: '100%', padding: '0 24px', width: '135vh' }}>
            <table className="table-hl">
              <thead>
                <tr>
                  <th className="admin-table-header">User ID</th>
                  <th className="admin-table-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', position: 'relative' }}>
                      Trx Type
                      <Dropdown>
                        <Dropdown.Toggle variant="link" id="dropdown-trxtype" style={{ padding: 0, border: 'none', background: 'none' }}></Dropdown.Toggle>
                        <Dropdown.Menu style={{
                          maxHeight: '200px',
                          overflowY: 'scroll',
                          zIndex: 9999,
                          position: 'fixed',
                          top: 'calc(100% + 1px)',
                          left: '0',
                        }}>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("")} active={trxTypeFilter === ""}>All Types</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("purchaseBond")} active={trxTypeFilter === "purchaseBond"}>Purchase Bond</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("redeemBond")} active={trxTypeFilter === "redeemBond"}>Redeem Bond</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("callContractMethodController")} active={trxTypeFilter === "callContractMethodController"}>Call Contract Method</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("executeContractMethodController")} active={trxTypeFilter === "executeContractMethodController"}>Execute Contract Method</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("mintBond")} active={trxTypeFilter === "mintBond"}>Mint Bond</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("bridge")} active={trxTypeFilter === "bridge"}>Bridge</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("burn")} active={trxTypeFilter === "burn"}>Burn</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("createBond")} active={trxTypeFilter === "createBond"}>Create Bond</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("requestTransfer")} active={trxTypeFilter === "requestTransfer"}>Request Transfer</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("balance")} active={trxTypeFilter === "balance"}>Balance</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("getFaucetBalance")} active={trxTypeFilter === "getFaucetBalance"}>Get Faucet Balance</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("faucet")} active={trxTypeFilter === "faucet"}>Faucet</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("requestStable")} active={trxTypeFilter === "requestStable"}>Request Stable</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("createAccountMultiple")} active={trxTypeFilter === "createAccountMultiple"}>Create Account Multiple</Dropdown.Item>
                          <Dropdown.Item onClick={() => setTrxTypeFilter("createIndividualAccountRetry")} active={trxTypeFilter === "createIndividualAccountRetry"}>Create Individual Account Retry</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </th>
                  <th className="admin-table-header">Network</th>
                  <th className="admin-table-header">Date</th>
                  <th className="admin-table-header">trx id</th>
                </tr>
              </thead>
              <tbody>
                {status === "success" ? filteredTrxSuccess.length > 0 ? filteredTrxSuccess.map(trx =>
                  <tr key={trx._id}>
                    <td className="admin-table-cell" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trx.userId}</td>
                    <td className="admin-table-cell">{trx.trx_type}</td>
                    <td className="admin-table-cell">{trx.network}</td>
                    <td className="admin-table-cell">{new Date(trx.timestamp).toLocaleDateString()}</td>
                    <td className="admin-table-cell" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><a href={getPrefixedTrx(trx.network, trx.trx)} target="_blank" rel="noopener noreferrer">{trx.trx}</a></td>
                  </tr>)
                  :
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>No hay registros disponibles.</td>
                  </tr>
                  :
                  filteredTrxError.length > 0 ? filteredTrxError.map(trx =>
                    <tr key={trx._id}>
                      <td className="admin-table-cell" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trx.userId}</td>
                      <td className="admin-table-cell">{trx.trx_type}</td>
                      <td className="admin-table-cell">{trx.network}</td>
                      <td className="admin-table-cell">{new Date(trx.timestamp).toLocaleDateString()}</td>
                      <td className="admin-table-cell" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><a href={getPrefixedTrx(trx.network, trx.trx)} target="_blank" rel="noopener noreferrer">{trx.trx}</a></td>
                    </tr>
                  ) :
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center' }}>No hay registros disponibles.</td>
                    </tr>
                }
              </tbody>
            </table>
            {/* ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>No hay registros disponibles.</p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Admin;