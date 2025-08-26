import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readInvestors } from "../features/userSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";

const InvestorList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { investors, status, error } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    dispatch(readInvestors());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [investors]);

  const totalItems = investors?.length ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems]);
  const currentPage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);
  const paginatedInvestors = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return (investors ?? []).slice(start, end);
  }, [investors, currentPage]);

  if (status === "loading") return <p>Loading investors...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div>
      <h2 style={{ color: "var(--color-green-accent)", marginBottom: "1.6rem" }}>Investor List</h2>
      <div className="solar-panel-section">
        <table className="table-hl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Last name</th>
              <th>Email</th>
              <th>Country</th>
              <th>View details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvestors.map((investor) => (
              <tr key={investor._id}>
                <td>{investor.name}</td>
                <td>{investor.surname}</td>
                <td>{investor.email}</td>
                <td>{investor.country}</td>
                <td>
                  <button
                    className="btn"
                    onClick={() =>
                      navigate(`/investor/${investor._id}`, { state: { investor, admin: true } })
                    }
                  >
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {investors.length === 0 && <p style={{ color: "var(--color-green-accent)" }}>No investors available.</p>}

        {investors.length > 0 && (
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
        )}

        <button
          className="btn btn-back mt-4 w-100"
          onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default InvestorList;
