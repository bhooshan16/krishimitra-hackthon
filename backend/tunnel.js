const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
    try {
        const tunnel = await localtunnel({ port: 5000 });
        fs.writeFileSync('url.txt', tunnel.url);
        console.log('Tunnel created at: ' + tunnel.url);

        tunnel.on('close', () => {
            console.log('Tunnel closed.');
        });
    } catch (err) {
        console.error('Tunnel error:', err);
    }
})();
