import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AdminState {
  trxSuccess: any[],
  trxError: any[],
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null,
}

const initialState: AdminState = {
  trxSuccess: [],
  trxError: [],
  status: 'idle',
  error: null,
}

export const getTrxSuccess = createAsyncThunk("admin/getTrxSuccess", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/trx-success`, { method: "GET" });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getTrxError = createAsyncThunk("admin/getTrxError", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/trx-error`, { method: "GET" });

    if (!response.ok) {
      // const error = await response.json();
      // return rejectWithValue(error.message);
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTrxSuccess.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTrxSuccess.fulfilled, (state, action) => {
        state.trxSuccess = action.payload;
      })
      .addCase(getTrxSuccess.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error as string;
      })
      .addCase(getTrxError.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTrxError.fulfilled, (state, action) => {
        state.trxError = action.payload;
      })
      .addCase(getTrxError.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error as string;
      });
  },
});

export const { } = adminSlice.actions;
export default adminSlice.reducer;
