'use client'

import {Card, Empty, Modal, Space, Typography} from "antd";
import {DriverApplication} from "@/models/driver";
import OutcomeTag from "@/components/drivers/outcomeTag";

const {Paragraph, Text} = Typography;

interface CommentsModalProps {
    application: DriverApplication | null;
    open: boolean;
    onClose: () => void;
}

export default function CommentsModal({application, open, onClose}: CommentsModalProps) {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={640}
            destroyOnClose
            title={
                application ? (
                    <Space size={8} wrap>
                        <span>Comments — {application.name}</span>
                        <OutcomeTag outcome={application.outcome}/>
                    </Space>
                ) : (
                    'Comments'
                )
            }
        >
            {!application ? null : (
                <Space direction="vertical" size={16} style={{width: '100%'}}>
                    <Text type="secondary" style={{fontSize: 12}}>
                        {application.boardName}
                        {application.groupName ? ` · ${application.groupName}` : ''}
                    </Text>

                    {application.notes.length === 0 ? (
                        <Empty description="This record has no notes"/>
                    ) : (
                        application.notes.map((note) => (
                            <Card key={note.id} size="small" title={note.title}>
                                <Paragraph style={{whiteSpace: 'pre-wrap', marginBottom: 0}}>
                                    {note.value}
                                </Paragraph>
                            </Card>
                        ))
                    )}
                </Space>
            )}
        </Modal>
    );
}
