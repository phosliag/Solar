import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { readPanels } from '../../features/solarPanelSlice';
import { useNavigate } from "react-router-dom";

type ProductionRecord = { Fecha: string; Produccion_Monocristalina_kWh: number };

const getCsvUrlForYear = (year: string) => `/mockPlacas/produccion_placas_luz_${year}.csv`;

async function fetchAndParseCsv(url: string): Promise<ProductionRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          reject(results.errors);
        } else {
          const rows = (results.data as any[]).map((r) => ({
            Fecha: String(r["Fecha"]),
            Produccion_Monocristalina_kWh: Number(r["Produccion_Monocristalina_kWh"]) || 0,
          }));
          resolve(rows);
        }
      },
      error: (error) => reject(error),
    });
  });
}

function buildLast30(records: ProductionRecord[]): { data: { date: string; total: number }[]; avg: number | null } {
  // Crear un mapa por MM-DD -> kWh usando el CSV (ignora el año)
  const monthDayToKwh: Record<string, number> = {};
  for (const r of records) {
    if (!r.Fecha) continue;
    const d = new Date(r.Fecha);
    if (isNaN(d.getTime())) continue;
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    monthDayToKwh[key] = Number(r.Produccion_Monocristalina_kWh) || 0;
  }

  // Construir los últimos 30 días desde hoy usando el mapa por mes-día
  const today = new Date();
  const series: { date: string; total: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const val = monthDayToKwh[key] ?? 0;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    series.push({ date: iso, total: val });
  }

  const avg = series.length > 0 ? series.reduce((s, p) => s + p.total, 0) / series.length : null;
  return { data: series, avg };
}


const MyPanels = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userLoged);
  const allPanels = useAppSelector((state) => state.solarPanel.panels) || [];
  const navigate = useNavigate();
  const [recordsByYear, setRecordsByYear] = useState<Record<string, ProductionRecord[]>>({});
  // sin toggle aquí; la gráfica se muestra siempre

  useEffect(() => {
    document.title = "My Panels";
    dispatch(readPanels());
  }, [dispatch]);

  // Filtrar paneles cuyo owner sea igual al _id del usuario logueado
  const panels = user && user._id ? allPanels.filter((panel: any) => panel.owner === user._id) : [];
  console.log(panels)

  // Cargar CSVs necesarios según los años de instalación de los paneles del usuario
  useEffect(() => {
    const run = async () => {
      if (!panels || panels.length === 0) {
        setRecordsByYear({});
        return;
      }
      // no-op
      try {
        const years = Array.from(
          new Set(
            panels.map((p: any) => (p.installationYear ?? Number(String(p.name).slice(0, 4)) ?? new Date().getFullYear())).map(String)
          )
        );
        const fetched = await Promise.all(
          years.map(async (y) => {
            const recs = await fetchAndParseCsv(getCsvUrlForYear(y));
            return [y, recs] as [string, ProductionRecord[]];
          })
        );
        setRecordsByYear(Object.fromEntries(fetched));
      } catch (e: any) {
        console.error("Error cargando producción:", e);
        setRecordsByYear({});
      } finally {
        // no-op
      }
    };
    run();
  }, [panels]);

  const panelIdToSeries = useMemo(() => {
    const map: Record<string, { data: { date: string; total: number }[]; avg: number | null }> = {};
    for (const p of panels as any[]) {
      const inferredYear = (p.installationYear ?? Number(String(p.name).slice(0, 4))) || new Date().getFullYear();
      const recs = recordsByYear[String(inferredYear)] || [];
      map[p._id] = buildLast30(recs);
    }
    return map;
  }, [panels, recordsByYear]);

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', overflowX: 'hidden', paddingBottom: '1rem' }}>
            {panels.map((panel: any) => {
              const series = panelIdToSeries[panel._id] || { data: [], avg: null };
              return (
                <div key={panel._id} className="mb-5" style={{ minWidth: 500, width: "100%", flex: '0 0 auto' }}>
                  <div className="card p-3" style={{ borderRadius: 8 }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0" onClick={() => navigate(`/panel-details`,  { state: { panelData: panel} })}>{panel.name || panel.reference || panel._id} - {panel.reference}</h4>
                    </div>
                    <div className="mt-3">
                      {series.avg !== null && series.data.length > 0 ? (
                        <>
                          <div className="mb-2"><strong>Media diaria:</strong> <em>{series.avg.toFixed(2)} kWh</em></div>
                          <div style={{ width: "100%", height: 250 }}>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={series.data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
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
                  </div>
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