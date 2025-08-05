// InvestorList.tsx
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
  }, []);

  if (status === "loading") return <p>Cargando inversores...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Lista de Inversores</h2>
      <ul>
        {investors.map(investor => (
          <li
            key={investor._id}
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/investor/${investor._id}`, { state: { investor } })
            }
          >
            {investor.name} {investor.surname} ({investor.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvestorList;
