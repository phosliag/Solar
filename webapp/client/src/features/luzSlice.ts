import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface LuzState {
  precios: number[] | null;
  fecha: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: LuzState = {
  precios: null,
  fecha: null,
  status: "idle",
  error: null,
};

export const fetchPrecioLuz = createAsyncThunk(
  "luz/fetchPrecioLuz",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/luz/precio", { method: "GET" });
      if (!response.ok) {
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }
      const data = await response.json();
      // data: { fecha: string, precios: number[] }
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message || "Error en la red");
    }
  }
);

const luzSlice = createSlice({
  name: "luz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrecioLuz.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPrecioLuz.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.precios = action.payload.precios;
        state.fecha = action.payload.fecha;
        state.error = null;
      })
      .addCase(fetchPrecioLuz.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default luzSlice.reducer; 