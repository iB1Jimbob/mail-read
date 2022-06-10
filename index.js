const Database = require('./db.js');
const express = require('express');
const cors = require('cors');

const db = new Database({ fileName : 'db.json' });
const settings = new Database({ fileName : 'settings.json' });
const app = express();

app.use(cors());

const PORT = 3000;

if (!settings.has('id')) {
    settings.set('id', 0);
    db.clear();
}

function makePass(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

settings.set('url', `https://server.jimii.xyz:${PORT}`);

app.post('/image', (req, res) => {
    const obj = {
        id: settings.get('id') + 1,
        pass: makePass(8),
        created: new Date().getTime(),
        visits: []
    }
    db.set(obj.id, obj);
    settings.set('id', obj.id);
    res.status(200).send(JSON.stringify({
        url: settings.get('url'),
        id: obj.id,
        pass: obj.pass
    }));
});

app.get('/image', (req, res) => {
    const id = req.query.id;
    res.header('Content-Type', 'image/png');

    if (!id || !db.has(id)) return res.status(404).sendFile(`${__dirname}/images/error.png`);

    const obj = db.get(id);

    if (new Date().getTime() - obj.created < 60000) return res.status(202).sendFile(`${__dirname}/images/img.png`);

    obj.visits.push({
        ip: req.ip,
        time: new Date().getTime(),
        userAgent: req.headers['user-agent']
    });
    db.set(id, obj);

    res.status(200).sendFile(`${__dirname}/images/img.png`);
});

app.get('/visits', (req, res) => {
    if (!req.query.for || !db.has(req.query.for)) return res.status(404).send(JSON.stringify({ error: 'Not found' }));

    if (req.headers.authorization !== db.get(req.query.for).pass) return res.status(401).send(JSON.stringify({ error: 'Unauthorized' }));

    res.status(200).send(JSON.stringify(db.get(req.query.for).visits));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});