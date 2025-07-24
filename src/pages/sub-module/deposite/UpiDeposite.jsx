import { ReloadOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkUpiDepositStatus,
  fetchUpiDepositeList,
  clearCheckStatusResponse,
  adminUpdateTransactionStatus
} from '../../../store/deposite/upiDepositeSlice';

function UpiDeposite() {
  const [filteredValue, setFilteredValue] = useState(['pending']);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState('');

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const {
    depositeDataList,
    loading,
    totalRecords,
    todayApprovedTotal,
    checkStatusResponse,
  } = useSelector((state) => state.upiDeposite);

  const dispatch = useDispatch();

  const handleCheckPaymentStatus = (transaction) => {
    dispatch(
      checkUpiDepositStatus({
        client_txn_id: transaction.client_txn_id,
        txn_date: new Date(transaction.createdAt)
          .toLocaleDateString('en-GB')
          .replace(/\//g, '-'),
      })
    );
  };

  const fetchDepositList = () => {
    const statusQuery = filteredValue.length > 0 ? filteredValue.join(',') : '';
    dispatch(
      fetchUpiDepositeList({
        status: statusQuery,
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
      })
    );
  };

  useEffect(() => {
    fetchDepositList();
  }, [filteredValue, pagination, searchText, dispatch]);

  useEffect(() => {
    if (checkStatusResponse?.success) {
      fetchDepositList();
      dispatch(clearCheckStatusResponse());
    }
  }, [checkStatusResponse]);

  const handleSearchInputChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleRefreshClick = () => {
    fetchDepositList();
  };

  const handleTableChange = (pagination, filters) => {
    const newStatus = filters.status || [];
    setFilteredValue(newStatus);
    setPagination({ ...pagination });
  };

  const handleApproveTransaction = (transaction) => {
    dispatch(adminUpdateTransactionStatus({
      id: transaction._id,
      status: 'success',
    })).then(() => {
      fetchDepositList();
    });
  };

  const handleRejectTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsRejectModalVisible(true);
  };

  const handleRejectReasonChange = (e) => {
    setRejectionReason(e.target.value);
  };

  const handleRejectModalCancel = () => {
    setIsRejectModalVisible(false);
    setRejectionReason('');
    setSelectedTransaction(null);
  };

  const submitRejection = () => {
    if (!selectedTransaction || !rejectionReason) return;

    dispatch(adminUpdateTransactionStatus({
      id: selectedTransaction._id,
      status: 'failure',
      reason: rejectionReason,
    })).then(() => {
      fetchDepositList();
      handleRejectModalCancel();
    });
  };

  const columns = [
    {
      title: 'Sr.',
      key: 'index',
      render: (text, record, index) => index + 1 + '.',
      fixed: 'left',
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
        { text: 'Success', value: 'success' },
        { text: 'Failure', value: 'failure' },
      ],
      filteredValue: filteredValue.length ? filteredValue : null,
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color;
        switch (status) {
          case 'success':
            color = '#47db44';
            break;
          case 'failure':
            color = '#cd201f';
            break;
          case 'pending':
            color = '#e6b543';
            break;
          default:
            color = 'gray';
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
          .slice(0, -5)} ${date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`;
        return formattedDate;
      },
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleRejectTransactionClick(record)}
          >
            Reject
          </button>
          <Popconfirm
            title="Are you sure you want to approve this transaction?"
            onConfirm={() => handleApproveTransaction(record)}
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
    {
      title: 'Check Status',
      render: (_, record) => (
        <button
          className="btn btn-warning btn-sm"
          onClick={() => handleCheckPaymentStatus(record)}
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-center">
        <h4 className="text-white p-2 px-4" style={{ backgroundColor: '#2dcf2d', borderRadius: '10px' }}>
          Deposit Dashboard
        </h4>
      </div>

      <div className="row my-3">
        <div className="col-md-8 col-12">
          <div className="d-flex justify-content-between mb-2 mx-1">
            <Input
              placeholder="Search by UTR No."
              value={searchText}
              onChange={handleSearchInputChange}
              style={{ width: 180 }}
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefreshClick} />
          </div>

          <Table
            dataSource={depositeDataList.map(item => ({ ...item, key: item._id }))}
            columns={columns}
            loading={loading}
            size="small"
            className="custom-table"
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalRecords,
              showSizeChanger: false,
            }}
            onChange={handleTableChange}
          />

          <div className="mt-2">
            <strong>Today's Approved Total:</strong> {todayApprovedTotal}
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      <Modal
        title="Rejection Reason"
        visible={isRejectModalVisible}
        onOk={submitRejection}
        onCancel={handleRejectModalCancel}
        footer={[
          <Button key="cancel" onClick={handleRejectModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={submitRejection}
            disabled={!rejectionReason}
          >
            Submit
          </Button>,
        ]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Enter reason for rejection"
          value={rejectionReason}
          onChange={handleRejectReasonChange}
        />
      </Modal>
    </div>
  );
}

export default UpiDeposite;
