import React, { useEffect, useState } from 'react';
import { Input, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAndarBaharSessions } from '../../../../../store/games/andar-bahar/andarBaharSlice';

function AndarBahar() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');

  const {
    sessions,
    loading,
    currentPage,
    totalPages,
    totalSessions,
  } = useSelector((state) => state.andarBahar);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    dispatch(fetchAndarBaharSessions({
      page: pagination.current,
      limit: pagination.pageSize,
      searchText: searchText
    }));
  }, [dispatch, pagination, searchText]);

  const columns = [
    {
      title: 'Session ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      fixed: 'left',
    },
    {
      title: 'Start Time (IST)',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'Total Bet (₹)',
      dataIndex: 'totalBetAmount',
      key: 'totalBetAmount',
    },
    {
      title: 'Total Win (₹)',
      dataIndex: 'totalWinningAmount',
      key: 'totalWinningAmount',
    },
    {
      title: 'Users Played',
      dataIndex: 'uniqueUserCount',
      key: 'uniqueUserCount',
    },
    {
      title: 'Andar (₹)',
      dataIndex: 'andarTotalAmount',
      key: 'andarTotalAmount',
    },
    {
      title: 'Bahar (₹)',
      dataIndex: 'baharTotalAmount',
      key: 'baharTotalAmount',
    },
  ];

  const handleSearch = (value) => {
    setSearchText(value.trim());
    setPagination((prev) => ({
      ...prev,
      current: 1
    }));
  };

  const filteredData = sessions.filter((item) =>
    item.sessionId.toString().includes(searchText)
  );

  const handleTableChange = (pagination) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <div>
      <Input
        className='mb-2'
        placeholder="Search by Session ID"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 230 }}
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record.sessionId}
        className="custom-table mt-2"
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
