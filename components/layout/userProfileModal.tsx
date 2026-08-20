'use client'

import {Avatar, Button, Descriptions, Modal, Space, Tag, Typography} from "antd";
import {LogoutOutlined} from '@ant-design/icons';
import {useRouter} from "next/navigation";
import {CurrentUser} from "@/lib/config/currentUser";

const {Text, Title} = Typography;

interface UserProfileModalProps {
    user: CurrentUser;
    open: boolean;
    onClose: () => void;
}

/** Renders a value, or a muted placeholder when the field has not been filled in. */
function Field({value}: { value: string }) {
    return value ? <Text copyable={{text: value}}>{value}</Text> : <Text type="secondary">Not set</Text>;
}

export default function UserProfileModal({user, open, onClose}: UserProfileModalProps) {
    const router = useRouter();

    const logout = () => {
        onClose();
        router.push('/login');
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={520}
            style={{maxWidth: 'calc(100vw - 32px)'}}
            title="My profile"
            footer={[
                <Button key="logout" danger icon={<LogoutOutlined/>} onClick={logout}>
                    Log out
                </Button>,
                <Button key="close" type="primary" onClick={onClose}>
                    Close
                </Button>,
            ]}
        >
            <Space direction="vertical" size={20} style={{width: '100%'}}>
                <Space size={16} align="center">
                    <Avatar src={user.avatar} alt={user.name} size={72} shape="square" style={{borderRadius: 16}}/>
                    <Space direction="vertical" size={2}>
                        <Title level={4} style={{margin: 0}}>{user.name}</Title>
                        {user.role
                            ? <Tag color="blue">{user.role}</Tag>
                            : <Text type="secondary">Role not set</Text>}
                    </Space>
                </Space>

                <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Username"><Field value={user.username}/></Descriptions.Item>
                    <Descriptions.Item label="Email"><Field value={user.email}/></Descriptions.Item>
                    <Descriptions.Item label="Phone"><Field value={user.phone}/></Descriptions.Item>
                    <Descriptions.Item label="Role"><Field value={user.role}/></Descriptions.Item>
                </Descriptions>

                <Text type="secondary" style={{fontSize: 12}}>
                    These details come from lib/config/currentUser.ts. Once login is connected to a
                    real API, fill them from the signed-in user instead.
                </Text>
            </Space>
        </Modal>
    );
}
