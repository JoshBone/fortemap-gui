import {Button, message, notification, Modal, Popconfirm, Table, Tooltip, Space} from "antd";
import style from "./LocationsPanel.module.scss";
import { HiOutlineDocumentText, HiPlus, HiOutlineLocationMarker, HiOutlineTrash } from "react-icons/hi";
import {useState} from "react";
import {ReactOsmGeocoding} from "@paraboly/react-osm-geocoding";
import LocationForm from "@/components/LocationsPanel/LocationForm";

const LocationsPanel = ({locationsData, onRowClick, onLocationEdit, onLocationEditClose}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState({});
    const [action, setAction] = useState()

    const [mapPointEditing, setMapPointEditing] = useState(undefined)

    const [api, contextHolder] = notification.useNotification();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const confirm = (e) => {
        message.success('Lokáció sikeresen törölve!');
    };

    const handleEditClick = (record) => {
        setAction('edit');
        setSelectedRowKeys([record.id]);
        setSelectedRecord(record);
        setModalOpen(true);
    }

    const onClose = (key) => {
        setMapPointEditing(undefined)
        onLocationEditClose()
        api.destroy(key)
    }

    const handleLocationEditClick = (record) => {
        onLocationEdit(record)
        setMapPointEditing(record.id)
        setSelectedRowKeys([record.id]);

        const btn = (
            <Space>
                <Button type="link" size="small" onClick={() => onClose('locationEdit')}>
                    Bezárás
                </Button>
            </Space>
        );

        api.open({
            message: 'Jelölőpont módosítása',
            duration: 0,
            description:
                `${record.original_address} - Mozgasd a jelölőpontot a térképen a cím módosításához!`,
            btn,
            key: 'locationEdit',
            onClose: onClose,
        });
    }

    const renderActions = (text, record, index) => {
        return (
            <div className={style.Actions}>
                <Tooltip title="Cím módosítás">
                    <Button size={'small'} icon={<HiOutlineDocumentText />} onClick={() => handleEditClick(record)} />
                </Tooltip>
                <Tooltip title="Jelölőpont módosítás">
                    <Button
                        type={mapPointEditing === record.id ? 'primary' : 'default'}
                        size={'small'}
                        icon={<HiOutlineLocationMarker/>} onClick={() => handleLocationEditClick(record)} />
                </Tooltip>
                <Tooltip title="Törlés">
                    <Popconfirm
                        title="Cím törlése"
                        description="Biztos, hogy törölni akarod ezt a címet?"
                        onConfirm={confirm}
                        okText="Igen"
                        cancelText="Nem"
                    >
                        <Button size={'small'} icon={<HiOutlineTrash/>} />
                    </Popconfirm>
                </Tooltip>
            </div>
        )
    }

    const columns = [
        {
            title: 'Eredeti cím',
            dataIndex: 'original_address',
        },
        {
            title: 'Geokódolt cím',
            dataIndex: 'geocoded_address',
        },
        {
            title: 'Akció',
            width: 120,
            render: renderActions
        },
    ];

    const renderFooter = () => {
        return (
            <div>
                <Button icon={<HiPlus/>}>
                    Új cím hozzáadása
                </Button>
            </div>
        )
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys([selectedRows[0].id]);
            onRowClick(selectedRows[0])
        }
    };

    const handleCancel = () => {
        setModalOpen(false);
    }

    const handleOk = () => {
        setModalOpen(false)
    }

    return (
        <div className={style.LocationsWrapper}>
            {contextHolder}
            <div className={style.Label}>Lokációk:</div>
            <Table
                rowKey={'id'}
                columns={columns}
                dataSource={locationsData}
                bordered
                pagination={false}
                footer={renderFooter}
                rowSelection={{
                    type: 'radio',
                    selectedRowKeys: selectedRowKeys,
                    ...rowSelection,
                }}
            />
            <Modal
                title={action === 'edit' ? 'Cím módosítása' : 'Új cím hozzáadása'}
                open={modalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Bezárás
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>
                        Mentés
                    </Button>
                ]}
            >
                <LocationForm
                    action={action}
                    record={selectedRecord}
                />
            </Modal>
        </div>
    )
}

export default LocationsPanel;