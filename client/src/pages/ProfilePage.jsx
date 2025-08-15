import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Typography, Space, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '@/redux/auth/actions';
import MainLayout from '@/layout/MainLayout';
import ProfileLayout from '@/layout/ProfileLayout';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { current: user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, form]);

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      await dispatch(updateProfile(values));
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    // Navigate to change password page or show modal
    console.log('Change password clicked');
  };

  return (
    <MainLayout>
      <ProfileLayout>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={100} icon={<UserOutlined />} style={{ marginBottom: '20px' }} />
              <Title level={2}>Profile Settings</Title>
              <Text type="secondary">Manage your account information</Text>
            </div>

            <Card>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                size="large"
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your name!' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Full Name"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    disabled
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={loading}
                    block
                  >
                    Update Profile
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <Card title="Security">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>Change your password to keep your account secure</Text>
                <Button 
                  icon={<LockOutlined />}
                  onClick={handleChangePassword}
                >
                  Change Password
                </Button>
              </Space>
            </Card>

            <Card title="Account Information">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Member since:</Text>
                  <Text style={{ marginLeft: '10px' }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text strong>Last login:</Text>
                  <Text style={{ marginLeft: '10px' }}>
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text strong>Files processed:</Text>
                  <Text style={{ marginLeft: '10px' }}>
                    {user?.filesProcessed || 0}
                  </Text>
                </div>
              </Space>
            </Card>
          </Space>
        </div>
      </ProfileLayout>
    </MainLayout>
  );
};

export default ProfilePage;
