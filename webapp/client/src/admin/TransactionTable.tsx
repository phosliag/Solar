// components/TransactionTable.tsx
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getTrxSuccess, getTrxError } from "../features/adminSlice";
import { Dropdown, Button, Form } from "react-bootstrap";

const TransactionTable = () => {
  const dispatch = useAppDispatch();
  const { trxSuccess, trxError } = useAppSelector(state => state.admin);

  const [status, setStatus] = useState<"success" | "error">("success");
  const [trxTypeFilter, setTrxTypeFilter] = useState<string>("");
  const [searchUserId, setSearchUserId] = useState<string>("");

  useEffect(() => {
    dispatch(getTrxSuccess());
    dispatch(getTrxError());
  }, [dispatch]);

  const filteredTrx = (status === "success" ? trxSuccess : trxError)
    .filter(trx => trxTypeFilter ? trx.trx_type === trxTypeFilter : true)
    .filter(trx => searchUserId ? trx.userId.includes(searchUserId) : true);

  return (
    <>
      <div className="mb-4">
        <h1 className="section-title" style={{ fontSize: '24px', marginBottom: '20px' }}>
          {status === "success" ? "Successful" : "Failed"} Transactions
        </h1>

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
              </Form>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Button
              className={status === "success" ? "btn-pay-now" : "btn-back"}
              onClick={() => setStatus("success")}
            >Success</Button>
            <Button
              className={status === "error" ? "btn-pay-now" : "btn-back"}
              onClick={() => setStatus("error")}
            >Error</Button>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'visible', position: 'relative', zIndex: 1, margin: '0 -24px', width: '100%' }}>
        <div style={{ minWidth: '100%', padding: '0 24px', width: '135vh' }}>
          <table className="table-hl">
            <thead>
              <tr>
                <th className="admin-table-header">User ID</th>
                <th className="admin-table-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    Trx Type
                    <Dropdown>
                      <Dropdown.Toggle variant="link" style={{ padding: 0, border: 'none', background: 'none' }} />
                      <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'scroll', zIndex: 9999 }}>
                        <Dropdown.Item onClick={() => setTrxTypeFilter("")} active={trxTypeFilter === ""}>All Types</Dropdown.Item>
                        {[
                          "purchaseBond", "redeemBond", "callContractMethodController",
                          "executeContractMethodController", "mintBond", "createBond",
                          "requestTransfer", "balance", "getFaucetBalance",
                          "faucet", "requestStable", "createAccount"
                        ].map(type => (
                          <Dropdown.Item
                            key={type}
                            onClick={() => setTrxTypeFilter(type)}
                            active={trxTypeFilter === type}
                          >
                            {type}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </th>
                <th className="admin-table-header" style={{ width: "100px" }}>Date</th>
                <th className="admin-table-header">trx id</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrx.length > 0 ? (
                filteredTrx.map(trx => (
                  <tr key={trx._id}>
                    <td className="admin-table-cell">{trx.userId}</td>
                    <td className="admin-table-cell">{trx.trx_type}</td>
                    <td className="admin-table-cell" style={{ width: "100px" }}>{new Date(trx.timestamp).toLocaleDateString()}</td>
                    <td className="admin-table-cell">
                      <a
                        href={`https://b-network.alastria.izer.tech/tx/${trx.trx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {trx.trx}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No hay registros disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TransactionTable;
