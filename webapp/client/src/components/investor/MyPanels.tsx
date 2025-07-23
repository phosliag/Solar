import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import csvText from '../../2025.csv?raw';
import React, { useEffect } from "react";
import { readPanels } from '../../features/solarPanelSlice';
import { useNavigate } from "react-router-dom";

const getPanelProduction = (plateId: string) => {
  const text = csvText;
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const data = lines.slice(1)
    .map(line => line.split(","))
    .filter(cols => {
      if (cols.length < 26) return false;
      return cols[0].trim().toLowerCase() === plateId.trim().toLowerCase();
    })
    .map(cols => ({
      date: cols[1],
      total: cols.slice(2).reduce((sum, val) => sum + parseFloat(val || "0"), 0)
    }));
  const sorted = data.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).reverse();
  const avg = sorted.length > 0 ? sorted.reduce((sum, d) => sum + d.total, 0) / sorted.length : null;
  return { sorted, avg };
};

const MyPanels = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userLoged);
  const allPanels = useAppSelector((state) => state.solarPanel.panels) || [];
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "My Panels";
    dispatch(readPanels());
  }, [dispatch]);

  // Filtrar paneles cuyo owner sea igual al _id del usuario logueado
  const panels = user && user._id ? allPanels.filter((panel: any) => panel.owner === user._id) : [];

  return (
    <div className="container mt-3">
      <div className="solar-panel-section mt-3 p-4">
        <div className="position-absolute top-0 end-0 m-3">
          <button className="btn btn-back" onClick={() => navigate(-1)}>Back</button>
        </div>
        <h2 className="mb-4">My Panels & Production</h2>
        {panels.length === 0 ? (
          <div>No tienes placas compradas.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {panels.map((panel: any) => {
              const { sorted, avg } = getPanelProduction(panel.reference || panel._id);
              return (
                <div key={panel._id} className="mb-5" style={{ minWidth: 500, width: "100%", flex: '0 0 auto', border: '1px solid #eee', borderRadius: 8, padding: 24 }}>
                  <h4>{panel.name || panel.reference || panel._id} - {panel.reference}</h4>
                  {avg !== null ? (
                    <>
                      <div><strong>Media diaria:</strong> <em>{avg.toFixed(2)} kWh</em></div>
                      <div style={{ width: "100%", height: 250 }}>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={sorted} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value} kWh`} />
                            <Bar dataKey="total" fill="#82ca9d" name="Producción diaria (kWh)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    <div>No hay datos de producción para esta placa.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPanels; 