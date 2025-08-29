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
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    dispatch(getTrxSuccess());
    dispatch(getTrxError());
  }, [dispatch]);

  // Reset page when filters/status cambian
  useEffect(() => {
    setPage(1);
  }, [status, trxTypeFilter, searchUserId]);

  const filteredTrx = (status === "success" ? trxSuccess : trxError)
    .filter(trx => trxTypeFilter ? trx.trx_type === trxTypeFilter : true)
    .filter(trx => searchUserId ? trx.userId.includes(searchUserId) : true);

  const totalItems = filteredTrx.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTrx = filteredTrx.slice((currentPage - 1) * PAGE_SIZE, (currentPage - 1) * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <div className="solar-panel-section">
        <div className="d-flex justify-content-end w-100 position-absolute top-0 end-0 p-3" style={{ zIndex: 10 }}>
          <button className="btn btn-back" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
        <h1 className="section-title mb-3" style={{ textAlign: "center" }}>
          {status === "success" ? "Successful" : "Failed"} Transactions
        </h1>
        {/* Search filter */}
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

        {/* Table */}
        <div style={{ overflowX: 'visible', position: 'relative', zIndex: 1, margin: '0 -24px' }}>
          <div style={{ padding: '0 24px' }}>
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
                            "purchase", "redeem", "callContractMethodController",
                            "executeContractMethodController", "create",
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
                {paginatedTrx.length > 0 ? (
                  paginatedTrx.map(trx => (
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
        {/* Pagination Controls */}
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
      </div>
    </>
  );
};

export default TransactionTable;
