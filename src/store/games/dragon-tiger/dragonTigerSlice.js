import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';

// Thunk to fetch paginated session stats
export const fetchDragonTigerSessions = createAsyncThunk(
  'dragonTiger/fetchSessions',
  async ({ page = 1, limit = 10, searchText = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/dragon-tiger/session-stats?page=${page}&limit=${limit}&searchText=${searchText}`
      );
      if (response.status !== 200) throw new Error('Failed to fetch Dragon Tiger sessions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

// ✅ Fetch daily stats
export const fetchDragonTigerDailyStats = createAsyncThunk(
  'dragonTiger/fetchDailyStats',
  async (date = '', { rejectWithValue }) => {
    try {
      const url = date ? `/admin/dragon-tiger/status?date=${date}` : `/admin/dragon-tiger/status`;
      const response = await api.get(url);
      if (response.status !== 200) throw new Error('Failed to fetch daily stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

// ✅ Set session mode
export const setDragonTigerSessionMode = createAsyncThunk(
  'dragonTiger/setSessionMode',
  async (mode, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/dragon-tiger/set-session-mode', { mode });
      if (response.status !== 200) throw new Error('Failed to set session mode');
      return response.data; // {status, message, data: {sessionMode: "automatic"}}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Unknown error');
    }
  }
);

// ✅ Get session mode
export const getDragonTigerSessionMode = createAsyncThunk(
  'dragonTiger/getSessionMode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dragon-tiger/get-session-mode');
      return response.data; // {status, message, data: {sessionMode: "manual"}}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Unknown error');
    }
  }
);

const initialState = {
  sessions: [],
  currentPage: 1,
  totalPages: 1,
  totalSessions: 0,
  loading: false,
  error: null,

  // ✅ Daily stats
  dailyStats: {
    date: '',
    totalBetAmount: 0,
    totalWinningAmount: 0,
    loading: false,
    error: null
  },

  // ✅ Session mode
  sessionMode: {
    mode: '',
    loading: false,
    error: null,
    successMessage: ''
  }
};

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

      state.dailyStats = {
        date: '',
        totalBetAmount: 0,
        totalWinningAmount: 0,
        loading: false,
        error: null
      };

      state.sessionMode = {
        mode: '',
        loading: false,
        error: null,
        successMessage: ''
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Sessions
      .addCase(fetchDragonTigerSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDragonTigerSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.sessions;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalSessions = action.payload.totalSessions;
      })
      .addCase(fetchDragonTigerSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Daily stats
      .addCase(fetchDragonTigerDailyStats.pending, (state) => {
        state.dailyStats.loading = true;
        state.dailyStats.error = null;
      })
      .addCase(fetchDragonTigerDailyStats.fulfilled, (state, action) => {
        state.dailyStats.loading = false;
        state.dailyStats.date = action.payload.date;
        state.dailyStats.totalBetAmount = action.payload.totalBetAmount;
        state.dailyStats.totalWinningAmount = action.payload.totalWinningAmount;
      })
      .addCase(fetchDragonTigerDailyStats.rejected, (state, action) => {
        state.dailyStats.loading = false;
        state.dailyStats.error = action.payload;
      })

      // ✅ Set session mode
      .addCase(setDragonTigerSessionMode.pending, (state) => {
        state.sessionMode.loading = true;
        state.sessionMode.error = null;
        state.sessionMode.successMessage = '';
      })
      .addCase(setDragonTigerSessionMode.fulfilled, (state, action) => {
        state.sessionMode.loading = false;
        state.sessionMode.mode = action.payload.data.sessionMode;
        state.sessionMode.successMessage = action.payload.message;
      })
      .addCase(setDragonTigerSessionMode.rejected, (state, action) => {
        state.sessionMode.loading = false;
        state.sessionMode.error = action.payload;
      })

      // ✅ Get session mode
      .addCase(getDragonTigerSessionMode.pending, (state) => {
        state.sessionMode.loading = true;
        state.sessionMode.error = null;
        state.sessionMode.successMessage = '';
      })
      .addCase(getDragonTigerSessionMode.fulfilled, (state, action) => {
        state.sessionMode.loading = false;
        state.sessionMode.mode = action.payload.data.sessionMode;
        state.sessionMode.successMessage = action.payload.message;
      })
      .addCase(getDragonTigerSessionMode.rejected, (state, action) => {
        state.sessionMode.loading = false;
        state.sessionMode.error = action.payload;
      });
  },
});

export const { resetDragonTigerState } = dragonTigerSlice.actions;
export default dragonTigerSlice.reducer;
