import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { readInvestors } from "../features/userSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";

const InvestorList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { investors, status, error } = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(readInvestors());
  }, [dispatch]);

  if (status === "loading") return <p>Cargando inversores...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div>
      <h2 style={{ color: "var(--color-green-accent)", marginBottom: "1.6rem" }}>Lista de Inversores</h2>
      <div className="solar-panel-section">
        <table className="table-hl">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>País</th>
              <th>Ver Detalle</th>
            </tr>
          </thead>
          <tbody>
            {investors.map((investor) => (
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
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {investors.length === 0 && <p style={{ color: "var(--color-green-accent)" }}>No hay inversores disponibles.</p>}

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
