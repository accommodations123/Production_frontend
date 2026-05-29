const axios = require('axios');

async function test() {
    try {
        const response = await axios.get('http://localhost:5000/buy-sell/get', {
            params: {
                country: 'India',
                state: 'Assam'
            }
        });
        console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error('ERROR:', e.message);
        if (e.response) {
            console.error('RESPONSE DATA:', e.response.data);
        }
    }
}

test();
