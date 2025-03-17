import {Col, Row} from "antd";
import Stats from "@/components/Stats/Stats";
import AppLayout from "@/components/Layout/AppLayout";
import {useSession} from "next-auth/react";
import useTranslation from "next-translate/useTranslation";

const prefix = process.env.NEXT_PUBLIC_ROUTE_PREFIX

export default function Start() {
    const { t, lang } = useTranslation('index')
    const {data, status} = useSession()

    return (
        <AppLayout>
            <Row style={{fontFamily: 'unset'}}>
                <Col style={{fontFamily: 'unset'}} span={12}>
                    <div style={{padding: '20px'}}>
                        <h2>{t('welcome')}</h2>
                        <ul>
                            <li><a href={prefix ? `/${prefix}/${lang === 'en' ? '/en' : ''}/photos?filter_editor=${data.username}` : `/photos?filter_editor=${data.username}`}>{t('my-photos')}</a></li>
                            <li><a href={prefix ? `/${prefix}/${lang === 'en' ? '/en' : ''}/photos` : `/photos`}>{t('all-photos')}</a></li>
                        </ul>
                        <h3>{t('photos-by-location')}</h3>
                        <ul>
                            <li><a href={prefix ? `/${prefix}/${lang === 'en' ? '/en' : ''}/photos?filter_place=Győr` : `/photos?filter_place=Győr`}>{t('photos-from-gyor')}</a></li>
                            <li><a href={prefix ? `/${prefix}/${lang === 'en' ? '/en' : ''}/photos?filter_place=Budapest V.` : `/photos?filter_place=Budapest V.`}>{t('photos-from-budapest')}</a></li>
                        </ul>
                        <h3>{t('photos-by-map-markers')}</h3>
                        <ul>
                            <li><a href={prefix ? `/${prefix}/${lang === 'en' ? '/en' : ''}/photos?filter_locations_count=0` : `/photos?filter_locations_count=0`}>{t('photos-without-geo')}</a></li>
                        </ul>
                        <h3>{t('user-manual')}</h3>
                        <ul>
                            <li>
                                <a href={'https://docs.google.com/document/d/1UOBgILDzzj75jG8QGO3YqyflI8CZ0BJFlrCorYH8oOQ/edit?usp=sharing'}>{t('user-manual-open')}</a>
                            </li>
                        </ul>
                    </div>
                </Col>
                <Col span={12}>
                    <Stats />
                </Col>
            </Row>
        </AppLayout>
    )
}
