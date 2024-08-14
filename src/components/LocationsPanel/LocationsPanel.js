import {Badge, Button, Table, Tag} from "antd";
import style from "./LocationsPanel.module.scss";
import { HiOutlineDocumentText, HiPlus, HiOutlineLocationMarker, HiOutlineTrash } from "react-icons/hi";
import { Tooltip } from "antd";

const LocationsPanel = ({locationsData, onRowClick}) => {
    const renderActions = () => {
        return (
            <div className={style.Actions}>
                <Tooltip title="Cím módosítás">
                    <Button size={'small'} icon={<HiOutlineDocumentText />} />
                </Tooltip>
                <Tooltip title="Jelölőpont módosítás">
                    <Button size={'small'} icon={<HiOutlineLocationMarker/>} />
                </Tooltip>
                <Tooltip title="Törlés">
                    <Button size={'small'} icon={<HiOutlineTrash/>} />
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
            onRowClick(selectedRows[0])
        }
    };

    return (
        <div className={style.LocationsWrapper}>
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
                    ...rowSelection,
                }}
            />
        </div>
    )
}

export default LocationsPanel;