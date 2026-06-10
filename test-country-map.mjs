import { Country } from 'country-state-city';

const countries = Country.getAllCountries();
const us = countries.find(c => c.isoCode === 'US');
console.log('US Country object:', JSON.stringify(us, null, 2));
