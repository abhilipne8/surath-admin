import { Input, Table } from 'antd';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { fetchSurathAllSessions } from '../../../../../store/surath/surath';

function Surath() {
    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch()

     const columns = [
        {
          title: 'AMOUNT',
          dataIndex: 'amount',
          key: 'amount',
          fixed: 'left',
        },
        {
          title: 'User Mo.',
          dataIndex: 'userPhone',
          key: 'userPhone',
        },
        {
          title: 'ID',
          dataIndex: '_id',
          key: '_id',
        },
    ];

    const handleSearch = (value) => {
        setSearchText(value.trim()); // Trim to avoid spaces
    };

    useEffect(() => {
        dispatch(fetchSurathAllSessions())
    }, [])
  return (
    <div>
        <Input
            className='mb-2'
            placeholder="Search session by ID."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 230 }}
        />
        <Table
            // dataSource={}
            className="custom-table mt-2"
            size="small"
            columns={columns}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            // loading={loading}
           
          />

    </div>
  )
}

export default Surath