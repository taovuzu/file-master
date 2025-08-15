// src/components/Header.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Dropdown, Avatar, Badge } from 'antd';
import { 
  UserOutlined, 
  BellOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Menu as MenuIcon,
  Search,
  FileText as FileTextIcon,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      icon: <User className="w-4 h-4" />,
      label: 'My Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      label: 'Sign Out',
      onClick: () => {
        // Handle logout logic here
        setIsLoggedIn(false);
        navigate('/login');
      },
    },
  ];

  // Navigation menu items
  const navItems = [
    { key: 'merge', label: 'Merge PDF', icon: <FileTextIcon className="w-4 h-4" />, path: '/merge' },
    { key: 'split', label: 'Split PDF', icon: <FileTextIcon className="w-4 h-4" />, path: '/split' },
    { key: 'compress', label: 'Compress PDF', icon: <FileTextIcon className="w-4 h-4" />, path: '/compress' },
    { key: 'convert', label: 'Convert PDF', icon: <FileTextIcon className="w-4 h-4" />, path: '/convert' },
    { key: 'protect', label: 'Protect PDF', icon: <FileTextIcon className="w-4 h-4" />, path: '/protect' },
  ];

  const handleNavItemClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      // Handle logout
      setIsLoggedIn(false);
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  const handleGetStartedClick = () => {
    navigate('/home');
  };

  return (
    <AntHeader className="bg-white border-b border-gray-100 px-6 py-0 h-16 flex items-center justify-between shadow-soft">
      {/* Logo Section */}
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg">
            <FileTextIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">FileMaster</h1>
            <p className="text-xs text-gray-500 -mt-1">PDF Tools</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavItemClick(item.path)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                location.pathname === item.path
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search PDF tools..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200">
          <Bell className="w-5 h-5" />
          <Badge count={3} size="small" className="absolute -top-1 -right-1" />
        </button>

        {/* User Section */}
        {isLoggedIn ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <button className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200">
              <Avatar 
                size={32} 
                className="bg-gradient-to-r from-primary-600 to-primary-700"
                icon={<User className="w-4 h-4" />}
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700">John Doe</span>
            </button>
          </Dropdown>
        ) : (
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleAuthClick}
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Sign In
            </button>
            <button 
              onClick={handleGetStartedClick}
                             className="btn-primary bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:shadow-glow hover:scale-105"
             >
               <Sparkles className="w-4 h-4" />
               <span>Get Started</span>
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-medium lg:hidden z-50">
          <div className="px-6 py-4 space-y-2">
            {/* Mobile Search */}
            <div className="flex items-center relative mb-4">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search PDF tools..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavItemClick(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-left ${
                    location.pathname === item.path
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-100">
              {isLoggedIn ? (
                <button
                  onClick={handleAuthClick}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleAuthClick}
                    className="w-full flex items-center justify-center px-4 py-3 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleGetStartedClick}
                                         className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-glow"
                   >
                     <Sparkles className="w-4 h-4" />
                     <span>Get Started</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AntHeader>
  );
};

export default Header;
