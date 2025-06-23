import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';

// Async thunk to fetch paginated session stats
export const fetchDragonTigerSessions = createAsyncThunk(
  'dragonTiger/fetchSessions',
  async ({ page = 1, limit = 10, searchText = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/dragon-tiger/session-stats?page=${page}&limit=${limit}&searchText=${searchText}`
      );
      if (response.status !== 200) {
        throw new Error('Failed to fetch Dragon Tiger sessions');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

// Initial state
const initialState = {
  sessions: [],
  currentPage: 1,
  totalPages: 1,
  totalSessions: 0,
  loading: false,
  error: null
};

// Slice
const dragonTigerSlice = createSlice({
  name: 'dragonTiger',
  initialState,
  reducers: {
    resetDragonTigerState: (state) => {
      state.sessions = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalSessions = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDragonTigerSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDragonTigerSessions.fulfilled, (state, action) => {
        console.log("response =>", action.payload)
        state.loading = false;
        state.sessions = action.payload.sessions;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalSessions = action.payload.totalSessions;
      })
      .addCase(fetchDragonTigerSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDragonTigerState } = dragonTigerSlice.actions;

export default dragonTigerSlice.reducer;
