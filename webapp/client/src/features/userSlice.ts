import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Investor } from "../components/Authentication/InvestorRegistration";

export interface RetailBondBuy {
  _id: string;
  userId: string;
  destinationBlockchain: string;
  investToken: string;
  purchasedTokens: number;
}

interface BondState {
  userLoged: Investor  | null;
  investors: (Investor )[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
  retailBondBuys: RetailBondBuy[];
  upcomingPayments: any[];
  pastDuePayments: any[];
}

const initialState: BondState = {
  userLoged: null,
  investors: [],
  status: "idle",
  error: undefined,
  retailBondBuys: [],
  upcomingPayments: [],
  pastDuePayments: [],
};

export const registerInvestor = createAsyncThunk(
  "user/registerInvestor",
  async (dataI: { investor: Investor; particular: boolean }, { rejectWithValue }) => {
    console.log("Before sending:", JSON.stringify(dataI.investor));
    try {
      const response = await fetch("/api/register-investor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataI),
      });

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
  }
);

export const readInvestors = createAsyncThunk("user/readInvestors", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/investors", { method: "GET" });

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
    return data as Investor[];
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const updateInvestor = createAsyncThunk("investor/updateInvestor",async (investor: Investor, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/update-investor/${investor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(investor),
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
      return data as Investor;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error en la conexión");
    }
  }
);

export const getInvestorWalletData = createAsyncThunk("user/getInvestorWalletData", async (userId: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/usersWallet/${userId}`, { method: "GET" });
    
    if (!response.ok) {
      try {
        const error = await response.json();
        return rejectWithValue(error.message || "Error desconocido");
      } catch {
        return rejectWithValue(`Unexpected response: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log("Wallet Data:", data); // Debugging step
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getFaucetBalance = createAsyncThunk("user/getFaucetBalance", async (wallet: string, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/users-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({address: wallet}),
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
      console.log("Wallet:", wallet);
      console.log("Faucet Balance Data:", data); // Debugging step
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
});

export const getAllBuys = createAsyncThunk("user/getAllBuys", async (userId: string, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/users/${userId}`, { method: "GET" });

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
    console.log("Fetched Bonds:", data); // Debugging step
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getPayments = createAsyncThunk("user/getPayments", async (userId: string, { rejectWithValue }) => {
  try {
      const response = await fetch(`/api/bonds-issuer-pending/${userId}`, { method: "GET" });

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
    console.log("Fetched data:", data); // Debugging step
    return data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const login = createAsyncThunk("user/login", async (log: { profile: string; email: string; password: string }, { rejectWithValue }) => {
    console.log("Before sending:", JSON.stringify(log));
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(log),
      });

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
  }
);

export const faucetStable = createAsyncThunk("user/faucetStable", async (datos: { address: string, amount: number }, { rejectWithValue }) => {
  console.log("Before sending:", JSON.stringify(datos));
  try {
    const response = await fetch("/api/faucet-stable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
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

export const getRetailBondBuysByUserID = createAsyncThunk(
  "user/getRetailBondBuysByUserID",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/retail-bond-buys/${userId}`, { method: "GET" });
      if (!response.ok) {
        try {
          const error = await response.json();
          return rejectWithValue(error.message || "Error desconocido");
        } catch {
          return rejectWithValue(`Unexpected response: ${response.statusText}`);
        }
      }
      const data = await response.json();
      return data as RetailBondBuy[];
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerInvestor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerInvestor.fulfilled, (state, action) => {
        state.error = null;
        state.userLoged = action.payload;
        state.status = "succeeded";
      })
      .addCase(registerInvestor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(readInvestors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(readInvestors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.investors = action.payload;
      })
      .addCase(readInvestors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userLoged = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getRetailBondBuysByUserID.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getRetailBondBuysByUserID.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.retailBondBuys = action.payload;
      })
      .addCase(getRetailBondBuysByUserID.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getPayments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.upcomingPayments = action.payload.upcomingPayments;
        state.pastDuePayments = action.payload.pastDuePayments;
      });
  },
});

export default userSlice.reducer;
