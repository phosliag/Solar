import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { readPanels } from "../features/solarPanelSlice";
import { useNavigate } from "react-router-dom";
import { SolarPanel } from "../SolarPanel";

const Manage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const panels = useAppSelector((state) => state.solarPanel.panels);
  const userLoged = useAppSelector((state) => state.user.userLoged);
  const userId = userLoged?._id;

  useEffect(() => {
    document.title = "Manage panels";
    dispatch(readPanels());
  }, [dispatch]);

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ height: "100vh"}}>
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
            {panels?.map((panel: SolarPanel, index: number) => (
              <tr key={index}>
                <td className="p-3 fst-italic" onClick={() => navigate(`/panel-details`,  { state: { panelData: panel} })}>{panel.name}</td>
                <td className="p-3">{panel.state}</td>
                <td className="p-3 fst-italic">{panel.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="container-md row m-3" style={{ display: "flex", justifyContent: "end", gap: "20px" }}>
          <button
            type="button"
            className="btn btn-back col-sm-2"
            onClick={() => navigate("/admin-dash")}>
            Back 
          </button>
        </div>
      </div>
    </div>
  );
};

export default Manage;
