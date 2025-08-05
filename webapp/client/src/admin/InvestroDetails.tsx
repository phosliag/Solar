// InvestorDetail.tsx
import React from "react";
import { useLocation, useParams } from "react-router-dom";

const InvestorDetails: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  // Preferimos el dato pasado por state, pero podrías hacer fetch por ID si no existe.
  const investor = location.state?.investor;

  if (!investor) {
    return <div>No se encontró la información del inversor con ID: {id}.</div>;
  }

  return (
    <div>
      <h2>Detalle de Inversor</h2>
      <ul>
        <li>Nombre: {investor.name}</li>
        <li>Apellido: {investor.surname}</li>
        <li>País: {investor.country}</li>
        <li>ID: {investor.idCard}</li>
        <li>Email: {investor.email}</li>
        <li>Wallet: {investor.walletAddress || "--"}</li>
      </ul>
    </div>
  );
};

export default InvestorDetails;
