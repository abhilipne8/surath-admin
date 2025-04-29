import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveDeposite, fetchDepositeList, rejectDeposite } from '../../../store/deposite/depositeSlice';
import { Table, Tag, Image, Modal, Input, Button, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { ReloadOutlined } from '@ant-design/icons';

function DepositeList() {
  const dispatch = useDispatch();
  const { depositeDataList, loading, totalRecords, todayApprovedTotal } = useSelector((state) => state.deposites);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filteredValue, setFilteredValue] = useState(['pending'])
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10});

  const columns = [
    {
      title: 'Sr.',
      key: 'index',
      render: (text, record, index) => index + 1 + '.', // Calculate index based on the order
      fixed: 'left', // Optional: Fix this column to the left
    },
    {
      title: 'UTR No.',
      dataIndex: 'utrNumber',
      key: 'utrNumber',
      fixed: 'left',
    },
    {
      title: 'AMOUNT',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Reject', value: 'rejected' },
      ],
      filteredValue: filteredValue.length ? filteredValue : null, // Default to 'pending', clear when needed
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color;
        switch (status) {
          case 'approved':
            color = '#47db44';
            break;
          case 'rejected':
            color = '#cd201f';
            break;
          case 'pending':
            color = '#e6b543';
            break;
          default:
            color = 'gray'; // Fallback for unexpected statuses
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'DATE',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => {
        const date = new Date(createdAt);
        const formattedDate = `${date
          .toLocaleDateString('en-GB')
          .replace(/\//g, '-')
          .slice(0, -5)} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return formattedDate;
      },
    },
    {
      title: 'IMAGE',
      dataIndex: 'paymentScreenshotUrl',
      key: 'paymentScreenshotUrl',
      render: (paymentScreenshotUrl) =>
        paymentScreenshotUrl ? (
          <Image
            src={paymentScreenshotUrl}
            alt="Payment Screenshot"
            width={30}
            height={30}
            style={{ borderRadius: '5px', objectFit: 'cover', cursor: 'pointer' }}
            preview={{
              src: paymentScreenshotUrl, // Use this URL for the preview modal
            }}
          />
        ) : (
          <span className="text-muted">No Image</span>
        ),
    },
    {
      title: 'ACTION',
      dataIndex: '',
      key: 'action',
      render: (text, record) => (
        <>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleRejectClick(record)}
          >
            Reject
          </button>
          <Popconfirm
            title="Are you sure you want to approve this transaction?"
            onConfirm={() => handleApprove(record)} // Handle approve action
            okText="Yes"
            cancelText="No"
          >
            <button className="btn btn-success btn-sm ms-2">Approve</button>
          </Popconfirm>
        </>
      ),
    },
    {
      title: 'User Mo.',
      dataIndex: 'userPhone',
      key: 'userPhone',
    },
  ];

  useEffect(() => { 
    const statusQuery = filteredValue.length > 0 ? filteredValue.join(",") : "";
    console.log("pagination=>", pagination);
    
    dispatch(fetchDepositeList({ status: statusQuery, page: pagination.current, limit: pagination.pageSize, search: searchText }));
  }, [filteredValue, pagination, searchText, dispatch]);
  

  const handleTableChange = (pagination, filters) => {
    const newStatus = filters.status || [];
    setFilteredValue(newStatus);
    setPagination({ ...pagination });
  };

  const handleRejectClick = (record) => {
    setSelectedRecord(record);
    setIsModalVisible(true); // Open the modal when reject button is clicked
  };

  const handleApprove = (record) => {
    dispatch(approveDeposite(record._id))
    .unwrap() // Ensures promise resolution
    .then(() => {
      toast.success('Successfully Approved deposite reuest',{
        position: 'top-right',
        autoClose: 3000,
      })
    })
    .catch((error) => {
      toast.error('Failed to Approved deposite request', {
        position: 'top-right',
        autoClose: 3000,
      });
    });

    // Add your logic for approving the transaction here, e.g., API call
  };

  const handleOk = () => {
    dispatch(rejectDeposite({ requestId: selectedRecord._id, reason: rejectionReason }))
    .unwrap() // Ensures promise resolution
    .then(() => {
      toast.success('Successfully Reject deposite reuest',{
        position: 'top-right',
        autoClose: 3000,
      })
      setIsModalVisible(false); // Close the modal
      setRejectionReason(''); // Clear the input field
    })
    .catch((error) => {
      toast.error('Failed to Reject deposite request', {
        position: 'top-right',
        autoClose: 3000,
      });
    });
    
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Close the modal without doing anything
    setRejectionReason('')
  };

  const handleReasonChange = (e) => {
    setRejectionReason(e.target.value); // Update rejection reason as the user types
  };

  const handleSearch = (value) => {
    setSearchText(value); // Update the search text
  };

  const handleRefresh = () => {
    dispatch(fetchDepositeList());// Call fetchWithdrawals when refresh button is clicked
  };

  return (
    <div>
      <div className="d-flex justify-content-center">
        <h4
          className="text-white p-2 px-4"
          style={{ backgroundColor: '#2dcf2d', borderRadius: '10px' }}
        >
          Deposite Dashboard
        </h4>
      </div>
      <div className="d-flex justify-content-end mb-3">
      </div>
      <div className="row">
        <div className="col-md-8 col-12">
          <div className="row justify-content-between mx-1">
            <Input
              className='mb-2'
              placeholder="Search by UTR No."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 180 }}
            />
              <Button className='text-end' icon={<ReloadOutlined />} onClick={handleRefresh} />
          </div>
          <Table
            dataSource={depositeDataList.map((item) => ({
              ...item,
              key: item._id,
            }))}
            columns={columns}
            loading={loading}
            size="small"
            className="custom-table"
            scroll={{ x: "max-content" }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalRecords,
              showSizeChanger: false,
            }}
            onChange={handleTableChange}
          />
          <span>Today's Total </span>{todayApprovedTotal}
        </div>
        <div className="col-md-4 col-12"></div>
      </div>

      {/* Reject Modal */}
      <Modal
        title="Rejection Reason"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            disabled={!rejectionReason} // Disable the Done button if there's no reason
          >
            Done
          </Button>,
        ]}
      >
        <Input
          placeholder="Enter reason for rejection"
          value={rejectionReason}
          onChange={handleReasonChange}
        />
      </Modal>
    </div>
  );
}

export default DepositeList;
