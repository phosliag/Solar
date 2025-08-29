import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { readPanels } from "../features/solarPanelSlice";
import { useNavigate } from "react-router-dom";
import { SolarPanel } from "../SolarPanel";

const Manage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const panels = useAppSelector((state) => state.solarPanel.panels);

  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    document.title = "Manage panels";
    dispatch(readPanels());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [panels]);

  const totalItems = panels?.length ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems]);

  const currentPage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

  const paginatedPanels = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return (panels ?? []).slice(start, end);
  }, [panels, currentPage]);

  return (
    <div
      className="container-fluid d-flex justify-content-center"
      style={{ alignSelf: "flex-start", width: "100%", paddingTop: "2rem" }}>
      <div className="d-flex justify-content-end w-100 position-absolute top-0 end-0 p-3" style={{ zIndex: 10 }}>
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
      <div className="solar-panel-section mt-3" style={{ maxWidth: '1350px', width: '80vw' }}>
        <h1 className="text-center mb-5 fw-bold">MANAGE MY PANELS</h1>

        <div className="d-flex justify-content-center gap-5 mb-5 ms-4">
          <button className="btn btn-pay-now btn-lg p-3" onClick={() => navigate("/add-to-market")}>ADD TO RETAIL MARKET</button>
          <button className="btn btn-pay-now btn-lg p-3" onClick={() => navigate("/investor-registration")}>ADD INVESTOR</button>
          <button className="btn btn-back btn-lg p-3" onClick={() => navigate("/holder-list")}>INVESTOR LIST</button>
        </div>

        <h2 className="fst-italic text-center mb-4">Available Panels in my Wallet:</h2>

        <table className="table-hl text-center">
          <thead className="admin-table-header">
            <tr>
              <th className="p-3">Panel Ref</th>
              <th className="p-3">State</th>
              <th className="p-3">Owner</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPanels.map((panel: SolarPanel, index: number) => (
              <tr key={index}>
                <td className="p-3 fst-italic" onClick={() => navigate(`/panel-details`, { state: { panelData: panel } })}>{panel.name}</td>
                <td className="p-3">{panel.state}</td>
                <td className="p-3 fst-italic">{panel.owner}</td>
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
      </div>
    </div>
  );
};

export default Manage;
