import axios from 'axios';

async function run() {
    const locations = [
        "South Africa",
        "South",
        "Africa",
        "south africa",
        "South  Africa",
        "United States of America",
        "United",
        "States",
        "America"
    ];
    for (const loc of locations) {
        try {
            const res = await axios.get('http://localhost:5000/career/jobs', {
                params: { location: loc }
            });
            const jobs = res.data.jobs || res.data.data || (Array.isArray(res.data) ? res.data : []);
            console.log(`location: "${loc}" => Count: ${jobs.length}`);
            if (jobs.length > 0) {
                console.log(`  Locations found:`, jobs.map(j => j.location));
            }
        } catch (e) {
            console.error(`Error for "${loc}":`, e.message);
        }
    }
}
run();
