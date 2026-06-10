import axios from 'axios';

async function run() {
    try {
        const res = await axios.get('http://localhost:5000/career/jobs');
        const jobs = res.data.jobs || res.data.data || (Array.isArray(res.data) ? res.data : []);
        const job1 = jobs.find(j => j.title === "jwbkhdejcdv b");
        if (job1) {
            const loc = job1.location;
            console.log(`Location: "${loc}"`);
            console.log(`Length: ${loc.length}`);
            for (let i = 0; i < loc.length; i++) {
                console.log(`Char at ${i}: '${loc[i]}' (code: ${loc.charCodeAt(i)})`);
            }
        } else {
            console.log("Job 1 not found!");
        }
    } catch (e) {
        console.error(e.message);
    }
}
run();
