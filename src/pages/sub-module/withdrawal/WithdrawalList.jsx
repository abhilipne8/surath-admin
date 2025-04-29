import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approvedWithdrawaRequest, fetchWithdrawalBankAccount, fetchWithdrawals, getWithdrawTotalByDate, rejctdWithdrawaRequest } from '../../../store/withdrawal/withdrawalListSlice';
import { Table, Tag, Modal, Button, Spin, Alert, Input, DatePicker } from 'antd';
import { toast } from 'react-toastify';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

function WithdrawalList() {
  const dispatch = useDispatch();
  const { withdrawalDataList, loading, bankAccount, bankaccountLoading, error, withdrawApproveLoading, totalWithdrawAmount } = useSelector((state) => state.withdrawals);

  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null); // Store selected withdrawal details

  const [reasonModal, setReasonModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('');
  const [filteredValue, setFilteredValue] = useState(['pending'])
  const [searchText, setSearchText] = useState('');
  const [date, setDate] = useState(dayjs());


  useEffect(() => {
    const statusQuery = filteredValue.join(",");
    dispatch(fetchWithdrawals({ status: statusQuery, _id: searchText.trim() }));
  }, [filteredValue, searchText, dispatch]);

  const handleSeeDetails = (record) => {
    setSelectedWithdrawal(record); // Set the selected withdrawal details
    setIsModalVisible(true); // Show the modal
    dispatch(fetchWithdrawalBankAccount(record.bankAccountId)); // Fetch bank account details
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedWithdrawal(null);
  };

  const handleApprove = () => {
    dispatch(approvedWithdrawaRequest(selectedWithdrawal._id))
    .unwrap() // Ensures promise resolution
    .then(() => {
      toast.success('Successfully approved withdrawal reuest',{
        position: 'top-right',
        autoClose: 3000,
      })
      setIsModalVisible(false);
      setSelectedWithdrawal(null);
    })
    .catch((error) => {
      toast.error('Failed to approve withdrawal request', {
        position: 'top-right',
        autoClose: 3000,
      });
    });
  };

  const handleReject = () => {
    setReasonModal(true)
  }

  const rejectTransaction = () => {
    dispatch(rejctdWithdrawaRequest({ withdrawId: selectedWithdrawal._id, reason: rejectionReason }))
    .unwrap() // Ensures promise resolution
    .then(() => {
      toast.success('Successfully Reject withdrawal reuest',{
        position: 'top-right',
        autoClose: 3000,
      })
      setReasonModal(false)
      setIsModalVisible(false)
      setRejectionReason('')
    })
    .catch((error) => {
      toast.error('Failed to Reject withdrawal request', {
        position: 'top-right',
        autoClose: 3000,
      });
    });
  }

  const handleReasonChange = (e) => {
    setRejectionReason(e.target.value); // Update rejection reason as the user types
  };

  const handleRefresh = () => {
    dispatch(fetchWithdrawals()); // Call fetchWithdrawals when refresh button is clicked
  };

  const columns = [
    {
      title: 'AMOUNT',
      dataIndex: 'amount',
      key: 'amount',
      fixed: 'left',
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
        const formattedDate = `${date.toLocaleDateString('en-GB')
          .replace(/\//g, '-')
          .slice(0, -5)} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return formattedDate;
      },
    },
    {
      title: 'ACTION',
      dataIndex: '',
      key: 'action',
      render: (text, record) => (
        <button
          className="btn btn-primary btn-sm text-center"
          onClick={() => handleSeeDetails(record)} // Open modal with the selected row data
        >
          See Details
        </button>
      ),
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

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value)
      .then(() => {
        // Show toast only after successful copy
        toast.success('Successfully copy field value', {
          position: 'top-right',
          autoClose: 3000,
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleChange = (value) => {
    if (dayjs.isDayjs(value)) {
      setDate(value); // Store as dayjs
    }
  };

  useEffect(() => {
    const formatted = date.format('DD-MM-YYYY');
    dispatch(getWithdrawTotalByDate(formatted));
  }, [date]);

  return (
    <div>
      <div className='d-flex justify-content-center'>
         <h4 className='text-white p-2 px-4 mb-3' style={{ backgroundColor: '#2dcf2d', borderRadius: '10px' }}>Withdrawal Dashboard List</h4>
      </div>
      <div className="row">
        <div className="col-md-6 col-12 mt-1">
          <div className="row justify-content-between mx-1">
            <Input
              className='mb-2'
              placeholder="Search by ID."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 180 }}
            />
              <Button className='text-end' icon={<ReloadOutlined />} onClick={handleRefresh} />
          </div>
          <Table
            dataSource={withdrawalDataList.map((item) => ({
              ...item,
              key: item._id,
            }))}
            className="custom-table mt-2"
            size="small"
            columns={columns}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            loading={loading}
            onChange={(pagination, filters, sorter) => {
              const newStatus = filters.status || []; // Get new filter values
              setFilteredValue(newStatus); // Update state
            }}
          />
        </div>
        <div className="col-md-6 col-12 mt-1 d-flex justify-content-center align-items-center flex-column">
          <DatePicker
            value={date ? dayjs(date, 'DD-MM-YYYY') : null}
            onChange={handleChange}
            format="DD-MM-YYYY"
          />
          <h6 className='my-3 text-danger'>{totalWithdrawAmount?.message}</h6>
          <div class="shadow p-3 w-25 text-center mb-5 bg-danger rounded"><h4 className='text-white'>{totalWithdrawAmount?.totalWithdrawAmount}</h4></div>
        </div>
      </div>

      {/* Modal for displaying withdrawal details */}
      <Modal
          title="Account Details"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={
            !error && [
              <button className='btn btn-danger' onClick={handleReject}>
                Reject
              </button>,
             <button className="btn btn-success ms-2" onClick={handleApprove} disabled={withdrawApproveLoading}>
                {withdrawApproveLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  "Approve"
                )}
              </button>
            ]
          }
        >
          {bankaccountLoading ? (
            <div className="text-center">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
            />
          ) : (
            selectedWithdrawal && bankAccount && (
              <div className='card card-body' style={{ backgroundColor: '#e1e5eb' }}>
                <p className="mb-1">
                  Upi Id:&nbsp;&nbsp;&nbsp; <strong>{bankAccount.upiId ? bankAccount.upiId : 'N/A' }</strong>
                  <i
                    className="bi bi-clipboard ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => copyToClipboard(bankAccount.upiId)}
                    title="Copy to clipboard"
                  ></i>
                </p>
                <p className="mb-1">
                  Bank Name:&nbsp;&nbsp;&nbsp; <strong>{bankAccount.bankName}</strong>
                  <i
                    className="bi bi-clipboard ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => copyToClipboard(bankAccount.bankName)}
                    title="Copy to clipboard"
                  ></i>
                </p>
                <p className="mb-1">
                  Account Name:&nbsp;&nbsp;&nbsp; <strong>{bankAccount.accountHolderName}</strong>
                  <i
                    className="bi bi-clipboard ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => copyToClipboard(bankAccount.accountHolderName)}
                    title="Copy to clipboard"
                  ></i>
                </p>
                <p className="mb-1">
                  Account Number:&nbsp;&nbsp;&nbsp; <strong>{bankAccount.accountNumber}</strong>
                  <i
                    className="bi bi-clipboard ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => copyToClipboard(bankAccount.accountNumber)}
                    title="Copy to clipboard"
                  ></i>
                </p>
                <p className="mb-1">
                  IFSC Code:&nbsp;&nbsp;&nbsp; <strong>{bankAccount.ifscCode}</strong>
                  <i
                    className="bi bi-clipboard ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => copyToClipboard(bankAccount.ifscCode)}
                    title="Copy to clipboard"
                  ></i>
                </p>
                <p className="mb-1">
                  Amount:&nbsp;&nbsp;&nbsp; <strong>{selectedWithdrawal.amount}</strong>
                  <i
                    className="bi bi-clipboard ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => copyToClipboard(selectedWithdrawal.amount)}
                    title="Copy to clipboard"
                  ></i>
                </p>
                <p className="mb-1">
                  Date:&nbsp;&nbsp;&nbsp; <strong>{new Date(selectedWithdrawal.createdAt).toLocaleString()}</strong>
                  <i
                    className="bi bi-clipboard ms-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => copyToClipboard(new Date(selectedWithdrawal.createdAt).toLocaleString())}
                    title="Copy to clipboard"
                  ></i>
                </p>
              </div>
            )
          )}
        </Modal>
        <Modal
            title="Rejection Reason"
            visible={reasonModal}
            onCancel={() => setReasonModal(false)}
            footer={[
                <Button
                    key="submit"
                    type="primary"
                    onClick={rejectTransaction}
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

export default WithdrawalList;
