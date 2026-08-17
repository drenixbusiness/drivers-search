'use client'

import {Button, Card, Col, Input, Row, Space, Tooltip, Typography} from "antd";
import {DriversFilters} from "@/models/driver";
import {SearchOutlined, PhoneOutlined, MailOutlined, ReloadOutlined} from '@ant-design/icons';

const {Text} = Typography;

interface FiltersProps {
    value: DriversFilters;
    onChange: (v: DriversFilters) => void;
    onSearch: () => void;
    onReset: () => void;
    loading?: boolean;
    /** Description of the cached snapshot, shown under the inputs. */
    snapshotInfo?: string;
}

export default function Filters({
                                    value,
                                    onChange,
                                    onSearch,
                                    onReset,
                                    loading,
                                    snapshotInfo,
                                }: FiltersProps) {
    const set = <K extends keyof DriversFilters>(key: K, v: DriversFilters[K]) =>
        onChange({...value, [key]: v});

    const labelStyle = {fontSize: 12, color: '#8C94A6', display: 'block', marginBottom: 6} as const;

    return (
        <Card
            styles={{body: {padding: 20}}}
            style={{borderRadius: 16, marginBottom: 24, border: 'none'}}
        >
            <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} sm={12} md={7}>
                    <label style={labelStyle}>Driver name</label>
                    <Input
                        allowClear
                        size="large"
                        placeholder="Search by name"
                        prefix={<SearchOutlined style={{color: '#B4BCCC'}}/>}
                        value={value.search}
                        onChange={(e) => set('search', e.target.value)}
                        onPressEnter={onSearch}
                    />
                </Col>

                <Col xs={24} sm={12} md={7}>
                    <label style={labelStyle}>Phone number</label>
                    <Input
                        allowClear
                        size="large"
                        placeholder="Search by phone number"
                        prefix={<PhoneOutlined style={{color: '#B4BCCC'}}/>}
                        value={value.phoneNumber}
                        onChange={(e) => set('phoneNumber', e.target.value)}
                        onPressEnter={onSearch}
                    />
                </Col>

                <Col xs={24} sm={12} md={7}>
                    <label style={labelStyle}>Email</label>
                    <Input
                        allowClear
                        size="large"
                        placeholder="Search by email"
                        prefix={<MailOutlined style={{color: '#B4BCCC'}}/>}
                        value={value.email}
                        onChange={(e) => set('email', e.target.value)}
                        onPressEnter={onSearch}
                    />
                </Col>

                <Col xs={12} sm={6} md={3}>
                    {/* Buttons stretch so the row fills the card instead of leaving a gap. */}
                    <Space.Compact block size="large">
                        <Button
                            type="primary"
                            size="large"
                            icon={<SearchOutlined/>}
                            onClick={onSearch}
                            loading={loading}
                            style={{flex: 1}}
                        >
                            Search
                        </Button>
                        <Tooltip title="Clear filters">
                            <Button size="large" icon={<ReloadOutlined/>} onClick={onReset}/>
                        </Tooltip>
                    </Space.Compact>
                </Col>
            </Row>

            {snapshotInfo && (
                <Text type="secondary" style={{fontSize: 12, display: 'block', marginTop: 12}}>
                    {snapshotInfo}
                </Text>
            )}
        </Card>
    )
}
