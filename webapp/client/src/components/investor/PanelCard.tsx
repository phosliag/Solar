import React from "react";
import type { SolarPanel } from "../../SolarPanel";
import { useNavigate } from "react-router-dom";
import { Investor } from "../Authentication/InvestorRegistration";

const PanelCard: React.FC<{ solarPanel: SolarPanel, user: Investor, canBuy?: boolean }> = ({ solarPanel, user, canBuy = true }) => {
  const navigate = useNavigate()
  return (
    <div className="bond-card" style={{ width: 'fit-content' }}>
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
            <strong>Price:</strong>
            {typeof solarPanel.price === 'object' && '$numberDecimal' in solarPanel.price
              ? solarPanel.price.$numberDecimal : String(solarPanel.price)} €
          </li>
          <li className="card-text" style={{ whiteSpace: "nowrap" }}>
            <strong>Stimated Production:</strong> {solarPanel.stimatedProduction}
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
