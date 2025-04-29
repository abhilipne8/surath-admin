import React, { useState } from 'react';
import {
  BankOutlined,
  ContainerOutlined,
  DashboardOutlined,
  FallOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname;

  // Retrieve user details from localStorage
  const adminEmail = localStorage.getItem('adminEmail');
  const adminMobile = localStorage.getItem('adminMobile');

  // Check if the user is Sunil
  const isSunil =
    adminEmail === 'sunilshendge0304@gmail.com' &&
    adminMobile === '7219015613';

  // Check if the user is Abhilipne
  const isAbhilipne =
    adminEmail === 'abhilipne2017@gmail.com' &&
    adminMobile === '9130203486';

  // Menu items
  const menuItems = [
    {
      key: '/withdrawal-list',
      icon: <BankOutlined />,
      label: 'Withdrawal',
    },
    {
      key: '/deposite-list',
      icon: <FallOutlined />,
      label: 'Deposite',
    },
    {
      key: '/summary',
      icon: <ContainerOutlined />,
      label: 'Summary',
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      children: [
        {
          key: '/dashboard/all-dash',
          label: 'All Dash',
        },
        {
          key: '/dashboard/surath-dash',
          label: 'Surath Dash',
        },
        {
          key: '/dashboard/color-dash',
          label: 'Color Dash',
        },
      ],
    },
  ];

  // Filter menu items based on user
  const filteredItems = isSunil
    ? menuItems.filter((item) => item.key === '/summary') // Sunil sees only "Summary"
    : isAbhilipne
    ? menuItems // Abhilipne sees all pages
    : menuItems.filter(
        (item) => item.key !== '/summary' && item.key !== '/dashboard' // Other users cannot see "Summary" or "Dashboard"
      );

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (e) => {
    navigate(e.key);
    setCollapsed(true); // Auto-close sidebar on mobile after navigation
  };

  const handleLogOut = () => {
    // Clear all relevant localStorage keys
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminMobile');
  
    // Navigate to login
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 d-flex justify-content-between">
        <Button type="primary" onClick={toggleCollapsed}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        <Button
          style={{
            backgroundColor: 'red',
            border: '2px solid yellow',
            color: 'white',
          }}
          onClick={handleLogOut}
        >
          Logout
        </Button>
      </nav>

      <div
        style={{
          display: 'flex',
          height: 'calc(100% - 56px)',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            position: 'fixed',
            left: collapsed ? '-100%' : '0',
            width: '80%',
            maxWidth: '256px',
            height: 'calc(100% - 56px)',
            transition: 'left 0.3s ease',
            backgroundColor: '#001529',
            zIndex: 1000,
            overflowY: 'auto',
          }}
        >
          <Menu
            selectedKeys={[selectedKey]}
            mode="inline"
            theme="dark"
            items={filteredItems}
            onClick={handleMenuClick}
            style={{
              height: '100%',
              paddingTop: '30px',
            }}
          />
        </div>

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            background: '#f0f2f5',
            marginLeft: collapsed ? 0 : '256px', // Adjust for desktop open/close
            transition: 'margin-left 0.3s ease',
            width: '100%',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
