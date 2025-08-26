import React from "react";
import type { SolarPanel } from "../../SolarPanel";
import { useNavigate } from "react-router-dom";
import { Investor } from "../Authentication/InvestorRegistration";

const PanelCard: React.FC<{ solarPanel: SolarPanel, user: Investor, canBuy?: boolean }> = ({ solarPanel, user, canBuy = true }) => {
  const navigate = useNavigate()
  const getNumericPrice = (panel: any): number | undefined => {
    const raw = panel?.price;
    if (raw && typeof raw === "object" && typeof (raw as any).$numberDecimal === "string") {
      const dec = Number((raw as any).$numberDecimal);
      return Number.isFinite(dec) ? dec : undefined;
    }
    const num = Number(raw);
    return Number.isFinite(num) ? num : undefined;
  };

  const getInstalledDate = (panel: any): string | undefined => {
    const d = panel?.installationDate ?? panel?.installedAt ?? panel?.createdAt;
    if (!d) return undefined;
    const date = new Date(d);
    return isNaN(date.getTime()) ? undefined : date.toLocaleDateString();
  };
  return (
    <div className="panel-card" style={{ width: 'fit-content' }}>
      <div className="card-body pt-0">
        <p className="card-title" style={{ color: "var(--color-green-accent)", marginBottom: "1rem" }}>
          {solarPanel.name} - {solarPanel.reference}
        </p>
        <ul className="text-start p-0">
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Location:</strong> {solarPanel.location}
          </li>
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>State:</strong> {solarPanel.state}
          </li>
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Current Price:</strong> {getNumericPrice(solarPanel) ?? "-"} €
          </li>
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Est. Production:</strong> {solarPanel.stimatedProduction ?? "-"} kWh
          </li>
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Installed:</strong> {getInstalledDate(solarPanel) ?? (solarPanel.installationYear ?? "-")}
          </li>
        </ul>

        <button className="btn btn-pay-now" disabled={!canBuy} onClick={() => navigate(`/purchase-details/${solarPanel._id}`, { state: { solarPanel, user } })}>
          See More
        </button>
      </div>
    </div>
  );
};

export default PanelCard;
