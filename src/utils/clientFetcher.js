const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const fetcher = (url, params) => {
    // Authentication
    const urlParams = new URLSearchParams(params)
    return fetch(`${FORTEPAN_API}/${url}?${urlParams}`).then(r => r.json())
}

export default fetcher;