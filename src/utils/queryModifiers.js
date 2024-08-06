export const addQueryParam = (param, value, router) => {
    const isProd = process.env.NODE_ENV === 'production'

    const { pathname, query } = router;
    query[param] = value
    const params = new URLSearchParams(query);
    router.replace(
        { pathname: isProd ? `/fortemap/${pathname}` : pathname, query: params.toString() },
        undefined,
        { shallow: true }
    );
};

export const removeQueryParam = (param, router) => {
    const isProd = process.env.NODE_ENV === 'production'

    const { pathname, query } = router;
    const params = new URLSearchParams(query);
    params.delete(param);
    router.replace(
        { pathname: isProd ? `/fortemap/${pathname}` : pathname, query: params.toString() },
        undefined,
        { shallow: true }
    );
};