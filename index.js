const path = require('path');
const express = require('express');
const app = express();
const iot = require('@google-cloud/iot');
const { OAuth2Client } = require('google-auth-library');
CLIENT_ID = '168837114669-ucclhidtfd6bh08tv0fsefajvoflh75u.apps.googleusercontent.com';
const oauthClient = new OAuth2Client(CLIENT_ID);

const iotClient = new iot.v1.DeviceManagerClient({});

app.use(express.json());

projectId = 'lit-illumination-technology';
cloudRegion = 'us-central1';
registryId = 'lights';
deviceId = 'test-device';

async function verify(token) {
    const ticket = await oauthClient.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/v1/on_login', (req, res) => {
    verify(req.body.id_token).then((data) => { console.log(JSON.stringify(data)); res.sendStatus(200); }).catch(reason => { console.log(reason); res.sendStatus(403); });
});

app.post('/api/v1/effects', (req, res) => {
    const formattedName = iotClient.devicePath(
        projectId,
        cloudRegion,
        registryId,
        deviceId
    );
    const binaryData = Buffer.from(JSON.stringify({ 'effect_name': 'fireflies', 'args': {}, 'properties': {} }));
    const request = {
        name: formattedName,
        binaryData: binaryData,
        subfolder: "effects",
    };

    try {
        iotClient.sendCommandToDevice(request).then((response, _) => { console.log(response); res.send(JSON.stringify(response)) }).catch((reason) => { console.log(reason); res.status(500) });
    } catch (err) {
        console.error('Could not send command:', err);
        res.sendStatus(500);
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`helloworld: listening on port ${port}`);
});