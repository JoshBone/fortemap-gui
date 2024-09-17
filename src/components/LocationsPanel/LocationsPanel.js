import {Button, notification, message, Modal, Popconfirm, Table, Tooltip, Space} from "antd";
import style from "./LocationsPanel.module.scss";
import { HiOutlineDocumentText, HiPlus, HiOutlineLocationMarker, HiOutlineTrash } from "react-icons/hi";
import {useState} from "react";
import LocationForm from "@/components/LocationsPanel/LocationForm";
import axios from "axios";
import {useRouter} from "next/navigation";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const LocationsPanel = ({locationsData, photoID, onRowClick, onLocationEdit, onLocationEditClose}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState({});
    const [action, setAction] = useState()

    const [locations, setLocations] = useState(locationsData)

    const [mapPointEditing, setMapPointEditing] = useState(undefined)
    const [messageApi, messageContextHolder] = message.useMessage();

    const [api, contextHolder] = notification.useNotification();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [buttonLoading, setButtonLoading] = useState(false)

    const router = useRouter()

    const confirm = (id) => {
        axios.delete(`${FORTEPAN_API}/photos/locations/${id}/`).then(response => {
            setLocations(locations.filter(loc => loc.id !== id))
            messageApi.open({
                type: 'success',
                content: 'Lokáció sikeresen törölve!',
            });
        }).catch(error => console.error(error));
    };

    const handleEditClick = (record) => {
        setAction('edit');
        setSelectedRowKeys([record.id]);
        setSelectedRecord(record);
        setModalOpen(true);
    }

    const handleAddClick = () => {
        setAction('create');
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
                        onConfirm={() => confirm(record.id)}
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
                <Button icon={<HiPlus/>} onClick={handleAddClick}>
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

    const handleOk = (searchBoxValue, selectedLocation) => {
        setButtonLoading(true)
        const data = {
            photo: photoID,
            original_address: searchBoxValue,
            geocoded_address: selectedLocation.display_name,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lon,
            geotag_provider: 'Nominatim'
        }

        switch (action) {
            case 'edit':
                axios.put(`${FORTEPAN_API}/photos/locations/${selectedRowKeys[0]}/`, data)
                    .then(response => {
                        messageApi.open({
                            type: 'success',
                            content: 'Lokáció sikeresen módosítva!',
                        });
                    })
                    .then(data => {
                        setButtonLoading(false)
                        setModalOpen(false);
                        router.refresh()
                    })
                break;
            case 'create':
                axios.post(`${FORTEPAN_API}/photos/locations/create/`, data)
                    .then(response => {
                        messageApi.open({
                            type: 'success',
                            content: 'Lokáció sikeresen hozzáadva!',
                        });
                    })
                    .then(data => {
                        setButtonLoading(false)
                        setModalOpen(false);
                        router.refresh()
                    })
                break;
        }

        setButtonLoading(false)
        setModalOpen(false);
    }

    return (
        <div className={style.LocationsWrapper}>
            {contextHolder}
            {messageContextHolder}
            <div className={style.Label}>Lokációk:</div>
            <Table
                rowKey={'id'}
                columns={columns}
                dataSource={locations}
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
                destroyOnClose={true}
                width={'60%'}
                footer={[]}
            >
                <LocationForm
                    buttonLoading={buttonLoading}
                    action={action}
                    record={selectedRecord}
                    onClose={handleCancel}
                    onSave={handleOk}
                />
            </Modal>
        </div>
    )
}

export default LocationsPanel;