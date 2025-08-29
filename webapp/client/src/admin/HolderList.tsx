import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import { readPanelInvestors } from "../features/solarPanelSlice";

const HolderList = () => {
  const users = useAppSelector((state) => state.solarPanel.panelInvestors) || [];
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(readPanelInvestors());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const filteredUsers = users.filter((user) => (user.userId || "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div
      className="solar-panel-section mt-3"
      style={{ maxWidth: "1200px", width: "90vw", margin: "2rem auto" }}
    >
      <h2 style={{ textAlign: "center" }}>INVESTOR LIST</h2>

      <h3 className="section-title mt-4">Upcoming payments</h3>
      <div className="mb-4 col-4">
        {/* <label className="mr-2 font-bold">Buscar por User ID:</label> */}
        <input
          type="text"
          className="form-control bg-form"
          placeholder="Search by Investor ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table className="table-hl" border={1}>
        <thead className="admin-table-header">
          <tr>
            <th>Panel Investor ID</th>
            <th>Panel Reference</th>
            
          </tr>
        </thead>
        <tbody>
          {filteredUsers?.map((user) => (
            <tr key={user._id}>
              <td>{user.userId}</td>
              <td>{user.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-end w-100 position-absolute top-0 end-0 p-3" style={{ zIndex: 10 }}>
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default HolderList;
