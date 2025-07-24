import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Fetch list of UPI deposit requests
export const fetchUpiDepositeList = createAsyncThunk(
  "upiDeposite/fetchDeposites",
  async ({ status, page, limit, search }, { rejectWithValue }) => {
    try {
      const response = await api.get("/transaction/all-deposit-requests", {
        params: { status, page, limit, search },
      });
      return response.data; // Expects: { data: [], pagination: { totalRecords }, todayApprovedTotal }
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Check the status of a single UPI deposit
export const checkUpiDepositStatus = createAsyncThunk(
  "upiDeposite/checkUpiDepositStatus",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/transaction/check-status", data);
      return response.data; // Expects: { success: true, status: 'success', data: {...} }
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const adminUpdateTransactionStatus = createAsyncThunk(
  "upiDeposite/adminUpdateTransactionStatus",
  async ({ id, status, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/transaction/update-transaction-status/${id}`, {
        status,
        reason, // will be ignored if status === "success"
      });
      return response.data; // Expects: { success: true, message: ..., status: ... }
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const upiDepositeSlice = createSlice({
  name: 'upiDeposite',
  initialState: {
    depositeDataList: [],
    totalRecords: 0,
    loading: false,
    error: null,
    requestLoading: false,
    todayApprovedTotal: null,
    checkStatusResponse: null,
  },
  reducers: {
    clearDeposites(state) {
      state.depositeDataList = [];
      state.totalRecords = 0;
      state.todayApprovedTotal = null;
      state.error = null;
    },
    clearCheckStatusResponse(state) {
      state.checkStatusResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Deposits
      .addCase(fetchUpiDepositeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpiDepositeList.fulfilled, (state, action) => {
        state.loading = false;
        state.depositeDataList = action.payload.data || [];
        state.totalRecords = action.payload.pagination?.totalRecords || 0;
        state.todayApprovedTotal = action.payload.todayApprovedTotal || null;
      })
      .addCase(fetchUpiDepositeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch deposit list";
      })

      // Check Status
      .addCase(checkUpiDepositStatus.pending, (state) => {
        state.requestLoading = true;
        state.error = null;
        state.checkStatusResponse = null;
      })
      .addCase(checkUpiDepositStatus.fulfilled, (state, action) => {
        state.requestLoading = false;
        state.checkStatusResponse = action.payload;
      })
      .addCase(checkUpiDepositStatus.rejected, (state, action) => {
        state.requestLoading = false;
        state.error = action.payload || "Failed to check deposit status";
      })
       .addCase(adminUpdateTransactionStatus.pending, (state) => {
        state.requestLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateTransactionStatus.fulfilled, (state, action) => {
        state.requestLoading = false;
        state.checkStatusResponse = action.payload; // or add new `adminUpdateResponse` if needed
      })
      .addCase(adminUpdateTransactionStatus.rejected, (state, action) => {
        state.requestLoading = false;
        state.error = action.payload || "Failed to update transaction status";
      });
    },
});

export const { clearDeposites, clearCheckStatusResponse } = upiDepositeSlice.actions;

export default upiDepositeSlice.reducer;
