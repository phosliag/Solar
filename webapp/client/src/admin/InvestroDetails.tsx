import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { faucetStable, updateInvestor } from "../features/userSlice";
import { Investor } from "../components/Authentication/InvestorRegistration";

const InvestorDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const [investor, setInvestor] = useState<Investor>(location.state?.investor);

  const [faucetAmount, setFaucetAmount] = useState<number>(0);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<string | null>(null);
  // Estado para mostrar ocultar el modal
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!investor) {
    return (
      <div className="container mt-4" style={{ color: 'var(--color-green-accent)' }}>
        Investor information not found for ID: {id}.
      </div>
    );
  }

  const handleFaucet = async () => {
    setFaucetLoading(true);
    setFaucetMessage(null);
    try {
      const response = await dispatch(faucetStable({ address: investor.walletAddress, amount: faucetAmount }));
      if (response.payload) {
        setFaucetMessage("Faucet successful!");
      } else {
        setFaucetMessage("Faucet failed.");
      }
    } catch (e) {
      setFaucetMessage("Faucet failed.");
    } finally {
      setFaucetLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };
  const handleSaveEdit = (updated: Partial<Investor>) => {
    // Actualiza los datos locales (puedes añadir lógica para guardarlo en backend)
    const updatedInv = { ...investor, ...updated };
    setInvestor(updatedInv);
    dispatch(updateInvestor(updatedInv))
    setEditModalOpen(false);
    // Aquí puedes hacer dispatch a Redux o llamar a la API según tu arquitectura
  };

  return (
    <div className="container d-flex justify-content-center">
      <div className="solar-panel-section mt-3 p-4" style={{ maxWidth: 680, position: 'relative' }}>
        {/* Edit button top right */}
        <button
          className="btn btn-pay-now position-absolute"
          style={{ top: 20, right: 20, zIndex: 2, padding: '0.5em 1em' }}
          onClick={handleEdit}
          title="Edit investor"
        >
          <span role="img" aria-label="edit">✏️</span> Edit
        </button>
        {editModalOpen &&
          <ModalEditInvestor
            investor={investor}
            onSave={handleSaveEdit}
            onClose={() => setEditModalOpen(false)}
          />
        }

        <h2 className="mb-4 text-center">Investor Details</h2>

        {/* Personal Identity */}
        <div className="mb-3">
          <h4 className="mb-2">Personal Identity</h4>
          <ul className="list-unstyled">
            <li>
              <strong>First Name:</strong> <em>{investor.name || "--"}</em>
            </li>
            <li>
              <strong>Last Name:</strong> <em>{investor.surname || "--"}</em>
            </li>
            <li>
              <strong>Country:</strong> <em>{investor.country || "--"}</em>
            </li>
            <li>
              <strong>ID:</strong> <em>{investor.idCard || "--"}</em>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="mb-3">
          <h4 className="mb-2">Contact</h4>
          <ul className="list-unstyled">
            <li>
              <strong>Email:</strong> <em>{investor.email || "--"}</em>
            </li>
          </ul>
        </div>

        {/* Blockchain & Others */}
        <div className="mb-3">
          <h4 className="mb-2">Blockchain & Others</h4>
          <ul className="list-unstyled">
            <li>
              <strong>Wallet:</strong> <em>{investor.walletAddress || "--"}</em>
            </li>
            {/* <li>
              <strong>Accounts:</strong> <em>{investor.accounts ? JSON.stringify(investor.accounts) : "--"}</em>
            </li> */}
          </ul>
          <div className="row align-items-end g-2 mt-2">
            <div className="col-auto">
              <label htmlFor="faucetAmount" className="form-label mb-0">Faucet Amount</label>
              <input
                id="faucetAmount"
                type="number"
                className="form-control"
                min={1}
                value={faucetAmount}
                onChange={e => setFaucetAmount(Number(e.target.value))}
                style={{ width: 120 }}
              />
            </div>
            <div className="col-auto">
              <button
                className="btn btn-pay-now"
                onClick={handleFaucet}
                disabled={faucetLoading || !faucetAmount || faucetAmount <= 0}
                type="button"
              >
                {faucetLoading ? "Sending..." : "Send Faucet"}
              </button>
            </div>
            {faucetMessage && (
              <div className="col-12 mt-2">
                <span className={faucetMessage.includes("success") ? "text-success" : "text-danger"}>{faucetMessage}</span>
              </div>
            )}
          </div>
        </div>

        <button
          className="btn btn-back mt-4 w-100"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

interface ModalEditInvestorProps {
  investor: Investor;
  onSave: (updated: Partial<Investor>) => void;
  onClose: () => void;
}

const ModalEditInvestor: React.FC<ModalEditInvestorProps> = ({
  investor,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState({
    name: investor.name,
    surname: investor.surname,
    idCard: investor.idCard,
    country: investor.country,
    email: investor.email,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div className="card p-4" style={{ minWidth: 350, position: 'relative' }}>
        <button onClick={onClose} className="btn-close position-absolute" style={{ top: 12, right: 12 }}></button>
        <h4>Edit Investor</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">First Name</label>
            <input name="name" className="form-control" value={form.name} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Last Name</label>
            <input name="surname" className="form-control" value={form.surname} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Country</label>
            <input name="country" className="form-control" value={form.country} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">ID</label>
            <input name="idCard" className="form-control" value={form.idCard} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-pay-now mt-2 w-100">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvestorDetails;
