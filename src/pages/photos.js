import { useRouter } from "next/router";
import {useEffect, useRef, useState} from "react";
import {Button, Dropdown, Input, message, Modal, Select, Space, Table, Tag} from "antd";
import qs from 'query-string';
import { DownOutlined } from '@ant-design/icons';

import style from "./photos.module.scss";
import Head from "next/head";
import {useLocalStorage} from "react-use";
import scrollIntoView from 'scroll-into-view';
import LocationForm from "@/components/LocationsPanel/LocationForm";
import axios from "axios";
import AppLayout from "@/components/Layout/AppLayout";
import {useSession} from "next-auth/react";
import useTranslation from "next-translate/useTranslation";

const { Search } = Input;

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

export default function Photos() {
    const {data, status} = useSession()

    const router = useRouter();
    const { query } = router;

    const [messageApi, contextHolder] = message.useMessage();

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [scrollElementID, setScrollElementID] = useLocalStorage('table-scroll-id', 0);

    const [selectedRows, setSelectedRows] = useState([])
    const [modalOpen, setModalOpen] = useState(false)

    const [batchCreateLoading, setBatchCreateLoading] = useState(false)
    const [batchStatusLoading, setBatchStatusLoading] = useState(false)

    const { t, lang } = useTranslation('index')

    const [pagination, setPagination] = useState({
        current: parseInt(query.page),
        pageSize: parseInt(query.limit),
        total: 0,
        showTotal: (total, range) => `${t('photos__number_of_photos')} ${total} ${t('photos__number_of_photos_pieces')}`
    });
    const [filters, setFilters] = useState({
        place: query.filter_place,
        status: query.filter_status,
        geocodes: query.filter_locations_count,
        editor: query.filter_editor,
    });
    const [search, setSearch] = useState(query.search);

    const [editorOptions, setEditorOptions] = useState([]);
    const [placeOptions, setPlaceOptions] = useState([]);

    useEffect(() => {
        fetch(`${FORTEPAN_API}/photos/select/editors`)
            .then(r => r.json())
            .then(data => {
                setEditorOptions(data.map((editor) => ({ label: editor[0], value: editor[0] })))
            });

        fetch(`${FORTEPAN_API}/photos/select/places`)
            .then(r => r.json())
            .then(data => {
                setPlaceOptions(data.map((place) => ({ label: place[0], value: place[0] })))
            });
    }, [])

    useEffect(() => {
        const parsedFilters = {};
        Object.keys(query).forEach((key) => {
            if (key.startsWith('filter_')) {
                parsedFilters[key.replace('filter_', '')] = query[key];
            }
        });
        setFilters(parsedFilters);

        router.isReady && fetchData({
            search: query.search,
            pagination: {
                current: parseInt(query.page || 1),
                pageSize: parseInt(query.limit || 50),
            },
            filters: parsedFilters,
        });
    }, [query]);

    useEffect(() => {
        if (tableData.length > 0) {
            scrollIntoView(document.querySelector('.scroll-row'), {
                align: {
                    top: 0,
                },
            });
        }
    }, [tableData])

    const fetchData = async (params = {}) => {
        setLoading(true);

        try {
            const queryString = qs.stringify({
                search: search,
                offset: (params.pagination.current - 1) * params.pagination.pageSize,
                limit: params.pagination.pageSize,
                ...Object.keys(params.filters).reduce((acc, key) => {
                    acc[key] = params.filters[key];
                    return acc;
                }, {}),
            });

            const response = await fetch(`${FORTEPAN_API}/photos/?${queryString}`).then(r => r.json());

            setTableData(response.results);
            setPagination({
                ...params.pagination,
                total: response.count,
                showTotal: (total, range) => `${t('photos__number_of_photos')} ${total} ${t('photos__number_of_photos_pieces')}`
            });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const photoRender = (photo) => {
        const url = `https://fortepan.download/file/fortepan-eu/480/fortepan_${photo}.jpg`

        return (
            <div style={{textAlign: 'center'}}>
                <img src={url}
                     alt={`Fortepan photo no. ${photo}`}
                     height={150}
                />
            </div>
        )
    }

    const renderStatus = (status) => {
        const getColor = () => {
            switch (status) {
                case 'ELL_VAR':
                    return '#F73E12'
                case 'ELH_VAR':
                    return '#F4D03F'
                case 'OK':
                    return '#1ABC9C'
                case 'NK':
                    return '#F73E12'
            }
        }

        const getText = () => {
            switch (status) {
                case 'ELL_VAR':
                    return t("status__waiting_for_checking")
                case 'ELH_VAR':
                    return t("status__waiting_for_placement")
                case 'OK':
                    return t("status__placed")
                case 'NK':
                    return t("status__no_coordinates")
            }
        }

        return <Tag color={getColor()}>{getText()}</Tag>
    }

    const onColumnClick = (record, rowIndex) => {
        return {
            onClick: (event) => {
                setScrollElementID(record['fortepan_id'])
                router.push({pathname: `/photo/${record['fortepan_id']}`, query: {src_url_params: window.location.search}})
            } // click row
        };
    }

    const columns = [
        {
            title: t('photos__table_photo'),
            dataIndex: 'fortepan_id',
            render: photoRender,
            width: 400,
            onCell: onColumnClick
        },
        {
            title: t('photos__table_description'),
            dataIndex: 'description_original',
            onCell: onColumnClick
        },
        {
            title: t('photos__table_place'),
            dataIndex: 'place',
            width: 150,
            onCell: onColumnClick
        },
        {
            title: t('photos__table_geocodes'),
            dataIndex: 'locations_count',
            // sorter: true,
            render: (count) => (<div style={{textAlign: 'center'}}>{count}</div>),
            width: 120,
            onCell: onColumnClick
        },
        {
            title: t('photos__table_status'),
            dataIndex: 'status',
            width: 150,
            render: renderStatus,
            onCell: onColumnClick
        },
        {
            title: t('photos__table_editor'),
            dataIndex: 'editor',
            width: 150,
            onCell: onColumnClick
        },
    ];

    const renderTableHeader = () => {
        return (
            <div className={style.TableHeader}>
                <div className={style.Search}>
                    <Search
                        allowClear={true}
                        placeholder={t('photos__filter_search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onSearch={handleSearch}
                    />
                </div>
                <div className={style.Filters}>
                    <Select
                        showSearch
                        allowClear
                        placeholder={t('photos__filter_status')}
                        optionFilterProp="label"
                        value={filters['status']}
                        onChange={(value) => onFilterChange('status', value)}
                        style={{width: '230px'}}
                        options={[
                            { label: t("status__waiting_for_checking"), value: 'ELL_VAR' },
                            { label: t("status__waiting_for_placement"), value: 'ELH_VAR' },
                            { label: t("status__placed"), value: 'OK' },
                            { label: t("status__no_coordinates"), value: 'NK' },
                        ]}
                    />
                    <Select
                        showSearch
                        allowClear
                        placeholder={t('photos__filter_location')}
                        optionFilterProp="label"
                        value={filters['place']}
                        onChange={(value) => onFilterChange('place', value)}
                        style={{width: '250px'}}
                        options={placeOptions}
                    />
                    <Search
                        allowClear={true}
                        placeholder={t('photos__filter_geocodes')}
                        value={filters['locations_count']}
                        // onChange={(e) => {setFilters({...filters, geocodes: e.target.value})}}
                        style={{width: '200px'}}
                        onSearch={(value) => onFilterChange('locations_count', value)}
                    />
                    <Select
                        showSearch
                        allowClear
                        placeholder={t('photos__filter_editor')}
                        optionFilterProp="label"
                        value={filters['editor']}
                        onChange={(value) => onFilterChange('editor', value)}
                        style={{width: '230px'}}
                        options={editorOptions}
                    />
                </div>
            </div>
        )
    }

    const onFilterChange = (filter, value) => {
        if (value) {
            setFilters({
                ...filters,
                [filter]: value,
            });
            handleTableChange(pagination, {
                ...filters,
                [filter]: value,
            });
        } else {
            setFilters({
                ...filters,
                [filter]: undefined,
            });
            handleTableChange(pagination, {
                ...filters,
                [filter]: undefined,
            });
        }
    }

    const handleSearch = (query) => {
        if (query && query !== '') {
            const newPagination = {
                current: 1,
                pageSize: pagination.pageSize,
            }
            handleTableChange(newPagination, filters)
        } else {
            handleTableChange(pagination, filters)
        }
    }

    const handleTableChange = (pagination, filters, sorter) => {
        const filterParams = {};
        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                filterParams[`filter_${key}`] = filters[key];
            }
        });

        const params = {
            page: pagination.current,
            limit: pagination.pageSize,
            ...filterParams,
        };

        /*
        if (sorter.order) {
            params['ordering'] = sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`
        }
        */

        if (search) {
            params['search'] = search;
        }

        const queryString = qs.stringify(params);
        router.push(`?${queryString}`, undefined, { shallow: true });

        fetchData({
            pagination,
            filters,
            search,
        });
    };

    const rowSelection = {
        preserveSelectedRowKeys: true,
        selectedRowKeys: selectedRows,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRows(selectedRowKeys);
        },
        getCheckboxProps: (record) => ({
            disabled: record.editor !== data.username
        })
    };

    const statusChangeButton = () => {
        const items = [
            {
                label: t("status__waiting_for_checking"),
                key: 'ELL_VAR'
            }, {
                label: t("status__waiting_for_placement"),
                key: 'ELH_VAR'
            }, {
                label: t("status__placed"),
                key: 'OK'
            }, {
                label: t('status__no_coordinates'),
                key: 'NK'
            }
        ]

        const handleMenuClick = (e) => {
            setBatchStatusLoading(true)

            const data = {
                photos: selectedRows,
                status: e.key
            }

            // Post the data
            axios.post(`${FORTEPAN_API}/photos/batch-status/`, data)
                .then(response => {
                    // Refresh Table
                    fetchData({
                        pagination,
                        filters,
                        search
                    }).then(response => {
                        setSelectedRows([])
                        setBatchStatusLoading(false)
                        messageApi.open({
                            type: 'success',
                            content: t('photos__status_update_success'),
                        });
                    })
                })
                .catch(error => {
                    setBatchStatusLoading(false)
                    messageApi.open({
                        type: 'error',
                        content: t('photos__status_update_error'),
                    });
                })
        }

        const menuProps = {
            items,
            onClick: handleMenuClick,
        };

        return (
            <Dropdown menu={menuProps}>
                <Button disabled={selectedRows.length < 1} loading={batchStatusLoading}>
                    <Space>
                        {t('photos__status_update')}
                        <DownOutlined />
                    </Space>
                </Button>
            </Dropdown>
        )
    }

    const renderFooter = (currentRecord) => {
        return (
            <div style={{display: 'flex', gap: '10px'}}>
                <Button
                    onClick={() => setModalOpen(true)}
                    disabled={selectedRows.length < 1}
                >
                    {t('photos__location_add')}
                    {selectedRows.length > 1 ?
                        ` ${selectedRows.length} ${t('photos__location_add_to_photos')}` :
                        ` ${selectedRows.length} ${t('photos__location_add_to_photo')}`}
                </Button>
                {statusChangeButton()}
            </div>
        )
    }

    const handleCancel = () => {
        setModalOpen(false)
    }

    const handleOk = (locationInput, locationIdentified) => {
        setBatchCreateLoading(true)

        const data = {
            photos: selectedRows,
            location: {
                original_address: locationInput,
                geocoded_address: locationIdentified.display_name,
                latitude: locationIdentified.lat,
                longitude: locationIdentified.lon,
                geotag_provider: 'Nominatim'
            }
        }

        // Post the data
        axios.post(`${FORTEPAN_API}/photos/locations/batch-create/`, data)
            .then(response => {
                // Refresh Table
                fetchData({
                    pagination,
                    filters,
                    search
                }).then(response => {
                    setSelectedRows([])
                    setModalOpen(false)
                    setBatchCreateLoading(false)
                    messageApi.open({
                        type: 'success',
                        content: t('photos__location_add_success'),
                    });
                })
            })
            .catch(error => {
                setBatchCreateLoading(false)
                messageApi.open({
                    type: 'error',
                    content: t("photos__location_add_error"),
                });
            })
    }

    return (
        <AppLayout>
            <Head>
                <title>{t("photos__title")}</title>
            </Head>
          <div style={{padding: '10px'}}>
              {contextHolder}
              <Table
                  rowKey={'fortepan_id'}
                  columns={columns}
                  dataSource={tableData}
                  loading={loading}
                  pagination={pagination}
                  title={renderTableHeader}
                  bordered
                  footer={renderFooter}
                  rowClassName={(record, index) => (record['fortepan_id'] === scrollElementID ? 'scroll-row' : '')}
                  rowSelection={{
                      ...rowSelection,
                  }}
                  scroll={{
                      y: '66vh',
                  }}
                  onChange={(pagination, filterValues, sorter) =>
                      handleTableChange(pagination, filters, sorter)}
                  size="small"
              />
            </div>
            <Modal
                title={t("photos__location_add")}
                open={modalOpen}
                onCancel={handleCancel}
                destroyOnClose={true}
                width={'60%'}
                footer={[]}
            >
                <LocationForm
                    buttonLoading={batchCreateLoading}
                    action={'add'}
                    onClose={handleCancel}
                    onSave={handleOk}
                />
            </Modal>
        </AppLayout>
      );
}
