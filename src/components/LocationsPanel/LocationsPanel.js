import {Button, notification, message, Modal, Popconfirm, Table, Tooltip, Space, Checkbox} from "antd";
import style from "./LocationsPanel.module.scss";
import { HiOutlineDocumentText, HiPlus, HiOutlineLocationMarker, HiOutlineTrash } from "react-icons/hi";
import {useState} from "react";
import LocationForm from "@/components/LocationsPanel/LocationForm";
import axios from "axios";
import {useRouter} from "next/navigation";
import {useEditingStatus, useSelectedLocation} from "@/utils/sharedStateProviders";
import useTranslation from "next-translate/useTranslation";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const LocationsPanel = ({locationsData, photoID, notificationApi, canBeEdited}) => {
    const { t, lang } = useTranslation('index')

    const [modalOpen, setModalOpen] = useState(false);
    const [action, setAction] = useState()

    const [locations, setLocations] = useState(locationsData)

    const [messageApi, messageContextHolder] = message.useMessage();

    // Editing shared state
    const [editing, setEditing] = useEditingStatus()
    const [selectedLocation, setSelectedLocation] = useSelectedLocation()

    const [buttonLoading, setButtonLoading] = useState(false)

    const router = useRouter()

    const confirm = (id) => {
        axios.delete(`${FORTEPAN_API}/photos/locations/${id}/`).then(response => {
            setLocations(locations.filter(loc => loc.id !== id))
            messageApi.open({
                type: 'success',
                content: t('photoPage__location_deleted'),
            });
        })
        .then(data => router.refresh())
        .catch(error => console.error(error));
    };

    const handleEditClick = (record) => {
        setAction('edit');
        setSelectedLocation(record)
        setModalOpen(true);
    }

    const handleAddClick = () => {
        setAction('create');
        setModalOpen(true);
    }

    const onClose = (key) => {
        setEditing(false)
        notificationApi.destroy(key)
    }

    const handleLocationEditClick = (record) => {
        setEditing(true)
        setSelectedLocation(record)

        const btn = (
            <Space>
                <Button type="link" size="small" onClick={() => onClose('locationEdit')}>
                    {t('photoPage__close')}
                </Button>
            </Space>
        );

        notificationApi.open({
            message: t('photoPage__modify_marker'),
            duration: 0,
            description:
                `${record.original_address} - ${t('photoPage__drag_marker')}`,
            btn,
            key: 'locationEdit',
            onClose: onClose,
        });
    }

    const renderActions = (text, record, index) => {
        return (
            <div className={style.Actions}>
                <Tooltip title={t('photoPage__modify_address')}>
                    <Button
                        size={'small'}
                        icon={<HiOutlineDocumentText />}
                        onClick={() => handleEditClick(record)}
                        disabled={!canBeEdited}
                    />
                </Tooltip>
                <Tooltip title={t('photoPage__modify_marker')}>
                    <Button
                        type={selectedLocation.id === record.id && editing ? 'primary' : 'default'}
                        size={'small'}
                        icon={<HiOutlineLocationMarker/>}
                        onClick={() => handleLocationEditClick(record)}
                        disabled={!canBeEdited}
                    />
                </Tooltip>
                <Tooltip title={t("photoPage__delete_marker")}>
                    <Popconfirm
                        title={t('photoPage__address_delete')}
                        description={t('photoPage__address_delete_confirm')}
                        onConfirm={() => confirm(record.id)}
                        okText="Igen"
                        cancelText="Nem"
                    >
                        <Button
                            size={'small'}
                            icon={<HiOutlineTrash/>}
                            disabled={!canBeEdited}
                        />
                    </Popconfirm>
                </Tooltip>
            </div>
        )
    }

    const renderShootingLocation = (text, record, index) => {
        const handleCheckboxChange = (value) => {
            axios.patch(`${FORTEPAN_API}/photos/locations/${record.id}/`, {
                shooting_location: value
            }).then(response => {
                messageApi.open({
                    type: 'success',
                    content: 'Státusz sikeresen megváltoztatva!',
                });

                setLocations(locations.map(loc => {
                    if (loc.id === record.id) {
                        return {
                            ...loc,
                            shooting_location: value
                        }
                    }
                    return loc
                }))
            })}

        return (
            <div className={style.Actions}>
                <Checkbox
                    disabled={!canBeEdited}
                    onChange={() => handleCheckboxChange(!record.shooting_location)}
                    checked={record.shooting_location}
                />
            </div>
        )
    }

    const columns = [
        {
            title: t('photoPage__location_table_original_address'),
            dataIndex: 'original_address',
        },
        {
            title: t('photoPage__location_table_geocoded_address'),
            dataIndex: 'geocoded_address',
        },
        {
            title: t('photoPage__location_table_shooting_location'),
            dataIndex: 'shooting_location',
            render: renderShootingLocation
        },
        {
            title: t('photoPage__location_table_action'),
            width: 120,
            render: renderActions
        },
    ];

    const renderFooter = () => {
        return (
            <div>
                <Button icon={<HiPlus/>} onClick={handleAddClick} disabled={!canBeEdited}>
                    {t('photoPage__address_add')}
                </Button>
            </div>
        )
    }

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedLocation(selectedRows[0])
            if (editing) {
                handleLocationEditClick(selectedRows[0])
            }
        }
    };

    const selectRow = (record) => {
        setSelectedLocation(record)
    };

    const handleCancel = () => {
        setModalOpen(false);
    }

    const handleOk = (searchBoxValue, newLocation) => {
        setButtonLoading(true)
        const data = {
            photo: photoID,
            original_address: searchBoxValue,
            geocoded_address: newLocation.display_name,
            latitude: newLocation.lat,
            longitude: newLocation.lon,
            geotag_provider: 'Nominatim'
        }

        switch (action) {
            case 'edit':
                axios.put(`${FORTEPAN_API}/photos/locations/${selectedLocation.id}/`, data)
                    .then(response => {
                        messageApi.open({
                            type: 'success',
                            content: t('photoPage__location_update_success'),
                        });
                        setButtonLoading(false)
                        setModalOpen(false);
                    })
                    .then(data => {
                        router.refresh()
                    })
                break;
            case 'create':
                axios.post(`${FORTEPAN_API}/photos/locations/create/`, data)
                    .then(response => {
                        messageApi.open({
                            type: 'success',
                            content: t('photoPage__location_create_success'),
                        });
                        setLocations([...locations, response.data])
                        setButtonLoading(false)
                        setModalOpen(false);
                    })
                    .then(data => router.refresh())
                break;
        }

        setButtonLoading(false)
        setModalOpen(false);
    }

    return (
        <div className={style.LocationsWrapper}>
            {messageContextHolder}
            <div className={style.Label}>{t('photoPage__locations')}:</div>
            <Table
                rowKey={'id'}
                columns={columns}
                dataSource={locations}
                bordered
                pagination={false}
                footer={renderFooter}
                onRow={(record) => ({
                    onClick: () => {
                        selectRow(record);
                    }
                })}
                rowSelection={{
                    type: 'radio',
                    selectedRowKeys: selectedLocation ? [selectedLocation.id] : [],
                    ...rowSelection,
                }}
            />
            <Modal
                title={action === 'edit' ? t('photoPage__modify_address') : t('photoPage__address_add')}
                open={modalOpen}
                onCancel={handleCancel}
                destroyOnClose={true}
                width={'60%'}
                footer={[]}
            >
                <LocationForm
                    buttonLoading={buttonLoading}
                    action={action}
                    record={selectedLocation}
                    onClose={handleCancel}
                    onSave={handleOk}
                />
            </Modal>
        </div>
    )
}

export default LocationsPanel;