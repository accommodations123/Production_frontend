
import { Country } from 'country-state-city';

const countries = Country.getAllCountries();
const us = countries.find(c => c.isoCode === 'US');
console.log('Default US name:', us.name);

const mapped = countries.map(c =>
    c.isoCode === 'US' ? { ...c, name: "United States of America" } : c
);
const mappedUs = mapped.find(c => c.isoCode === 'US');
console.log('Mapped US name:', mappedUs.name);
