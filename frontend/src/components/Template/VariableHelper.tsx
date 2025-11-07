/**
 * 变量帮助面板组件
 */

import React from 'react';
import { Card, Typography, Button, Space, Divider } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { AVAILABLE_VARIABLES } from '@/types/template';

const { Title, Text } = Typography;

interface VariableHelperProps {
  onInsert?: (variable: string) => void;
}

export const VariableHelper: React.FC<VariableHelperProps> = ({ onInsert }) => {
  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(variable);
  };

  return (
    <Card
      title="可用变量"
      size="small"
      style={{
        maxHeight: '500px',
        overflowY: 'auto',
      }}
    >
      {AVAILABLE_VARIABLES.map((group, index) => (
        <div key={group.category} style={{ marginBottom: '16px' }}>
          <Title level={5} style={{ fontSize: '14px', marginBottom: '8px', color: '#9945FF' }}>
            {group.category}
          </Title>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {group.variables.map((variable) => (
              <Card
                key={variable.name}
                size="small"
                style={{
                  background: 'rgba(153, 69, 255, 0.05)',
                  border: '1px solid rgba(153, 69, 255, 0.2)',
                }}
                bodyStyle={{ padding: '8px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text code style={{ fontSize: '13px' }}>
                      {variable.name}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {variable.description}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                      示例: {variable.example}
                    </Text>
                  </div>
                  <Space>
                    {onInsert && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => onInsert(variable.name)}
                        style={{ padding: '0 4px' }}
                      >
                        插入
                      </Button>
                    )}
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(variable.name)}
                      style={{ padding: '0 4px' }}
                    />
                  </Space>
                </div>
              </Card>
            ))}
          </Space>
          {index < AVAILABLE_VARIABLES.length - 1 && <Divider style={{ margin: '12px 0' }} />}
        </div>
      ))}
    </Card>
  );
};
