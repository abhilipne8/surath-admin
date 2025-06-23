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

// Initial state
const initialState = {
  sessions: [],
  currentPage: 1,
  totalPages: 1,
  totalSessions: 0,
  loading: false,
  error: null,
};

// Slice
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndarBaharSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAndarBaharSessions.fulfilled, (state, action) => {
        console.log("Andar Bahar sessions =>", action.payload);
        state.loading = false;
        state.sessions = action.payload.sessions;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalSessions = action.payload.totalSessions;
      })
      .addCase(fetchAndarBaharSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAndarBaharState } = andarBaharSlice.actions;

export default andarBaharSlice.reducer;
