import style from "./InfoPanel.module.scss"
import {Col, Row, Image, Button, Radio} from "antd";
import React, {useState} from "react";
import LocationsPanel from "@/components/LocationsPanel/LocationsPanel";

const InfoPanel = ({photoData, onLocationSelect}) => {
    const [photoStatus, setPhotoStatus] = useState(1)

    const previewURL = `https://fortepan.download/file/fortepan-eu/1600/fortepan_${photoData['fortepan_id']}.jpg`
    const url = `https://fortepan.download/file/fortepan-eu/480/fortepan_${photoData['fortepan_id']}.jpg`

    const statusOptions = [
        {value: 1, label: 'Friss'},
        {value: 2, label: 'Több info kell'},
        {value: 3, label: 'Kész'}
    ]

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

    return (
        <div className={style.InfoPanelWrapper}>
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
                            options={statusOptions}
                            value={photoStatus}
                            onChange={(e) => setPhotoStatus(e.target.value)}
                            optionType={'button'}
                            buttonStyle={'solid'}
                            className={style.StatusButtons}
                        />
                    </div>
                    <div className={style.PhotoMeta} style={{paddingTop: '25px'}}>
                        <Button onClick={() => history.back()}>Vissza</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <LocationsPanel locationsData={photoData['locations']} onRowClick={onLocationSelect} />
            </Row>
        </div>
    )
}

export default InfoPanel