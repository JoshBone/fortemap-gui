import style from "./InfoPanel.module.scss"
import {Col, Row, Image, Button, Radio, Space, message} from "antd";
import React, {useState} from "react";
import LocationsPanel from "@/components/LocationsPanel/LocationsPanel";
import {useRouter} from "next/router";

import {HiOutlineArrowLeft} from 'react-icons/hi'

const InfoPanel = ({photoData, onLocationSelect, onLocationEdit, onLocationEditClose}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [photoStatus, setPhotoStatus] = useState('ELL_VAR')

    const previewURL = `https://fortepan.download/file/fortepan-eu/1600/fortepan_${photoData['fortepan_id']}.jpg`
    const url = `https://fortepan.download/file/fortepan-eu/480/fortepan_${photoData['fortepan_id']}.jpg`

    const encodeNER = (nerText) => {
        let txt = nerText;
        txt = txt.replaceAll('[LOC-B]', '<span class="LOC">')
        txt = txt.replaceAll('[LOC-E]', '</span>')
        txt = txt.replaceAll('[PER-B]', '<span class="PER">')
        txt = txt.replaceAll('[PER-E]', '</span>')
        txt = txt.replaceAll('[ORG-B]', '<span class="ORG">')
        txt = txt.replaceAll('[ORG-E]', '</span>')
        return txt
    }

    const handleStatusChange = (value) => {
        setPhotoStatus(value)

        messageApi.open({
            type: 'success',
            content: 'Státusz sikeresen megváltoztatva!',
        });
    }

    return (
        <div className={style.InfoPanelWrapper}>
            {contextHolder}
            <Row>
                <Col span={12}>
                    <div className={style.Image}>
                        <Image
                            width={'100%'}
                            src={url}
                            preview={{
                                src: previewURL,
                            }}
                        />
                    </div>
                </Col>
                <Col span={12}>
                    <div className={style.PhotoMeta}>
                        <div className={style.Label}>Leírás (felismert helységnevek):</div>
                        <div className={style.NER} dangerouslySetInnerHTML={{__html: encodeNER(photoData['description_geocoded'])}}></div>
                    </div>
                    <div className={style.PhotoMeta}>
                        <div className={style.Label}>Fortepan URL:</div>
                        <div className={style.Link}>
                            <a href={`https://fortepan.hu/hu/photos/?id=${photoData['fortepan_id']}`} target={'_new'}>Fénykép megtekintése</a>
                        </div>
                    </div>
                    <div className={style.PhotoMeta}>
                        <div className={style.Label}>Státusz:</div>
                        <Radio.Group
                            buttonStyle={'outline'}
                            value={photoStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={style.StatusButtons}
                        >
                            <Space direction="vertical">
                                <Radio value={'ELL_VAR'}>Ellenőrzésre vár</Radio>
                                <Radio value={'ELH_VAR'}>Elhelyezésre vár</Radio>
                                <Radio value={'OK'}>Elhelyezve</Radio>
                                <Radio value={'NK'}>Nincs koordináta</Radio>
                            </Space>
                        </Radio.Group>
                    </div>
                    <div className={style.Buttons} style={{paddingTop: '25px'}}>
                        <Button onClick={() => history.back()}><HiOutlineArrowLeft/> Vissza a fényképekhez</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <LocationsPanel
                    locationsData={photoData['locations']}
                    onRowClick={onLocationSelect}
                    onLocationEdit={onLocationEdit}
                    onLocationEditClose={onLocationEditClose}
                />
            </Row>
        </div>
    )
}

export default InfoPanel