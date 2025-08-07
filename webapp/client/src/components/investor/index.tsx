import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect } from "react";
import { getRetailMarketPanels } from "../../features/solarPanelSlice";
import PanelCard from "./PanelCard";
import { Dropdown } from "react-bootstrap";

const Oportunities = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const panels = useAppSelector((state) => state.bond.bonds);
  const panels = useAppSelector((state) => state.solarPanel.retailMarketPanels);
  const user = useAppSelector((state) => state.user.userLoged);

  useEffect(() => {
    document.title = "Investor";
    dispatch(getRetailMarketPanels())
  }, [dispatch]);

  console.log(user);
  console.log(panels);
  return (
    <>
      <div className="container mt-3 ">
        <div className="solar-panel-section mt-3 d-flex justify-content-center align-items-center" style={{ minWidth: "100vh" }}>
          <div className="position-absolute top-0 end-0 m-3">
            {/* <button className="btn btn-pay-now me-2" onClick={() => navigate("/investor-wallet")}>My investor Wallet</button>
            <button className="btn btn-pay-now me-2" onClick={() => navigate("/my-panels")}>My Panels & Production</button>
            <button className="btn btn-back" onClick={() => navigate("/user-access")}>Log out</button> */}
            <Dropdown>
              {/* <Dropdown.Toggle  id="dropdown-basic" className="btn border-0 shadow-none">
                <i className="bi bi-three-dots-vertical fs-4"></i> 
              </Dropdown.Toggle> */}
              <Dropdown.Toggle as="button" variant="" className="border-0 bg-transparent p-0" id="dropdown-avatar">
                <img
                  src={"/images/user.png"} // Imagen del usuario o fallback
                  alt="User"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover", border: "2px solid var(--color-green-main)" }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={() => navigate("/investor-wallet")}>My Investor Wallet</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/my-panels")}>My Panels & Production</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/user-access")}>Log out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="container-md d-flex flex-column align-items-center mr-3 ml-3">
            <h1 className="m-5 align-self-start" style={{ color: "var(--color-green-main)" }}>Available Panels :</h1>
            <div className="row">
              {panels && panels.filter(panel => !panel.owner).length > 0 ? (
                panels.filter(panel => !panel.owner).map((panel) => (
                  <div key={panel._id} className="col-md-6">
                    <PanelCard solarPanel={panel} user={user!} />
                  </div>
                ))
              ) : (
                <div className="col-md-12 text-center">
                  <p>No available panels for investment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Oportunities;
