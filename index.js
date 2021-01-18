const express = require('express');
const app = express();
const iot = require('@google-cloud/iot');

const iotClient = new iot.v1.DeviceManagerClient({});

projectId = 'lit-illumination-technology';
cloudRegion = 'us-central1';
registryId = 'lights';
deviceId = 'test-device';


app.get('/', (req, res) => {
    const name = process.env.NAME || 'World';
    res.send(`Hello ${name}!`);
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
        res.status(500);
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`helloworld: listening on port ${port}`);
});