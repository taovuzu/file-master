
import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Divider,
  message,
  Upload,
  Tabs,
  Row,
  Col,
  Badge,
  Statistic,
  Progress,
  List,
  Tag,
  Space } from
'antd';
import {
  UserOutlined,
  SettingOutlined,
  UploadOutlined,
  EditOutlined,
  SaveOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  FileTextOutlined,
  DownloadOutlined,
  HistoryOutlined,
  CrownOutlined,
  SecurityScanOutlined,
  NotificationOutlined,
  EyeOutlined } from
'@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';

import MainLayout from '@/layout/MainLayout';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const processingHistory = useSelector((state) => state.pdfTools.history) || [];
  const dispatch = useDispatch();

  const [userStats] = useState({
    filesProcessed: 143,
    totalSize: '2.4 GB',
    toolsUsed: 8,
    memberSince: '2023'
  });

  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      processing: true,
      marketing: false
    },
    privacy: {
      profileVisible: false,
      historyVisible: false,
      analyticsEnabled: true
    },
    preferences: {
      autoDownload: true,
      compressionLevel: 'medium',
      defaultFormat: 'pdf'
    }
  });

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        company: currentUser.company || '',
        role: currentUser.role || ''
      });
    }
  }, [currentUser, form]);

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {

      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {

      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (values) => {
    setLoading(true);
    try {
      setUserSettings({ ...userSettings, ...values });
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('Settings updated successfully!');
    } catch (error) {
      message.error('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const recentActivity = [
  { tool: 'Merge PDF', files: 3, date: '2 hours ago', status: 'completed' },
  { tool: 'Compress PDF', files: 1, date: '1 day ago', status: 'completed' },
  { tool: 'Convert PDF', files: 2, date: '3 days ago', status: 'completed' },
  { tool: 'Split PDF', files: 1, date: '1 week ago', status: 'completed' }];


  const profileTabItems = [
  {
    key: 'profile',
    label:
    <span className="flex items-center gap-2">
          <UserOutlined />
          Profile
        </span>,

    children:
    <div className="space-y-6">
          {}
          <Card className="card-modern border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar
              size={120}
              src={currentUser?.avatar}
              className="ring-4 ring-primary-100 bg-gradient-to-r from-primary-600 to-primary-700"
              icon={<UserOutlined />} />
            
                <Upload
              showUploadList={false}
              beforeUpload={() => false}
              className="absolute bottom-0 right-0">
              
                  <Button
                type="primary"
                shape="circle"
                size="small"
                icon={<UploadOutlined />}
                className="shadow-lg hover:scale-105 transition-transform" />
              
                </Upload>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <Title level={3} className="text-gray-900 mb-1">
                      {currentUser?.name || 'User Name'}
                    </Title>
                    <Text className="text-gray-600 text-base">
                      {currentUser?.email || 'user@example.com'}
                    </Text>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge status="success" />
                      <Text className="text-gray-500">Active Account</Text>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                  type={editMode ? "default" : "primary"}
                  icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                  onClick={() => setEditMode(!editMode)}
                  className={editMode ? "btn-secondary" : "btn-primary shadow-sm"}>
                  
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card className="card-modern text-center border border-gray-200">
                <Statistic
              title="Files Processed"
              value={userStats.filesProcessed}
              valueStyle={{ color: '#3b82f6' }} />
            
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="card-modern text-center border border-gray-200">
                <Statistic
              title="Total Size"
              value={userStats.totalSize}
              valueStyle={{ color: '#059669' }} />
            
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="card-modern text-center border border-gray-200">
                <Statistic
              title="Tools Used"
              value={userStats.toolsUsed}
              valueStyle={{ color: '#dc2626' }} />
            
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="card-modern text-center border border-gray-200">
                <Statistic
              title="Member Since"
              value={userStats.memberSince}
              valueStyle={{ color: '#7c3aed' }} />
            
              </Card>
            </Col>
          </Row>

          {}
          <Card
        title={<span className="text-gray-900 font-semibold">Personal Information</span>}
        className="card-modern border border-gray-200">
        
            <Form
          form={form}
          layout="vertical"
          onFinish={handleProfileUpdate}
          disabled={!editMode}>
          
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                name="name"
                label={<span className="text-gray-700 font-medium">Full Name</span>}
                rules={[{ required: true, message: 'Please enter your name!' }]}>
                
                    <Input
                  placeholder="Enter your full name"
                  className="input-modern h-12" />
                
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                name="email"
                label={<span className="text-gray-700 font-medium">Email Address</span>}
                rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }]
                }>
                
                    <Input
                  placeholder="Enter your email"
                  className="input-modern h-12"
                  disabled />
                
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                name="phone"
                label={<span className="text-gray-700 font-medium">Phone Number</span>}>
                
                    <Input
                  placeholder="Enter your phone number"
                  className="input-modern h-12" />
                
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                name="company"
                label={<span className="text-gray-700 font-medium">Company</span>}>
                
                    <Input
                  placeholder="Enter your company name"
                  className="input-modern h-12" />
                
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
            name="role"
            label={<span className="text-gray-700 font-medium">Job Title</span>}>
            
                <Input
              placeholder="Enter your job title"
              className="input-modern h-12" />
            
              </Form.Item>

              {editMode &&
          <Form.Item>
                  <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="btn-primary h-12 px-8">
              
                    Save Changes
                  </Button>
                </Form.Item>
          }
            </Form>
          </Card>

          {}
          <Card
        title={<span className="text-gray-900 font-semibold">Recent Activity</span>}
        className="card-modern border border-gray-200">
        
            <List
          dataSource={recentActivity}
          renderItem={(item) =>
          <List.Item className="border-b border-gray-100 last:border-b-0 py-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileTextOutlined className="text-primary-600" />
                      </div>
                      <div>
                        <Text strong className="text-gray-900">{item.tool}</Text>
                        <br />
                        <Text className="text-gray-500 text-sm">{item.files} file(s) processed</Text>
                      </div>
                    </div>
                    <div className="text-right">
                      <Tag color="success" className="mb-1">Completed</Tag>
                      <br />
                      <Text className="text-gray-500 text-sm">{item.date}</Text>
                    </div>
                  </div>
                </List.Item>
          } />
        
          </Card>
        </div>

  },
  {
    key: 'security',
    label:
    <span className="flex items-center gap-2">
          <LockOutlined />
          Security
        </span>,

    children:
    <div className="space-y-6">
          <Card
        title={<span className="text-gray-900 font-semibold">Change Password</span>}
        className="card-modern border border-gray-200">
        
            <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}>
          
              <Form.Item
            name="currentPassword"
            label={<span className="text-gray-700 font-medium">Current Password</span>}
            rules={[{ required: true, message: 'Please enter your current password!' }]}>
            
                <Input.Password
              placeholder="Enter current password"
              className="input-modern h-12" />
            
              </Form.Item>

              <Form.Item
            name="newPassword"
            label={<span className="text-gray-700 font-medium">New Password</span>}
            rules={[
            { required: true, message: 'Please enter a new password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }]
            }>
            
                <Input.Password
              placeholder="Enter new password"
              className="input-modern h-12" />
            
              </Form.Item>

              <Form.Item
            name="confirmPassword"
            label={<span className="text-gray-700 font-medium">Confirm New Password</span>}
            dependencies={['newPassword']}
            rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              }
            })]
            }>
            
                <Input.Password
              placeholder="Confirm new password"
              className="input-modern h-12" />
            
              </Form.Item>

              <Form.Item>
                <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="btn-primary h-12 px-8">
              
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card
        title={<span className="text-gray-900 font-semibold">Security Settings</span>}
        className="card-modern border border-gray-200">
        
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {}
                  <div>
                    <Text strong className="text-gray-900">Two-Factor Authentication</Text>
                    <br />
                    <Text className="text-gray-500 text-sm">Add an extra layer of security</Text>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <SecurityScanOutlined className="text-primary-600 text-xl" />
                  <div>
                    <Text strong className="text-gray-900">Login Notifications</Text>
                    <br />
                    <Text className="text-gray-500 text-sm">Get notified of new sign-ins</Text>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>

  },
  {
    key: 'settings',
    label:
    <span className="flex items-center gap-2">
          <SettingOutlined />
          Settings
        </span>,

    children:
    <div className="space-y-6">
          <Card
        title={<span className="text-gray-900 font-semibold">General Settings</span>}
        className="card-modern border border-gray-200">
        
            <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleSettingsUpdate}
          initialValues={userSettings}>
          
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                name="language"
                label={<span className="text-gray-700 font-medium">Language</span>}>
                
                    <Select className="h-12">
                      <Option value="en">English</Option>
                      <Option value="es">Español</Option>
                      <Option value="fr">Français</Option>
                      <Option value="de">Deutsch</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                name="theme"
                label={<span className="text-gray-700 font-medium">Theme</span>}>
                
                    <Select className="h-12">
                      <Option value="light">Light</Option>
                      <Option value="dark">Dark</Option>
                      <Option value="system">System</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={5} className="text-gray-900 mb-4">Notification Preferences</Title>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BellOutlined className="text-primary-600 text-xl" />
                    <div>
                      <Text strong className="text-gray-900">Email Notifications</Text>
                      <br />
                      <Text className="text-gray-500 text-sm">Receive updates via email</Text>
                    </div>
                  </div>
                  <Form.Item name={['notifications', 'email']} valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <NotificationOutlined className="text-primary-600 text-xl" />
                    <div>
                      <Text strong className="text-gray-900">Processing Updates</Text>
                      <br />
                      <Text className="text-gray-500 text-sm">Get notified when files are ready</Text>
                    </div>
                  </div>
                  <Form.Item name={['notifications', 'processing']} valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </div>

              <Divider />

              <Title level={5} className="text-gray-900 mb-4">Privacy Settings</Title>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <EyeOutlined className="text-primary-600 text-xl" />
                    <div>
                      <Text strong className="text-gray-900">Analytics</Text>
                      <br />
                      <Text className="text-gray-500 text-sm">Help us improve by sharing usage data</Text>
                    </div>
                  </div>
                  <Form.Item name={['privacy', 'analyticsEnabled']} valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </div>

              <Form.Item className="mt-6">
                <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="btn-primary h-12 px-8">
              
                  Save Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

  }];


  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <Title level={2} className="text-gray-900 mb-2">My Account</Title>
            <Paragraph className="text-gray-600">
              Manage your profile, security settings, and preferences
            </Paragraph>
          </div>

          <Tabs
            defaultActiveKey="profile"
            items={profileTabItems}
            size="large"
            className="profile-tabs bg-white rounded-lg shadow-soft p-6"
            tabBarStyle={{ marginBottom: '24px' }} />
          
        </div>
      </div>
    </MainLayout>);

};

export default ProfilePage;