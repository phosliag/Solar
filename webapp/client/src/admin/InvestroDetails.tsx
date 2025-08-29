import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { faucetStable, updateInvestor } from "../features/userSlice";
import { Investor } from "../components/Authentication/InvestorRegistration";


const InvestorDetails: React.FC = () => {
  const location = useLocation() as { state: { investor: Investor; admin?: boolean } };
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const adminLogged = location.state.admin
  const [investor, setInvestor] = useState<Investor>(location.state?.investor);

  // Estados para el faucet
  const [faucetAmount, setFaucetAmount] = useState<number>(0);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<string | null>(null);

  // Estado para mostrar ocultar el modal
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Estado para documentos
  const [docFiles, setDocFiles] = useState<{ frontID?: File; backID?: File; residenceProof?: File }>({});
  const [docUploading, setDocUploading] = useState(false);
  const [docMessage, setDocMessage] = useState<string | null>(null);
  const [showDocValidation, setShowDocValidation] = useState(false);

  // Image previews
  const [previewFrontID, setPreviewFrontID] = useState<string | null>(null);
  const [previewBackID, setPreviewBackID] = useState<string | null>(null);
  const [previewResidenceProof, setPreviewResidenceProof] = useState<string | null>(null);
  if (!investor) {
    return (
      <div className="container mt-4" style={{ color: 'var(--color-green-accent)' }}>
        Investor information not found for ID: {id}.
      </div>
    );
  }

  // Faucet handling to add stablecoin
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
      console.error(e);
      setFaucetMessage("Faucet failed.");
    } finally {
      setFaucetLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };
  // Manejo de la edicion de datos del inversor
  const handleSaveEdit = (updated: Partial<Investor>) => {
    // Actualiza los datos locales (puedes añadir lógica para guardarlo en backend)
    const updatedInv = { ...investor, ...updated };
    setInvestor(updatedInv);
    dispatch(updateInvestor(updated))
    setEditModalOpen(false);
  };

  // Manejo de la actualizacion de las imagenes
  async function handleUpdateDoc() {
    setDocMessage(null);
    if (!investor?._id) {
      setDocMessage("Missing investor id");
      return;
    }
    if (!docFiles.frontID && !docFiles.backID && !docFiles.residenceProof) {
      setDocMessage("Please select at least one file");
      return;
    }
    try {
      setDocUploading(true);
      const response = await dispatch(updateInvestor({
        _id: investor._id,
        authImages: {
          ...(docFiles.frontID ? { frontID: docFiles.frontID } : {}),
          ...(docFiles.backID ? { backID: docFiles.backID } : {}),
          ...(docFiles.residenceProof ? { residenceProof: docFiles.residenceProof } : {}),
        }
      } as Partial<Investor>));
      if (response?.payload) {
        setDocMessage("Documents updated successfully");
        setInvestor(response.payload as Investor);
        setDocFiles({});
      } else {
        setDocMessage("Failed to update documents");
      }
    } catch (e) {
      console.error(e);
      setDocMessage("Failed to update documents");
    } finally {
      setDocUploading(false);
    }
  }

  return (
    <div className="container d-flex justify-content-center">
      <style>
        {`
          .file-input-wrapper {
            position: relative;
            width: 150px; /* ancho cuadrado deseado */
            height: 40px; /* alto cuadrado */
            border: 1px solid #ccc;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            display: inline-block;
          }
          .file-input-wrapper input[type="file"] {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            opacity: 0;
            cursor: pointer;
          } 
          .file-input-label {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            font-size: 14px;
            color: #666;
          }
        `}
      </style>
      <div className="d-flex justify-content-end w-100 position-absolute top-0 end-0 p-3" style={{ zIndex: 10 }}>
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
      <div className="solar-panel-section mt-3 p-4" style={{ position: 'relative' }}>


        <h2 className="mb-4 text-center">Investor Details</h2>

        {/* Personal Identity */}
        <div className="mb-3 card position-relative">
          <h4 className="mb-2">Personal Identity</h4>
          {/* Edit button top right */}
          <button
            className="btn btn-pay-now position-absolute"
            style={{ top: 20, right: 20, zIndex: 2, padding: '0.5em 1em' }}
            onClick={handleEdit}
            title="Edit investor"
          >
            <span role="img" aria-label="edit">✏️</span> Edit
          </button>
          {editModalOpen && <ModalEditInvestor investor={investor} onSave={handleSaveEdit} onClose={() => setEditModalOpen(false)} />}
          <ul className="list-unstyled" style={{ textAlign: 'left', marginLeft: '35px' }}>
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
        <div className="mb-3 card">
          <h4 className="mb-2">Contact</h4>
          <ul className="list-unstyled" style={{ textAlign: 'left', marginLeft: '35px' }}>
            <li>
              <strong>Email:</strong> <em>{investor.email || "--"}</em>
            </li>
          </ul>
        </div>

        {adminLogged && (
          <div className="mb-3 card">
            <div className="d-flex align-items-center w-100">
              <h4 className="mb-0">Document Validation</h4>
              <button
                className="btn btn-pay-now ms-auto"
                onClick={() => setShowDocValidation(v => !v)}
                type="button"
              >{showDocValidation ? 'Hide' : 'Review documents'}</button>
            </div>
            {showDocValidation && (
              <div className="mt-3">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Front ID</label>
                    {typeof (investor)?.authImages?.frontID === 'string' ? (
                      <a href={(investor).authImages.frontID as string} target="_blank" rel="noreferrer">
                        <img
                          src={(investor).authImages.frontID as string}
                          alt="Front ID"
                          style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
                        />
                      </a>
                    ) : (
                      <div className="text-muted">No image uploaded</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Back ID</label>
                    {typeof (investor)?.authImages?.backID === 'string' ? (
                      <a href={(investor).authImages.backID as string} target="_blank" rel="noreferrer">
                        <img
                          src={(investor).authImages.backID as string}
                          alt="Back ID"
                          style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
                        />
                      </a>
                    ) : (
                      <div className="text-muted">No image uploaded</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Proof of Residence</label>
                    {typeof (investor)?.authImages?.residenceProof === 'string' ? (
                      <a href={(investor).authImages.residenceProof as string} target="_blank" rel="noreferrer">
                        <img
                          src={(investor).authImages.residenceProof as string}
                          alt="Residence Proof"
                          style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
                        />
                      </a>
                    ) : (
                      <div className="text-muted">No image uploaded</div>
                    )}
                  </div>
                </div>
                <div className="form-check mt-3">
                  <input
                    id="docValidated"
                    className="form-check-input"
                    type="checkbox"
                    checked={Boolean((investor)?.authImages?.validated)}
                    onChange={(e) => setInvestor({ ...investor, authImages: { ...(investor)?.authImages, validated: e.target.checked } })}
                  />
                  <label className="form-check-label" htmlFor="docValidated">
                    Documents validated
                  </label>
                </div>
                <button
                  className="btn btn-pay-now mt-3"
                  onClick={async () => {
                    if (!investor?._id) return;
                    const res = await dispatch(updateInvestor({ _id: investor._id, authImages: { validated: Boolean((investor)?.authImages?.validated) } }));
                    if ((res)?.payload) setInvestor((res).payload as Investor);
                  }}
                  type="button"
                >Save Validation</button>
              </div>
            )}
          </div>
        )}

        {/* Blockchain & Others */}
        <div className="mb-3 card">
          <h4 className="mb-2">Blockchain & Others</h4>
          <ul className="list-unstyled" style={{ textAlign: 'left', marginLeft: '35px' }}>
            <li>
              <strong>Wallet:</strong> <em>{investor.walletAddress || "--"}</em>
            </li>
            {/* <li>
              <strong>Accounts:</strong> <em>{investor.accounts ? JSON.stringify(investor.accounts) : "--"}</em>
            </li> */}
          </ul>

        </div>
        {adminLogged &&
          <div className="row g-2 mt-2 card">
            <div className="col-12 d-flex align-items-center g-2">
              <label htmlFor="faucetAmount" className="form-label mb-0 me-2" style={{ whiteSpace: 'nowrap' }}>
                Faucet Amount
              </label>
              <input id="faucetAmount" type="number" className="form-control me-2" min={1}
                value={faucetAmount} onChange={e => setFaucetAmount(Number(e.target.value))} style={{ width: 150 }} />
              <button className="btn btn-pay-now" onClick={handleFaucet}
                disabled={faucetLoading || !faucetAmount || faucetAmount <= 0} type="button">
                {faucetLoading ? "Sending..." : "Send Faucet"}
              </button>
            </div>
            {faucetMessage && (
              <div className="col-12 mt-2">
                <span className={faucetMessage.includes("success") ? "text-success" : "text-danger"}>{faucetMessage}</span>
              </div>
            )}
          </div>
        }

        {!adminLogged &&
          <div className="card">
            <h4 className="mb-3">Documents</h4>
            {/* <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Front ID</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setDocFiles(prev => ({ ...prev, frontID: f }));
                  }}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Back ID</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setDocFiles(prev => ({ ...prev, backID: f }));
                  }}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Proof of Residence</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setDocFiles(prev => ({ ...prev, residenceProof: f }));
                  }}
                />
              </div>
            </div> */}

            <div className="row g-3">
              {/* Front ID */}
              <div className="col-md-4 image-update">
                <label className="form-label">Front ID</label><br />
                <label htmlFor="front-id-upload" className="upload-label">
                  <img className="upload-preview"
                    src={previewFrontID || "/images/icons8-add-image-96.png"}
                    alt="Front ID" />
                </label>
                <input id="front-id-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setDocFiles((prev) => ({ ...prev, frontID: f }));
                      setPreviewFrontID(URL.createObjectURL(f));
                    }
                  }}
                />
              </div>

              {/* Back ID */}
              <div className="col-md-4 image-update">
                <label className="form-label">Back ID</label><br />
                <label htmlFor="back-id-upload" className="upload-label">
                  <img className="upload-preview"
                    src={previewBackID || "/images/icons8-add-image-96.png"}
                    alt="Back ID" />
                </label>
                <input id="back-id-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setDocFiles((prev) => ({ ...prev, backID: f }));
                      setPreviewBackID(URL.createObjectURL(f));
                    }
                  }}
                />
              </div>

              {/* Proof of Residence */}
              <div className="col-md-4 image-update">
                <label className="form-label">Proof of Residence</label><br />
                <label htmlFor="residence-proof-upload" className="upload-label">
                  <img className="upload-preview"
                    src={previewResidenceProof || "/images/icons8-add-image-96.png"}
                    alt="Proof of Residence" />
                </label>
                <input id="residence-proof-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setDocFiles((prev) => ({ ...prev, residenceProof: f }));
                      setPreviewResidenceProof(URL.createObjectURL(f));
                    }
                  }}
                />
              </div>
            </div>

            <button
              className="btn btn-pay-now mt-4 w-100"
              onClick={handleUpdateDoc}
              disabled={docUploading}
            >
              {docUploading ? "Updating..." : "Update"}
            </button>
            {docMessage && (
              <div className="mt-2">
                <span className={docMessage.includes("success") ? "text-success" : "text-danger"}>{docMessage}</span>
              </div>
            )}
          </div>
        }
      </div>
    </div >
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
    _id: investor._id,
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
