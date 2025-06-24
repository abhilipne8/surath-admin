import React, { useEffect, useState } from 'react';
import { Input, Table, Row, Col, Statistic, Spin, DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  fetchDragonTigerSessions,
  fetchDragonTigerDailyStats,
  setDragonTigerSessionMode
} from '../../../../../store/games/dragon-tiger/dragonTigerSlice';

function DragonTiger() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [date, setDate] = useState(dayjs());
  const [selectedMode, setSelectedMode] = useState('');

  const {
    sessions,
    loading,
    totalSessions,
    dailyStats,
    sessionMode,
  } = useSelector((state) => state.dragonTiger);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const formattedDate = date.format('YYYY-MM-DD');
    dispatch(fetchDragonTigerSessions({
      page: pagination.current,
      limit: pagination.pageSize,
      searchText,
    }));
    dispatch(fetchDragonTigerDailyStats(formattedDate));
  }, [dispatch, pagination.current, pagination.pageSize, searchText, date]);

  useEffect(() => {
    // Set local state from Redux (you may add a get API to fetch mode if needed)
    setSelectedMode(sessionMode.mode);
  }, [sessionMode.mode]);

  const handleSearch = (value) => {
    setSearchText(value.trim());
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleDateChange = (newDate) => {
    if (dayjs.isDayjs(newDate)) {
      setDate(newDate);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }
  };

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setSelectedMode(newMode);
    dispatch(setDragonTigerSessionMode(newMode));
  };

  const filteredData = sessions.filter((item) =>
    item.sessionId.toString().includes(searchText)
  );

  const columns = [
    { title: 'Session ID', dataIndex: 'sessionId', key: 'sessionId', fixed: 'left' },
    { title: 'Start Time (IST)', dataIndex: 'startTime', key: 'startTime' },
    { title: 'Total Bet (₹)', dataIndex: 'totalBetAmount', key: 'totalBetAmount' },
    { title: 'Total Win (₹)', dataIndex: 'totalWinningAmount', key: 'totalWinningAmount' },
    { title: 'Users Played', dataIndex: 'uniqueUserCount', key: 'uniqueUserCount' },
    { title: 'Dragon (₹)', dataIndex: 'dragonTotalAmount', key: 'dragonTotalAmount' },
    { title: 'Tiger (₹)', dataIndex: 'tigerTotalAmount', key: 'tigerTotalAmount' },
  ];

  return (
    <div>
      <div className='d-flex justify-content-center align-items-center flex-column'>
        <DatePicker
          value={date}
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          allowClear={false}
        />
        <Spin spinning={dailyStats.loading}>
          <Row gutter={30} className="mb-1 mt-2">
            <Col>
              <Statistic title="Total Bet (₹)" value={dailyStats.totalBetAmount} precision={2} />
            </Col>
            <Col>
              <Statistic title="Total Win (₹)" value={dailyStats.totalWinningAmount} precision={2} />
            </Col>
          </Row>
        </Spin>

        {/* ✅ Session Mode Section */}
        <div className='mt-4'>
          <h3>Session Mode</h3>
          {sessionMode.loading && <p>Loading settings...</p>}
          {sessionMode.error && <p className="text-danger">Error: {sessionMode.error}</p>}
          {selectedMode ? (
            <div className='d-flex justify-content-center mt-3'>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="sessionMode"
                  id="automaticMode"
                  value="automatic"
                  checked={selectedMode === 'automatic'}
                  onChange={handleModeChange}
                />
                <label className="form-check-label" htmlFor="automaticMode">
                  Automatic
                </label>
              </div>
              <div className="form-check ms-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="sessionMode"
                  id="manualMode"
                  value="manual"
                  checked={selectedMode === 'manual'}
                  onChange={handleModeChange}
                />
                <label className="form-check-label" htmlFor="manualMode">
                  Manual
                </label>
              </div>
            </div>
          ) : (
            !sessionMode.loading && <p>No settings available.</p>
          )}
        </div>
      </div>

      <Input
        className='mb-2 mt-3'
        placeholder="Search by Session ID"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 200 }}
      />

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record.sessionId}
        className="custom-table"
        size="small"
        scroll={{ x: 'max-content' }}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalSessions,
          showSizeChanger: false,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}

export default DragonTiger;
