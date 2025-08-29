import { useEffect } from 'react';
import '../App.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchPrecioLuz } from '../features/luzSlice';
import { useNavigate } from 'react-router-dom';

interface PrecioHora {
  hour: string;
  price: number;
  isNow: boolean;
}

function Lux() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate()
  const { precios, fecha, status, error } = useAppSelector((state) => state.luz);

  useEffect(() => {
    dispatch(fetchPrecioLuz());
  }, [dispatch]);

  let data: PrecioHora[] = [];
  let precioActual: number | null = null;

  if (precios && precios.length === 24) {
    const ahora = dayjs();
    const horaActual = ahora.hour();
    data = precios.map((precio: number, hora: number) => ({
      hour: `${hora}h`,
      price: precio * 1000, // Convertimos €/kWh a €/MWh para mantener el formato anterior
      isNow: hora === horaActual,
    }));
    precioActual = (data.find((v) => v.isNow)?.price ?? 0) / 1000;
  }

  return (
    <div style={{ padding: 20, width: '800px' }}>
      <h1>Electricity price per hour (€/kWh)</h1>
      {status === 'loading' ? (
        <p>Loading data...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        precios && precios.length === 24 ? (
          <>
            <p><strong>Date:</strong> {fecha}</p>
            <p><strong>Current time:</strong> {dayjs().format('HH:mm')}</p>
            <p><strong>Current price:</strong> {precioActual?.toFixed(2)} €/kWh</p>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip formatter={(value: any) => `${value.toFixed(2)} €/MWh`} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p>No data available.</p>
        )
      )}

      <div className="d-flex justify-content-end w-100 position-absolute top-0 end-0 p-3" style={{ zIndex: 10 }}>
        <button className="btn btn-back" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}

export default Lux;
