const axios = require('axios');

async function test() {
    try {
        const response = await axios.get('https://api.nextkinlife.live/buy-sell/get', {
            params: {
                country: 'India'
            }
        });
        const listings = response.data.listings || [];
        console.log('LISTINGS FROM PRODUCTION:');
        listings.forEach(l => {
            console.log(`- Title: "${l.title}" | Country: "${l.country}" | State: "${l.state}" | City: "${l.city}"`);
        });
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

test();
