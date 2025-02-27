const translator = require('./translator');
const corsWrapper = require('./cors');
const {send} = require('micro');
const parse = require('urlencoded-body-parser');

const cors = corsWrapper({
    allowMethods: ['GET', 'OPTIONS'],
    allowCredentials: false,
    origin: ['qdon.space', 'beta.qdon.space'],
})

const handler = async (req, res) => {
    if (req.url === '/') {
        return send(res, 500, {
            error: true,
            message: 'Please use the site via: /[countrycode]/[message]'
        });
    }

    if (req.url !== '/favicon.ico') {
        const url = req.url.slice(1);
        const splitUrl = url.split('/', 2);
        const languageTo = splitUrl[0];
        if (languageTo === 'jp') {
            return send(res, 500, {
                error: true,
                message: 'If you\'re looking to translate into japanese, you must use ja instead'
            })
        }

        let text;
        switch (req.method) {
            case 'GET':
                text = splitUrl[1];
                break;
            case 'POST':
                const body = await parse(req);
                text = body.text;
                break;
            default:
                return send(res, 400, {});
        }

        const decodedText = decodeURIComponent(text);

        const translated = await translator(decodedText, languageTo);
        return send(res, 200, translated);
    }
};

module.exports = cors(handler);
