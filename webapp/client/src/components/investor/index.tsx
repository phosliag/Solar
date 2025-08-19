import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useEffect, useMemo } from "react";
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

  const validated = useMemo(() => user?.authImages?.validated === true, [user?.authImages?.validated]);

  const { shouldShowNotice, noticeMessage } = useMemo(() => {
    const hasValue = (v: any) => v !== undefined && v !== null && String(v).trim() !== "";
    const missingData: string[] = [];
    const missingImages: string[] = [];

    if (!hasValue(user?.country)) missingData.push("your country");
    if (!hasValue(user?.idCard)) missingData.push("your ID card number");

    const images = user?.authImages as any;
    if (!hasValue(images?.frontID)) missingImages.push("front ID image");
    if (!hasValue(images?.backID)) missingImages.push("back ID image");
    if (!hasValue(images?.residenceProof)) missingImages.push("proof of residence");

    const formatList = (items: string[]) => {
      if (items.length === 0) return "";
      if (items.length === 1) return items[0];
      if (items.length === 2) return `${items[0]} and ${items[1]}`;
      return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
    };

    if (validated) {
      return { shouldShowNotice: false, noticeMessage: "" };
    }

    const parts: string[] = [];
    if (missingData.length > 0) parts.push(`add ${formatList(missingData)}`);
    if (missingImages.length > 0) parts.push(`upload ${formatList(missingImages)}`);

    const message = parts.length > 0
      ? `To invest, please ${parts.join("; ")}. Once submitted, your identity will be reviewed. Investing will be enabled after validation.`
      : `Your identity verification is pending approval. Investing will be enabled once approved.`;

    return {
      shouldShowNotice: true,
      noticeMessage: message,
    };
  }, [user, validated]);

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
              <Dropdown.Toggle as="button" variant="" className="d-flex gap-2 border-0 bg-transparent p-0 " id="dropdown-avatar">
                <img
                  src={"/images/user.png"} // Imagen del usuario o fallback
                  alt="User"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover", border: "2px solid var(--color-green-main)" }}
                />
                {user?.name}
              </Dropdown.Toggle>

              <Dropdown.Menu align="end" style={{ backgroundColor: "var(--color-bg)", border: "none" }}>
                <Dropdown.Item className="btn btn-pay-now" onClick={() => navigate("/investor-wallet")}>My Investor Wallet</Dropdown.Item>
                <Dropdown.Item className="btn btn-pay-now" onClick={() => navigate("/my-panels")}>My Panels & Production</Dropdown.Item>
                <Dropdown.Item className="btn btn-pay-now" onClick={() => navigate(`/investor/${user?._id}`, { state: { investor: user } })}>Details</Dropdown.Item>
                <Dropdown.Item className="btn btn-back" onClick={() => navigate("/user-access")}>Log out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="container-md d-flex flex-column align-items-center mr-3 ml-3">
            {shouldShowNotice && (
              <div className="alert alert-warning w-100" role="alert">
                {noticeMessage}
              </div>
            )}
            <h1 className="m-5 align-self-start" style={{ color: "var(--color-green-main)" }}>Available Panels :</h1>
            <div className="row">
              {panels && panels.filter(panel => !panel.owner).length > 0 ? (
                panels.filter(panel => !panel.owner).map((panel) => (
                  <div key={panel._id} className="col-md-6">
                    <PanelCard solarPanel={panel} user={user!} canBuy={user?.authImages?.validated} />
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
