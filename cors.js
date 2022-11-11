const {send} = require('micro');


const DEFAULT_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
];

const DEFAULT_ALLOW_HEADERS = [
    'Access-Control-Allow-Ogirin',
    'Content-Type',
    'Authorization',
    'Accept',
]

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24;  // 1 day

module.exports = (options = {}) => handler => (req, res, ...restArgs) => {
    const {
        origin = [],
        maxAge = DEFAULT_MAX_AGE_SECONDS,
        allowMethods = DEFAULT_ALLOW_METHODS,
        allowHeaders= DEFAULT_ALLOW_HEADERS,
        allowCredentials = true,
        exposeHeaders = [],
    } = options;

    if (res && res.finished) {
        return
    }

    let originHost;
    try {
        originHost = new URL(req.headers.origin).hostname;
    } catch (e) {
        return send(res, 403, {
            error: true,
            message: 'Invalid origin',
        });
    }

    for (const originItem of origin) {
        if (originHost === originItem) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            break;
        }
    }

    if (allowCredentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (exposeHeaders.length) {
        res.setHeader('Access-Control-Expose-Headers', exposeHeaders.join(','));
    }

    const preFlight = req.method === 'OPTIONS';
    if (preFlight) {
        res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','));
        res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','));
        res.setHeader('Access-Control-Max-Age', String(maxAge));
    }

    return handler(req, res, ...restArgs);
}
