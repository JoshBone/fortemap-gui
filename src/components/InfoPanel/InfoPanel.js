import style from "./InfoPanel.module.scss"
import {Col, Row, Image, Button, Radio, Space, message, Input} from "antd";
import React, {useState} from "react";
import LocationsPanel from "@/components/LocationsPanel/LocationsPanel";

import {HiOutlineArrowLeft, HiOutlineArrowRight} from 'react-icons/hi'
import axios from "axios";
import Link from "next/link";
import {useLocalStorage} from "react-use";
import {useSelectedLocation} from "@/utils/sharedStateProviders";
import useTranslation from "next-translate/useTranslation";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;
const prefix = process.env.NEXT_PUBLIC_ROUTE_PREFIX

const { TextArea } = Input;

const InfoPanel = ({photoData, notificationApi, username}) => {
    const { t, lang } = useTranslation('index')

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
                content: t('photoPage__status_update_success'),
            });
        }).catch(error => console.error(error));
    }

    const handleCommentSave = () => {
        axios.patch(`${FORTEPAN_API}/photos/${photoData.fortepan_id}/`, {
            comment: commentValue
        }).then(response => {
            messageApi.open({
                type: 'success',
                content: t('photoPage__comment_update_success'),
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
                        <div className={style.Label}>{t('photoPage__recognized_places')}:</div>
                        <div className={style.NER}
                             dangerouslySetInnerHTML={{__html: encodeNER(photoData['description_geocoded'])}}></div>
                    </div>
                    <div className={style.PhotoMeta}>
                        <div className={style.Label}>Fortepan URL:</div>
                        <div className={style.Link}>
                            <a href={`https://fortepan.hu/hu/photos/?id=${photoData['fortepan_id']}`} target={'_new'}>
                                {t('photoPage__see_photo')}
                            </a>
                        </div>
                    </div>
                    <div className={style.PhotoMeta}>
                        <div className={style.Label}>{t('photos__table_editor')}:</div>
                        <div className={style.NER}>
                            {photoData['editor'] ? photoData['editor'] : t('photos__editor_na')}
                        </div>
                    </div>
                    <div className={style.PhotoMeta}>
                        <div className={style.Label}>{t('photos__table_status')}:</div>
                        <Radio.Group
                            buttonStyle={'outline'}
                            value={photoStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={style.StatusButtons}
                            disabled={photoData.editor !== username}
                        >
                            <Space direction="vertical">
                                <Radio value={'ELL_VAR'}>{t('status__waiting_for_checking')}</Radio>
                                <Radio value={'ELH_VAR'}>{t('status__waiting_for_placement')}</Radio>
                                <Radio value={'OK'}>{t('status__placed')}</Radio>
                                <Radio value={'NK'}>{t('status__no_coordinates')}</Radio>
                            </Space>
                        </Radio.Group>
                    </div>
                    <div className={style.Buttons} style={{paddingTop: '25px'}}>
                        <Button onClick={() => {
                            if( photoData['original_filter_params'].length > 0 ) 
                                window.location.href = prefix ?
                                    `/${prefix}/photos/${photoData['original_filter_params']}` :
                                    `/photos/${photoData['original_filter_params']}`
                            else 
                                window.location.href = prefix ?
                                    `/${prefix}/photos` :
                                    `/photos`
                        }}><HiOutlineArrowLeft/> {t('photoPage__back_to_photos')}</Button>
                        {
                            photoData['next_photo_id'] &&
                                <Button onClick={() => {
                                        setScrollElementID(photoData['next_photo_id'])
                                        window.location.href = prefix ?
                                            `/${prefix}/fortemap/photo/${photoData['next_photo_id']}?src_url_params=${encodeURIComponent(photoData['original_filter_params'])}` :
                                            `/fortemap/photo/${photoData['next_photo_id']}?src_url_params=${encodeURIComponent(photoData['original_filter_params'])}`
                                }}
                                >{t('photoPage__next_photo')} <HiOutlineArrowRight/></Button>
                        }
                    </div>
                </Col>
            </Row>
            <Row>
                <LocationsPanel
                    canBeEdited={photoData.editor === username}
                    photoID={photoData['id']}
                    locationsData={photoData['locations']}
                    notificationApi={notificationApi}
                />
            </Row>
            <br/>
            <Row>
                <Col span={24}>
                    <div className={style.Label}>{t('photoPage__comment')}:</div>
                    <TextArea
                        showCount
                        maxLength={1000}
                        className={style.Comment}
                        value={commentValue}
                        rows={4}
                        onChange={(e) => setCommentValue(e.target.value)}
                    />
                    <div className={style.CommentSaveButton}>
                        <Button onClick={handleCommentSave} disabled={photoData.editor !== username}>
                            {t('photoPage__comment_save')}
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default InfoPanel