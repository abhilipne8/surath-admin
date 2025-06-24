import React, { useEffect, useState } from 'react';
import { Input, Table, Row, Col, Statistic, Spin, DatePicker } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  fetchAndarBaharSessions,
  fetchAndarBaharDailyStats,
} from '../../../../../store/games/andar-bahar/andarBaharSlice';

function AndarBahar() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [date, setDate] = useState(dayjs());

  const {
    sessions,
    loading,
    currentPage,
    totalSessions,
    dailyStats,
    statsLoading,
  } = useSelector((state) => state.andarBahar);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Fetch sessions and stats when date or search changes
  useEffect(() => {
    const formattedDate = date.format('YYYY-MM-DD');
    dispatch(fetchAndarBaharSessions({
      page: pagination.current,
      limit: pagination.pageSize,
      searchText,
    }));
    dispatch(fetchAndarBaharDailyStats(formattedDate));
  }, [dispatch, pagination.current, pagination.pageSize, searchText, date]);

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

  const filteredData = sessions.filter((item) =>
    item.sessionId.toString().includes(searchText)
  );

  const columns = [
    { title: 'Session ID', dataIndex: 'sessionId', key: 'sessionId', fixed: 'left' },
    { title: 'Start Time (IST)', dataIndex: 'startTime', key: 'startTime' },
    { title: 'Total Bet (₹)', dataIndex: 'totalBetAmount', key: 'totalBetAmount' },
    { title: 'Total Win (₹)', dataIndex: 'totalWinningAmount', key: 'totalWinningAmount' },
    { title: 'Users Played', dataIndex: 'uniqueUserCount', key: 'uniqueUserCount' },
    { title: 'Andar (₹)', dataIndex: 'andarTotalAmount', key: 'andarTotalAmount' },
    { title: 'Bahar (₹)', dataIndex: 'baharTotalAmount', key: 'baharTotalAmount' },
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
          <Spin spinning={statsLoading}>
            <Row gutter={30} className="mb-1 mt-2">
              <Col>
                <Statistic
                  title="Total Bet (₹)"
                  value={dailyStats.totalBetAmount}
                  precision={2}
                />
              </Col>
              <Col>
                <Statistic
                  title="Total Win (₹)"
                  value={dailyStats.totalWinningAmount}
                  precision={2}
                />
              </Col>
            </Row>
          </Spin>
      </div>
      <Input
        className='mb-2 mt-0'
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

export default AndarBahar;
