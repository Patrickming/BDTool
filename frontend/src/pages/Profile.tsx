/**
 * 个人资料页面
 */

import { useState, useRef } from "react";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Avatar,
  Tag,
  Form,
  Input,
  message,
  Modal,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  CameraOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/types/auth";

// 获取完整的头像 URL
const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return undefined;
  // 如果已经是完整 URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  // 否则拼接后端服务器地址
  return `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}/uploads/avatars/${avatar}`;
};

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return null;
  }

  // 处理头像上传
  const handleAvatarUpload = async (file: File) => {
    try {
      setLoading(true);

      // 创建 FormData
      const formData = new FormData();
      formData.append("avatar", file);

      // 调用上传头像的 API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      // 获取响应文本
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = '头像上传失败';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // 解析JSON响应
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('服务器响应格式错误');
      }

      // 使用返回的用户数据（包含 avatar 文件名）
      const updatedUser: User = {
        ...user,
        ...data.data,
      };

      setUser(updatedUser, localStorage.getItem("auth_token") || "");
      message.success("头像上传成功");
    } catch (error: any) {
      console.error('头像上传错误:', error);
      message.error(error.message || "头像上传失败");
    } finally {
      setLoading(false);
    }
  };

  // 点击头像触发文件选择
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith("image/")) {
        message.error("请上传图片文件");
        return;
      }
      // 验证文件大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        message.error("图片大小不能超过 5MB");
        return;
      }
      handleAvatarUpload(file);
    }
  };

  // 处理个人信息更新
  const handleUpdateProfile = async (values: {
    fullName: string;
    email: string;
    company?: string;
  }) => {
    setLoading(true);
    try {
      // 调用更新用户信息的 API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新失败');
      }

      const data = await response.json();
      const updatedUser: User = data.data;

      setUser(updatedUser, localStorage.getItem("auth_token") || "");
      message.success("个人信息更新成功");
      setEditModalVisible(false);
      editForm.resetFields();
    } catch (error: any) {
      message.error(error.message || "更新失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理密码修改
  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setLoading(true);
    try {
      // 调用修改密码的 API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '密码修改失败');
      }

      message.success("密码修改成功");
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.message || "密码修改失败");
    } finally {
      setLoading(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = () => {
    editForm.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      company: user.company || "",
    });
    setEditModalVisible(true);
  };

  return (
    <div>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#ffffff",
            marginBottom: 24,
          }}
        >
          个人资料
        </h1>
      </motion.div>

      {/* 个人信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <UserOutlined style={{ color: "#9945FF" }} />
              <span>基本信息</span>
            </div>
          }
          extra={
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={openEditModal}
              >
                编辑资料
              </Button>
              <Button
                icon={<LockOutlined />}
                onClick={() => setPasswordModalVisible(true)}
              >
                修改密码
              </Button>
            </Space>
          }
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            marginBottom: 24,
          }}
          headStyle={{
            color: "#fff",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          bodyStyle={{
            padding: 32,
          }}
        >
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
            {/* 头像 - 可点击上传 */}
            <div style={{ position: "relative" }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                style={{ cursor: "pointer", position: "relative" }}
                onClick={handleAvatarClick}
              >
                <Avatar
                  size={120}
                  src={getAvatarUrl(user.avatar)}
                  icon={!user.avatar && <UserOutlined />}
                  style={{
                    background: user.avatar
                      ? "#fff"
                      : "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
                    boxShadow: "0 4px 16px rgba(153, 69, 255, 0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #1a1a2e",
                    boxShadow: "0 2px 8px rgba(153, 69, 255, 0.4)",
                  }}
                >
                  <CameraOutlined style={{ color: "white", fontSize: 16 }} />
                </div>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            {/* 信息列表 */}
            <div style={{ flex: 1 }}>
              <Descriptions
                column={1}
                labelStyle={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: 14,
                  width: 120,
                }}
                contentStyle={{ color: "#fff", fontSize: 15 }}
              >
                <Descriptions.Item
                  label={
                    <>
                      <IdcardOutlined /> 用户 ID
                    </>
                  }
                >
                  {user.id}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined /> 姓名
                    </>
                  }
                >
                  {user.fullName}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined /> 邮箱
                    </>
                  }
                >
                  {user.email}
                </Descriptions.Item>
                {user.company && (
                  <Descriptions.Item
                    label={
                      <>
                        <TeamOutlined /> 公司
                      </>
                    }
                  >
                    {user.company}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="角色">
                  <Tag color={user.role === "admin" ? "purple" : "blue"}>
                    {user.role === "admin"
                      ? "👑 管理员"
                      : user.company
                      ? `👤 ${user.company} 团队成员`
                      : "👤 团队成员"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 编辑资料模态框 */}
      <Modal
        title="编辑个人资料"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
          autoComplete="off"
        >
          <Form.Item
            name="fullName"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入姓名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item name="company" label="所在公司">
            <Input
              prefix={<TeamOutlined />}
              placeholder="请输入所在公司（如：binance）"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setEditModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          autoComplete="off"
        >
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: "请输入当前密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入当前密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码至少6位" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码（至少6位）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setPasswordModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                确认修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
