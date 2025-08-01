import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SolarPanel } from "../SolarPanel";

interface SolarPanelState {
  panels: SolarPanel[] | null;
  retailMarketPanels: any[] | null;
  panelInvestors: any[] | null;
  tokenList: any[] | null;
  upcomingPayment: any[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
}

const initialState: SolarPanelState = {
  panels: null,
  retailMarketPanels: null,
  panelInvestors: null,
  tokenList: null,
  upcomingPayment: null,
  status: "idle",
  error: undefined,
};

export const readPanels = createAsyncThunk("solarPanel/readPanels", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/solar-panels`, { method: "GET" });
    if (!response.ok) {
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }
    const data = await response.json();
    return data as SolarPanel[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const newPanel = createAsyncThunk("solarPanel/createPanel", async (formData: SolarPanel, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/create-solar-panels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
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

export const updatePanel = createAsyncThunk("solarPanel/updatePanel", async (formData: SolarPanel, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/update-solar-panels/${formData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
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

export const deletePanel = createAsyncThunk("solarPanel/deletePanel", async (id: String, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/delete-solar-panels/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
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

// --- RETAIL MARKET SOLAR PANEL LOGIC ---
export const getRetailMarketPanels = createAsyncThunk("retailMarket/getAll", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/retail-market", { method: "GET" });
    if (!response.ok) {
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

export const addRetailMarketPanel = createAsyncThunk("retailMarket/add", async (formData: { reference: string; location: string; owner?: string }, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/retail-market", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
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

// --- REGISTER PURCHASE PANEL LOGIC ---
export const registerPurchase = createAsyncThunk("solarPanel/registerPurchase", async (userData: { userId: string; reference: string }, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/register-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
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

// --- READ PANEL INVESTORS LOGIC ---
export const readPanelInvestors = createAsyncThunk("solarPanel/readPanelInvestors", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/panel-investors", { method: "GET" });
    if (!response.ok) {
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

// --- GET TOKEN LIST AND UPCOMING PAYMENTS BY ISSUER ---
export const getTokenListAndUpcomingPaymentsByIssuer = createAsyncThunk(
  "solarPanel/getTokenListAndUpcomingPaymentsByIssuer",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/panels-issuer-tokens/${userId}`, { method: "GET" });
      if (!response.ok) {
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }
      const data = await response.json();
      return {
        tokenList: data.tokenList,
        upcomingPayment: data.upcomingPayment
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// --- GET TOKEN LIST AND UPCOMING PAYMENTS BY INVESTOR ---
export const getTokenListAndUpcomingPaymentsByInvestor = createAsyncThunk(
  "solarPanel/getTokenListAndUpcomingPaymentsByInvestor",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/panels-investor-tokens/${userId}`, { method: "GET" });
      if (!response.ok) {
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }
      const data = await response.json();
      return {
        tokenList: data.tokenList,
        upcomingPayment: data.upcomingPayment
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// --- UPDATE PAYMENT ---
export const updatePayment = createAsyncThunk(
  "solarPanel/updatePayment",
  async (formData: {userId: string, panelId: string, network: string}, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/panels-update-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
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
  }
);

const solarPanelSlice = createSlice({
  name: "solarPanel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(newPanel.pending, (state) => {
        state.status = "loading";
      })
      .addCase(newPanel.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(newPanel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updatePanel.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updatePanel.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(updatePanel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(readPanels.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(readPanels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.panels = action.payload;
      })
      .addCase(readPanels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // --- RETAIL MARKET ---
      .addCase(getRetailMarketPanels.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getRetailMarketPanels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.retailMarketPanels = action.payload;
      })
      .addCase(getRetailMarketPanels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(addRetailMarketPanel.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addRetailMarketPanel.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(addRetailMarketPanel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(registerPurchase.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerPurchase.fulfilled, (state) => {
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(registerPurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(readPanelInvestors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(readPanelInvestors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.panelInvestors = action.payload;
      })
      .addCase(readPanelInvestors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getTokenListAndUpcomingPaymentsByIssuer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getTokenListAndUpcomingPaymentsByIssuer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tokenList = action.payload.tokenList;
        state.upcomingPayment = action.payload.upcomingPayment;
      })
      .addCase(getTokenListAndUpcomingPaymentsByIssuer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getTokenListAndUpcomingPaymentsByInvestor.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getTokenListAndUpcomingPaymentsByInvestor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tokenList = action.payload.tokenList;
        state.upcomingPayment = action.payload.upcomingPayment;
      })
      .addCase(getTokenListAndUpcomingPaymentsByInvestor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updatePayment.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default solarPanelSlice.reducer; 