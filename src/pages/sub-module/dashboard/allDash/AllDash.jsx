import React, { useEffect, useRef, useState } from 'react'
import { Input, Switch, Table, Modal, Button, Form, Tag } from 'antd';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { addBankAccount, BankAccountStatusChange, editBankAccount, fetchAllBankAccounts } from '../../../../store/bankAccount/bankAccountSlice';
import { Spinner } from 'reactstrap';
import { getAllUserList, getUserBets, updateUser } from '../../../../store/user/userSlice';
import api from '../../../../api/api';

function AllDash() {
  const modalRef = useRef(null); // Reference to modal
    const [isEditMode, setIsEditMode] = useState(true);
    const [selecteBankdData, setSelectedBankData] = useState(null);
    const dispatch = useDispatch()
    const {loading, allbankAccounts} = useSelector((state) => state.bankAccounts)
    const { userLoading, userList, pagination } = useSelector((state) => state.user);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({ bonusAmount: '', availableBalance: '' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');

    const pageSize = 50;

    const columns = [
      {
        title: 'Ac. Name',
        dataIndex: 'accountName',
        key: 'accountName',
        fixed: 'left',
      },
      {
        title: 'UPI Id',
        dataIndex: 'upiId',
        key: 'upiId',
      },
      {
        title: 'Amount',
        dataIndex: 'totalDepositeAdded',
        key: 'totalDepositeAdded',
      },

      {
        title: 'Ac. No.',
        dataIndex: 'accountNumber',
        key: 'accountNumber',
      },
      {
        title: 'Bank Name',
        dataIndex: 'bankName',
        key: 'bankName',
      },
      {
        title: 'IFSC Code',
        dataIndex: 'ifscCode',
        key: 'ifscCode',
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (text, record) => (
          <Switch
            size="small"
            checked={record.isActive} // Set checked based on the isActive value
            onChange={(checked) => handleStatusChange(checked, record)} // Handle change when the switch is toggled
          />
        ),
      },
      {
        title: 'Action',
        dataIndex: '',
        key: 'action',
        render: (text, record) => (
          <button
            type="button"
            className="btn btn-small btn-warning btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
            onClick={() => handleViewDetails(record)}
          >
            See Details
          </button>
        ),
      },
    ];

    const userColumn = [
    {
      title: 'Sr.',
      key: 'index',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      fixed: 'left',
      width: 35,
    },
    {
      title: 'Phone',
      dataIndex: 'Phone',
      key: 'Phone',
      fixed: 'left',
    },
    {
      title: 'Amount',
      dataIndex: 'availableBalance',
      key: 'availableBalance',
      width: 80,
    },
    {
      title: 'Bonus',
      dataIndex: 'bonusAmount',
      key: 'bonusAmount',
      width: 70,
    },
    {
      title: 'Depo.',
      dataIndex: 'totalDeposite',
      key: 'totalDeposite',
      width: 80,
      render: (text, record) => (
        <Tag color='green'>
          {text}
        </Tag>
      ),
    },
    {
      title: 'With.',
      dataIndex: 'totalWithdrawal',
      key: 'totalWithdrawal',
      width: 80,
      render: (text, record) => (
        <Tag color='red'>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      render: (text) =>
        text
          ? new Date(text).toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }).replace(',', '')
          : '-',
    },
    {
      title: 'Refer By',
      dataIndex: 'referredBy',
      key: 'referredBy',
      width: 130,
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'action',
      render: (text, record) => (
        <button
          type="button"
          className="btn btn-small btn-warning btn-sm"
          onClick={() => handleUserEdit(record)}
        >
          Edit Info
        </button>
      ),
    },
    ];

    const bankAccountformik = useFormik({
        initialValues: {
            accountName: '',
            accountNo: '',
            bankName: '',
            ifscCode: '',
            upiId: '',
        },
        validationSchema: Yup.object({
            accountName: Yup.string()
                .min(3, 'Account Name must be at least 3 characters')
                .required('Account Name is required'),
            accountNo: Yup.string()
                .matches(/^\d{9,18}$/, 'Account Number must be 9-18 digits')
                .required('Account Number is required'),
            bankName: Yup.string()
                .required('Bank Name is required'),
            ifscCode: Yup.string()
                .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC Code')
                .required('IFSC Code is required'),
            upiId: Yup.string()
                .matches(
                    /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9.-]+$/,
                    'Invalid UPI ID format'
                )
                .required('UPI ID is required'),
        }),
        onSubmit: (values) => {
            const data = {
              accountName: values.accountName,
              accountNumber: values.accountNo,
              bankName: values.bankName,
              ifscCode: values.ifscCode,
              upiId: values.upiId,
          };
          console.log("isEditMode =>", isEditMode)
          if (selecteBankdData) {
            console.log("selecteBankdData =>", selecteBankdData)
            data['accountId'] = selecteBankdData._id;
            dispatch(editBankAccount(data)).then(() => {
              closeModal();
            });
          } else {
            dispatch(addBankAccount(data)).then(() => {
              closeModal();
            });
          }
        },
    });

    const closeModal = () => {
      if (modalRef.current) {
          const modalInstance = bootstrap.Modal.getInstance(modalRef.current) || new bootstrap.Modal(modalRef.current);
          modalInstance.hide();
          bankAccountformik.resetForm();
      }
  };

    const handleAddNewAccount = () => {
        setSelectedBankData(null); // Clear the form
        setIsEditMode(true); // Open in edit mode
        bankAccountformik.resetForm(); // Reset the form fields
    };

    const handleViewDetails = (record) => {
      console.log("record =>", record)
        setSelectedBankData(record); // Pre-fill the form with the selected record
        setIsEditMode(false); // Open in view-only mode
        bankAccountformik.setValues({
          accountName: record.accountName || '',
          accountNo: record.accountNumber || '',
          bankName: record.bankName || '',
          ifscCode: record.ifscCode || '',
          upiId: record.upiId || '',
        });
    };
    
    const handleEdit = (e) => {
      e.preventDefault(); 
        setIsEditMode(true); // Enable form fields for editing
    };

    const handleStatusChange = (checked, record) => {
      console.log("record =>", record._id)
      // Dispatch the action to update the `isActive` status in the Redux store
      dispatch(BankAccountStatusChange({ id: record._id, isActive: checked }));
    };

    useEffect(() => {
      dispatch(fetchAllBankAccounts())
      console.log("hii")
    }, [])

    const handleSearch = (e) => {
      setSearch(e.target.value);
      setCurrentPage(1); // Reset to first page on new search
    };

    const handleModalCancel = () => {
      setIsModalOpen(false);
      setSelectedUser(null);
    };

    const handleFormSubmit = async () => {
      const updatedData = {
        bonusAmount: parseFloat(formValues.bonusAmount),
        availableBalance: parseFloat(formValues.availableBalance),
        userId: selectedUser._id,
      };
    
      try {
        await dispatch(updateUser(updatedData));
        await dispatch(getAllUserList({ page: currentPage, limit: pageSize, search })); // Reload data
        setIsModalOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Failed to update user info:", error);
      }
    };

    const handleUserEdit = (record) => {
      setSelectedUser(record);
      console.log("record =>", record)
      setFormValues({
        bonusAmount: record.bonusAmount ,
        availableBalance: record.availableBalance,
        userId: record._id,
        Phone: record.Phone,
        refferCode: record.referralCode
      });
      setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
      const { name, value } = e.target;
      setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    };

    const handleGetUserBets = (userId) => {
      console.log("userId =>", userId)
      dispatch(getUserBets({userId}))
    }
    const handleGetUserDeposites = (userId) => {
      console.log("userId =>", userId)
    }
    const handleGetUserwithdrawls = (userId) => {
      console.log("userId =>", userId)
    }

    const handleSendNotification = async (e) => {
      e.preventDefault();

      try {
        const response = await api.post('admin/notification', {
          title: notifTitle,
          body: notifMessage,
        });
      
        if (response.status !== 200) {
          throw new Error('Failed to send notification');
        }
      
        alert('Notification sent successfully');
        setNotifTitle('');
        setNotifMessage('');
      } catch (error) {
        console.error('Notification error:', error);
        alert(error.response?.data?.message || error.message || 'Something went wrong!');
      }
    };

    useEffect(() => {
      dispatch(getAllUserList({ page: currentPage, limit: pageSize, search }));
    }, [currentPage, search, dispatch]);
  return (
    <>
        <div className="row">
            <div className="col-md-6">
                {/* <h4 className='text-center'>Bank Accounts</h4> */}
                <div className='text-center my-4'>
                    <button className="btn btn-success btn-sm" onClick={handleAddNewAccount} data-bs-toggle="modal" data-bs-target="#exampleModal">
                      Add New Bank Account
                    </button>
                </div>
                <Table
                    dataSource={allbankAccounts?.map((item) => ({
                      ...item,
                      key: item._id,
                    }))}
                    className="custom-table mt-2"
                    size="small"
                    columns={columns}
                    scroll={{ x: 'max-content', y: 500 }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: false,
                    }}
                    loading={loading}
                    // onChange={(pagination, filters, sorter) => {
                    //   setFilteredValue(filters.status || []); // Update filter value when user changes it
                    // }}
                />

                 {/* Modal placed inside this column */}
                <div className="custom-modal-container">
                   <div ref={modalRef} className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">Bank Details</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={bankAccountformik.handleSubmit} className="container">
                                        <div className="mb-3">
                                            <label htmlFor="accountName" className="form-label">Account Name</label>
                                            <input
                                                type="text"
                                                id="accountName"
                                                name="accountName"
                                                className={`form-control ${bankAccountformik.touched.accountName && bankAccountformik.errors.accountName ? 'is-invalid' : ''}`}
                                                value={bankAccountformik.values.accountName}
                                                onChange={bankAccountformik.handleChange}
                                                onBlur={bankAccountformik.handleBlur}
                                                disabled={!isEditMode}
                                            />
                                            {bankAccountformik.touched.accountName && bankAccountformik.errors.accountName ? (
                                                <div className="invalid-feedback">{bankAccountformik.errors.accountName}</div>
                                            ) : null}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label htmlFor="accountNo" className="form-label">Account Number</label>
                                            <input
                                                type="number"
                                                id="accountNo"
                                                name="accountNo"
                                                className={`form-control ${bankAccountformik.touched.accountNo && bankAccountformik.errors.accountNo ? 'is-invalid' : ''}`}
                                                value={bankAccountformik.values.accountNo}
                                                onChange={bankAccountformik.handleChange}
                                                onBlur={bankAccountformik.handleBlur}
                                                disabled={!isEditMode}
                                            />
                                            {bankAccountformik.touched.accountNo && bankAccountformik.errors.accountNo ? (
                                                <div className="invalid-feedback">{bankAccountformik.errors.accountNo}</div>
                                            ) : null}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label htmlFor="bankName" className="form-label">Bank Name</label>
                                            <input
                                                type="text"
                                                id="bankName"
                                                name="bankName"
                                                className={`form-control ${bankAccountformik.touched.bankName && bankAccountformik.errors.bankName ? 'is-invalid' : ''}`}
                                                value={bankAccountformik.values.bankName}
                                                onChange={bankAccountformik.handleChange}
                                                onBlur={bankAccountformik.handleBlur}
                                                disabled={!isEditMode}
                                            />
                                            {bankAccountformik.touched.bankName && bankAccountformik.errors.bankName ? (
                                                <div className="invalid-feedback">{bankAccountformik.errors.bankName}</div>
                                            ) : null}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label htmlFor="ifscCode" className="form-label">IFSC Code</label>
                                            <input
                                                type="text"
                                                id="ifscCode"
                                                name="ifscCode"
                                                className={`form-control ${bankAccountformik.touched.ifscCode && bankAccountformik.errors.ifscCode ? 'is-invalid' : ''}`}
                                                value={bankAccountformik.values.ifscCode}
                                                onChange={bankAccountformik.handleChange}
                                                onBlur={bankAccountformik.handleBlur}
                                                disabled={!isEditMode}
                                            />
                                            {bankAccountformik.touched.ifscCode && bankAccountformik.errors.ifscCode ? (
                                                <div className="invalid-feedback">{bankAccountformik.errors.ifscCode}</div>
                                            ) : null}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="upiId" className="form-label">UPI Id</label>
                                            <input
                                                type="text"
                                                id="upiId"
                                                name="upiId"
                                                className={`form-control ${bankAccountformik.touched.upiId && bankAccountformik.errors.upiId ? 'is-invalid' : ''}`}
                                                value={bankAccountformik.values.upiId}
                                                onChange={bankAccountformik.handleChange}
                                                onBlur={bankAccountformik.handleBlur}
                                                disabled={!isEditMode}
                                            />
                                            {bankAccountformik.touched.upiId && bankAccountformik.errors.upiId ? (
                                                <div className="invalid-feedback">{bankAccountformik.errors.upiId}</div>
                                            ) : null}
                                        </div>
                                        
                                        <div className="text-end">
                                            {!isEditMode && selecteBankdData ? (
                                                  <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={(e) => handleEdit(e)}
                                                  >
                                                    Edit
                                                  </button>
                                                ) : (
                                                  <button type="submit" className="btn btn-primary">
                                                     {loading ? <Spinner size="sm" /> : selecteBankdData ? 'Save Changes' : 'Add Account'}
                                                  </button>
                                                )
                                            }
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <Input
                  placeholder="Search by Refer Code or Phone"
                  value={search}
                  onChange={handleSearch}
                  className="mb-2 my-4"
                  style={{ width: '300px' }}
                />
                <Table
                  dataSource={userList?.map((item) => ({
                    ...item,
                    key: item._id,
                  }))}
                  className="custom-table mt-3"
                  size="small"
                  columns={userColumn}
                  scroll={{ x: 'max-content', y: 500 }}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    total: pagination?.totalUsers || 0,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  loading={userLoading}
                />

                  {/* User Info Modal */}

                <Modal
                  title="Edit User Info"
                  open={isModalOpen}
                  onCancel={handleModalCancel}
                  footer={[
                    <Button key="cancel" onClick={handleModalCancel}>
                      Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleFormSubmit}>
                      Save Changes
                    </Button>,
                  ]}
                >
                  <Form layout="vertical">
                    <Form.Item label="Bonus Amount">
                      <Input
                        type="number"
                        name="bonusAmount"
                        value={formValues.bonusAmount}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                    <Form.Item label="Available Balance">
                      <Input
                        type="number"
                        name="availableBalance"
                        value={formValues.availableBalance}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                    <Form.Item label="Available Balance">
                      <Input
                        type="text"
                        name="reffercode"
                        value={formValues.refferCode}
                        disabled
                      />
                    </Form.Item>
                  </Form>
                  <div className='d-flex justify-content-between'>
                    <button type="button" className="btn btn-small btn-dark btn-sm" onClick={() => handleGetUserBets(formValues.userId)}>All Bets</button>
                    <button type="button" className="btn btn-small btn-success btn-sm" onClick={() => handleGetUserDeposites(formValues.userId)}>All Deposites</button>
                    <button type="button" className="btn btn-small btn-danger btn-sm" onClick={() => handleGetUserwithdrawls(formValues.userId)}>All Withdrawls</button>
                  </div>
                </Modal>

                {/* user info modal  */}

            </div>
        </div>
        <div className="row">
          <div className="col-6">
            <div className='text-center my-4'>
              <button
                className="btn btn-success btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#notification"
              >
                Send Notification
              </button>
            </div>

            <div className="modal fade" id="notification" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <form onSubmit={handleSendNotification}>
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">Send Push Notification</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label htmlFor="notifTitle" className="form-label">Title</label>
                        <input
                          type="text"
                          id="notifTitle"
                          className="form-control"
                          value={notifTitle}
                          onChange={(e) => setNotifTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="notifMessage" className="form-label">Message</label>
                        <textarea
                          id="notifMessage"
                          className="form-control"
                          rows="3"
                          value={notifMessage}
                          onChange={(e) => setNotifMessage(e.target.value)}
                          required
                        ></textarea>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">Send</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6">

          </div>
        </div>
    </>
  )
}

export default AllDash