export const addQueryParam = (param, value, router) => {
    const { pathname, query } = router;
    query[param] = value
    const params = new URLSearchParams(query);
    router.replace(
        { pathname, query: params.toString() },
        undefined,
        { shallow: true }
    );
};

export const removeQueryParam = (param, router) => {
    const { pathname, query } = router;
    const params = new URLSearchParams(query);
    params.delete(param);
    router.replace(
        { pathname, query: params.toString() },
        undefined,
        { shallow: true }
    );
};