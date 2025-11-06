/**
 * KOL 批量导入页面
 */

import React, { useState } from 'react';
import { Card, Input, Button, Space, Alert, Table, Tag, message } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useKOLStore } from '../../store/kol.store';
import type { BatchImportResult } from '../../types/kol';

const { TextArea } = Input;

const KOLImport: React.FC = () => {
  const navigate = useNavigate();
  const { batchImport, loading } = useKOLStore();
  const [inputText, setInputText] = useState('');
  const [importResult, setImportResult] = useState<BatchImportResult | null>(null);

  // 处理导入
  const handleImport = async () => {
    if (!inputText.trim()) {
      message.warning('请输入要导入的用户名');
      return;
    }

    // 按行分割，过滤空行
    const inputs = inputText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (inputs.length === 0) {
      message.warning('没有有效的输入');
      return;
    }

    if (inputs.length > 100) {
      message.warning('一次最多导入 100 个 KOL');
      return;
    }

    const result = await batchImport(inputs);
    if (result) {
      setImportResult(result);
      setInputText(''); // 清空输入框
    }
  };

  // 返回列表
  const handleBack = () => {
    navigate('/kols');
  };

  // 导入结果表格列
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Twitter 用户名',
      dataIndex: 'username',
      key: 'username',
      render: (username: string) => (
        <a
          href={`https://twitter.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{username}
        </a>
      ),
    },
    {
      title: '显示名',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="blue">新添加</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: '16px', padding: 0 }}
      >
        返回列表
      </Button>

      <Card title="批量导入 KOL" style={{ marginBottom: '24px' }}>
        <Alert
          message="导入说明"
          description={
            <div>
              <p>支持以下格式（每行一个）：</p>
              <ul>
                <li>
                  <code>@username</code> - 带 @ 的用户名
                </li>
                <li>
                  <code>username</code> - 纯用户名
                </li>
                <li>
                  <code>https://twitter.com/username</code> - Twitter URL
                </li>
                <li>
                  <code>https://x.com/username</code> - X.com URL
                </li>
              </ul>
              <p>一次最多导入 100 个 KOL，系统会自动去重。</p>
            </div>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`请输入要导入的 Twitter 用户名，每行一个：\n@elonmusk\njack\nhttps://twitter.com/naval\nhttps://x.com/pmarca`}
            rows={12}
            showCount
            maxLength={10000}
          />

          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleImport}
            loading={loading}
            size="large"
          >
            开始导入
          </Button>
        </Space>
      </Card>

      {/* 导入结果 */}
      {importResult && (
        <Card title="导入结果">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 统计信息 */}
            <Alert
              message={
                <div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                    成功: <Tag color="green">{importResult.success}</Tag> |
                    失败: <Tag color="red">{importResult.failed}</Tag> |
                    重复: <Tag color="orange">{importResult.duplicate}</Tag>
                  </p>
                </div>
              }
              type="success"
              showIcon
            />

            {/* 错误信息 */}
            {importResult.errors.length > 0 && (
              <Alert
                message="错误列表"
                description={
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                }
                type="error"
                showIcon
              />
            )}

            {/* 成功导入的 KOL 列表 */}
            {importResult.imported.length > 0 && (
              <>
                <h3>成功导入的 KOL ({importResult.imported.length})</h3>
                <Table
                  columns={columns}
                  dataSource={importResult.imported}
                  rowKey="id"
                  pagination={false}
                />
              </>
            )}

            {/* 返回按钮 */}
            <Button type="primary" onClick={handleBack}>
              返回 KOL 列表
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default KOLImport;
