import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';

// Async thunk to fetch paginated Andar Bahar session stats
export const fetchAndarBaharSessions = createAsyncThunk(
  'andarBahar/fetchSessions',
  async ({ page = 1, limit = 10, searchText = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/admin/andar-bahar/session-stats?page=${page}&limit=${limit}&searchText=${searchText}`
      );
      if (response.status !== 200) {
        throw new Error('Failed to fetch Andar Bahar sessions');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

// ✅ Async thunk to fetch daily stats
export const fetchAndarBaharDailyStats = createAsyncThunk(
  'andarBahar/fetchDailyStats',
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/andar-bahar/status?date=${date}`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch daily stats');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);
export const getAndarBaharSessionMode = createAsyncThunk(
  'andarBahar/getSessionMode',
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/andar-bahar/get-session-mode`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch daily stats');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

export const setAndarBaharSessionMode = createAsyncThunk(
  'andarBahar/setSessionMode',
  async (mode, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/andar-bahar/set-session-mode', { mode });
      if (response.status !== 200) {
        throw new Error('Failed to set session mode');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Unknown error');
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
  error: null,

  // ✅ For daily stats
  dailyStats: {
    date: null,
    totalBetAmount: 0,
    totalWinningAmount: 0,
  },

  sessionMode: {
    mode: '',
    loading: false,
    error: null,
    successMessage: ''
  },

  statsLoading: false,
  statsError: null,
};

const andarBaharSlice = createSlice({
  name: 'andarBahar',
  initialState,
  reducers: {
    resetAndarBaharState: (state) => {
      state.sessions = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalSessions = 0;
      state.loading = false;
      state.error = null;
      state.dailyStats = { date: null, totalBetAmount: 0, totalWinningAmount: 0 };
      state.statsLoading = false;
      state.statsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📦 Session list
      .addCase(fetchAndarBaharSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAndarBaharSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.sessions;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalSessions = action.payload.totalSessions;
      })
      .addCase(fetchAndarBaharSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Daily Stats
      .addCase(fetchAndarBaharDailyStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchAndarBaharDailyStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.dailyStats = {
          date: action.payload.date,
          totalBetAmount: action.payload.totalBetAmount,
          totalWinningAmount: action.payload.totalWinningAmount,
        };
      })
      .addCase(fetchAndarBaharDailyStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      .addCase(getAndarBaharSessionMode.pending, (state) => {
        state.sessionMode.loading = true;
        state.sessionMode.error = null;
        state.sessionMode.successMessage = '';
      })
      .addCase(getAndarBaharSessionMode.fulfilled, (state, action) => {
        state.sessionMode.loading = false;
        state.sessionMode.successMessage = action.payload.data.message;
        state.sessionMode.mode = action.payload.data.sessionMode; // 'automatic' or 'manual'
      })
      .addCase(getAndarBaharSessionMode.rejected, (state, action) => {
        state.sessionMode.loading = false;
        state.sessionMode.error = action.payload;
      })
      .addCase(setAndarBaharSessionMode.pending, (state) => {
        state.sessionMode.loading = true;
        state.sessionMode.error = null;
        state.sessionMode.successMessage = '';
      })
      .addCase(setAndarBaharSessionMode.fulfilled, (state, action) => {
        state.sessionMode.loading = false;
        state.sessionMode.successMessage = action.payload.data.message;
        state.sessionMode.mode = action.payload.data.sessionMode; // 'automatic' or 'manual'
      })
      .addCase(setAndarBaharSessionMode.rejected, (state, action) => {
        state.sessionMode.loading = false;
        state.sessionMode.error = action.payload;
      });
  },
});

export const { resetAndarBaharState } = andarBaharSlice.actions;

export default andarBaharSlice.reducer;
