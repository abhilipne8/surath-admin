import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async Thunk to fetch deposits
export const fetchDepositeList = createAsyncThunk(
  "deposite/fetchDeposites",
  async ({ status , page, limit, search }, { rejectWithValue }) => {
    try {
      const response = await api.get("/transaction/all-deposit-requests", {
        params: { status, page, limit, search }, // Include pagination parameters
      });
      return response.data; // Assuming response.data contains { data: [], pagination: { totalRecords } }
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


// Async Thunk to approve a deposit
export const approveDeposite = createAsyncThunk(
  'deposite/approveDeposite',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/payment/approve-deposit/${requestId}`); // Replace with your API endpoint
      return response.data; // Assuming response.data is the updated deposit
    } catch (error) {
      // Handle API errors
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Async Thunk to reject a deposit
export const rejectDeposite = createAsyncThunk(
  'deposite/rejectDeposite',
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/payment/reject-deposit/${requestId}`, {
        reason: reason,
      }); // Replace with your API endpoint
      return response.data; // Assuming response.data is the updated deposit
    } catch (error) {
      // Handle API errors
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Deposit Slice
const depositeSlice = createSlice({
  name: 'deposite',
  initialState: {
    depositeDataList: [],
    totalRecords: 0,
    loading: false,
    error: null,
    requestLoading: false,
    todayApprovedTotal: null
  },
  reducers: {
    clearDeposites(state) {
      state.depositeDataList = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle the state when fetchDepositeList is pending
      .addCase(fetchDepositeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepositeList.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we access the right property in response (action.payload)
        state.depositeDataList = action.payload.data || [];
        state.totalRecords = action.payload.pagination?.totalRecords || 0; // Store total count for pagination
        state.todayApprovedTotal = action.payload.todayApprovedTotal
      })
      .addCase(fetchDepositeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch deposit list";
      })
      .addCase(approveDeposite.pending, (state) => {
        state.requestLoading = true;
        state.error = null;
      })
      .addCase(approveDeposite.fulfilled, (state, action) => {
        state.requestLoading = false;
        // Ensure we access the right property in response (action.payload)
        const updatedDeposite = action.payload.data;
        state.depositeDataList = state.depositeDataList.map((deposite) =>
          deposite._id === updatedDeposite._id
            ? { ...deposite, status: updatedDeposite.status } // Update the status
            : deposite
        );
      })
      .addCase(approveDeposite.rejected, (state, action) => {
        state.requestLoading = false;
        state.error = action.payload || "Failed to approve deposit";
      })
      .addCase(rejectDeposite.pending, (state) => {
        state.requestLoading = true;
        state.error = null;
      })
      .addCase(rejectDeposite.fulfilled, (state, action) => {
        state.requestLoading = false;
        // Ensure we access the right property in response (action.payload)
        const updatedDeposite = action.payload.data;
        state.depositeDataList = state.depositeDataList.map((deposite) =>
          deposite._id === updatedDeposite._id
            ? { ...deposite, status: updatedDeposite.status } // Update the status
            : deposite
        );
      })
      .addCase(rejectDeposite.rejected, (state, action) => {
        state.requestLoading = false;
        state.error = action.payload || "Failed to reject deposit";
      });
  },
});

export const { clearDeposites } = depositeSlice.actions;
export default depositeSlice.reducer;
