import style from "./InfoPanel.module.scss"
import {Col, Row, Image, Button, Radio, Space, message, Input} from "antd";
import React, {useState} from "react";
import LocationsPanel from "@/components/LocationsPanel/LocationsPanel";

import {HiOutlineArrowLeft, HiOutlineArrowRight} from 'react-icons/hi'
import axios from "axios";
import Link from "next/link";
import {useLocalStorage} from "react-use";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const { TextArea } = Input;

const InfoPanel = ({photoData, onLocationSelect, onLocationEdit, onLocationEditClose}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [photoStatus, setPhotoStatus] = useState(photoData.status)
    const [commentValue, setCommentValue] = useState(photoData.comment)

    const [scrollElementID, setScrollElementID] = useLocalStorage('table-scroll-id', 0);

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

        axios.patch(`${FORTEPAN_API}/photos/${photoData.fortepan_id}/`, {
            status: value
        }).then(response => {
            messageApi.open({
                type: 'success',
                content: 'Státusz sikeresen megváltoztatva!',
            });
        }).catch(error => console.error(error));
    }

    const handleCommentSave = () => {
        axios.patch(`${FORTEPAN_API}/photos/${photoData.fortepan_id}/`, {
            comment: commentValue
        }).then(response => {
            messageApi.open({
                type: 'success',
                content: 'Megjegyzés sikeresen elmentve!',
            });
        }).catch(error => console.error(error));
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
                        <div className={style.NER}
                             dangerouslySetInnerHTML={{__html: encodeNER(photoData['description_geocoded'])}}></div>
                    </div>
                    <div className={style.PhotoMeta}>
                        <div className={style.Label}>Fortepan URL:</div>
                        <div className={style.Link}>
                            <a href={`https://fortepan.hu/hu/photos/?id=${photoData['fortepan_id']}`} target={'_new'}>Fénykép
                                megtekintése</a>
                        </div>
                    </div>
                    <div className={style.PhotoMeta}>
                        <div className={style.Label}>Szerkesztő:</div>
                        <div className={style.NER}>
                            {photoData['editor'] ? photoData['editor'] : 'Nincs megadva'}
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
                        <Button onClick={() => {
                            if( photoData['original_filter_params'].length > 0 ) 
                                window.location.href = `/fortemap/photos/${photoData['original_filter_params']}`
                            else 
                                window.location.href = `/fortemap/photos`
                        }}><HiOutlineArrowLeft/> Vissza a fényképekhez</Button>
                        {
                            photoData['next_photo_id'] &&
                                <Button onClick={() => {
                                        setScrollElementID(photoData['next_photo_id'])
                                        window.location.href = `/fortemap/photo/${photoData['next_photo_id']}?src_url_params=${encodeURIComponent(photoData['original_filter_params'])}`
                                }}
                                >{`Következő kép`} <HiOutlineArrowRight/></Button>
                        }
                    </div>
                </Col>
            </Row>
            <Row>
                <LocationsPanel
                    photoID={photoData['id']}
                    locationsData={photoData['locations']}
                    onRowClick={onLocationSelect}
                    onLocationEdit={onLocationEdit}
                    onLocationEditClose={onLocationEditClose}
                />
            </Row>
            <br/>
            <Row>
                <Col span={24}>
                    <div className={style.Label}>Megjegyzés:</div>
                    <TextArea
                        showCount
                        maxLength={1000}
                        className={style.Comment}
                        value={commentValue}
                        rows={4}
                        onChange={(e) => setCommentValue(e.target.value)}
                    />
                    <div className={style.CommentSaveButton}>
                        <Button onClick={handleCommentSave}>Hozzászólás mentése</Button>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default InfoPanel