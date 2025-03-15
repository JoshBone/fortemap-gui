import {Button, Col, Input, Row, Space, Table} from "antd";
import { HiOutlineLocationMarker } from "react-icons/hi";
import React, {useEffect, useRef, useState} from "react";
import style from './LocationForm.module.scss'
import dynamic from "next/dynamic";
import useTranslation from "next-translate/useTranslation";

const LocationsMapComponent = dynamic(
    () => import('./LocationsMapComponent'),
    {ssr: false}
);

const LocationForm = ({action, record, onClose, onSave, buttonLoading}) => {
    const [input, setInput] = useState(action === 'edit' ? record['original_address'] : '')
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(false)

    const inputRef = useRef(null);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState({
        lat: null,
        lon: null
    })

    const { t, lang } = useTranslation('index')

    useEffect(() => {
        inputRef.current.focus({
            cursor: 'end',
        });
    }, [])

    const getData = async () => {
        setLoading(true)
        setSelectedLocation({})
        const url = 'https://nominatim.openstreetmap.org/search?q=' + input + '&format=json&limit=3'
        const data = await fetch(url, {headers: {
                'Accept-Language': 'hu'}}).then(r => r.json());
        setData(data)
        setLoading(false)
    }

    const columns = [
        {
            title: t('photoPage__address'),
            dataIndex: 'display_name',
        }
    ];

    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys([selectedRows[0].place_id]);
            setSelectedLocation(selectedRows[0])
        }
    };

    const selectRow = (record) => {
        setSelectedRowKeys([record.place_id])
        setSelectedLocation(record)
    };

    return (
        <>
            <Row>
                <Col xs={24}>
                   <Space.Compact style={{ width: '100%' }}>
                       <Input
                          style={{width: '100%'}}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onPressEnter={getData}
                          ref={inputRef}
                       />
                       <Button
                           icon={<HiOutlineLocationMarker />}
                           type="default"
                           onClick={getData}
                           loading={loading}
                       />
                   </Space.Compact>
                </Col>
            </Row>
            {
                Object.keys(data).length > 0 &&
                <div className={style.ResultsWrapper}>
                    <div className={style.Table}>
                        <Table
                            rowKey={'place_id'}
                            columns={columns}
                            dataSource={data}
                            bordered
                            size={'small'}
                            pagination={false}
                            rowSelection={{
                                type: 'radio',
                                selectedRowKeys: selectedRowKeys,
                                ...rowSelection,
                            }}
                            onRow={(record) => ({
                                onClick: () => {
                                    selectRow(record);
                                }
                            })}
                        />
                    </div>
                    <div className={style.Map}>
                        <LocationsMapComponent
                            locationsData={data}
                            selectedLocation={selectedLocation}
                            height={'420px'}
                        />
                    </div>
                </div>
            }
            <Row>
                <Col xs={24}>
                    <div className={style.Buttons}>
                        <Button key="back" onClick={() => onClose()}>
                            {t('photoPage__close')}
                        </Button>
                        <Button
                            key="submit"
                            type="primary"
                            loading={buttonLoading}
                            onClick={() => onSave(input, selectedLocation)}
                            disabled={Object.keys(selectedLocation).length === 0 || selectedLocation['lat'] === null}>
                            Mentés
                        </Button>
                    </div>
                </Col>
            </Row>
        </>
    )
}

export default LocationForm;