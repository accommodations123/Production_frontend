import React, { useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import { COUNTRIES } from '@/lib/mock-data';

// Full currency names mapping for user-friendly display
const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
  AED: 'UAE Dirham',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  SGD: 'Singapore Dollar',
  CHF: 'Swiss Franc',
  MXN: 'Mexican Peso',
  BRL: 'Brazilian Real',
  ZAR: 'South African Rand',
  NZD: 'New Zealand Dollar',
  KRW: 'South Korean Won',
  THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit',
  PHP: 'Philippine Peso',
  IDR: 'Indonesian Rupiah',
  VND: 'Vietnamese Dong',
  PKR: 'Pakistani Rupee',
  BDT: 'Bangladeshi Taka',
  LKR: 'Sri Lankan Rupee',
  NPR: 'Nepalese Rupee',
  AFN: 'Afghan Afghani',
  ALL: 'Albanian Lek',
  AMD: 'Armenian Dram',
  AOA: 'Angolan Kwanza',
  ARS: 'Argentine Peso',
  AZN: 'Azerbaijani Manat',
  BAM: 'Bosnia Convertible Mark',
  BGN: 'Bulgarian Lev',
  BHD: 'Bahraini Dinar',
  BIF: 'Burundian Franc',
  BND: 'Brunei Dollar',
  BOB: 'Bolivian Boliviano',
  BWP: 'Botswanan Pula',
  BYN: 'Belarusian Ruble',
  CLP: 'Chilean Peso',
  COP: 'Colombian Peso',
  CRC: 'Costa Rican Colón',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  DOP: 'Dominican Peso',
  DZD: 'Algerian Dinar',
  EGP: 'Egyptian Pound',
  ETB: 'Ethiopian Birr',
  GEL: 'Georgian Lari',
  GHS: 'Ghanaian Cedi',
  HKD: 'Hong Kong Dollar',
  HRK: 'Croatian Kuna',
  HUF: 'Hungarian Forint',
  ILS: 'Israeli Shekel',
  IQD: 'Iraqi Dinar',
  IRR: 'Iranian Rial',
  ISK: 'Icelandic Króna',
  JMD: 'Jamaican Dollar',
  JOD: 'Jordanian Dinar',
  KES: 'Kenyan Shilling',
  KGS: 'Kyrgystani Som',
  KHR: 'Cambodian Riel',
  KWD: 'Kuwaiti Dinar',
  KZT: 'Kazakhstani Tenge',
  LAK: 'Laotian Kip',
  LBP: 'Lebanese Pound',
  LYD: 'Libyan Dinar',
  MAD: 'Moroccan Dirham',
  MDL: 'Moldovan Leu',
  MKD: 'Macedonian Denar',
  MMK: 'Myanmar Kyat',
  MNT: 'Mongolian Tugrik',
  MOP: 'Macanese Pataca',
  MUR: 'Mauritian Rupee',
  MVR: 'Maldivian Rufiyaa',
  MWK: 'Malawian Kwacha',
  NGN: 'Nigerian Naira',
  NOK: 'Norwegian Krone',
  OMR: 'Omani Rial',
  PEN: 'Peruvian Sol',
  PLN: 'Polish Zloty',
  QAR: 'Qatari Riyal',
  RON: 'Romanian Leu',
  RSD: 'Serbian Dinar',
  RUB: 'Russian Ruble',
  RWF: 'Rwandan Franc',
  SAR: 'Saudi Riyal',
  SEK: 'Swedish Krona',
  TND: 'Tunisian Dinar',
  TRY: 'Turkish Lira',
  TWD: 'New Taiwan Dollar',
  TZS: 'Tanzanian Shilling',
  UAH: 'Ukrainian Hryvnia',
  UGX: 'Ugandan Shilling',
  UYU: 'Uruguayan Peso',
  UZS: 'Uzbekistani Som',
  XAF: 'Central African CFA Franc',
  XOF: 'West African CFA Franc',
  YER: 'Yemeni Rial',
  ZMW: 'Zambian Kwacha'
};

const PricingSection = ({ formData, setFormData }) => {
  // Generate unique currencies list with full names
  const currencies = useMemo(() => {
    const unique = new Map();
    COUNTRIES.forEach(c => {
      if (c.currency && !unique.has(c.currency)) {
        const name = CURRENCY_NAMES[c.currency] || c.currency;
        unique.set(c.currency, {
          code: c.currency,
          name: name,
          symbol: c.currency === 'INR' ? '₹' : c.currency === 'USD' ? '$' : c.currency === 'EUR' ? '€' : c.currency
        });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <section className="bg-black/20 rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-accent" />
        Pricing Details
      </h2>
      <p className="text-sm text-gray-400 mb-6">You can offer discounts for longer stays.</p>

      <div className="space-y-4">
        <div className="bg-black/20 rounded-xl p-4 border border-white/10 flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-lg"><DollarSign className="h-6 w-6 text-yellow-400" /></div>
          <div className="flex-1">
            <label className="text-sm font-bold block">Price Per Month</label>
            <input
              type="number"
              placeholder="1200"
              className="w-full bg-transparent border-none text-xl font-bold focus:outline-none placeholder:text-gray-600"
              value={formData.priceMonth}
              onChange={e => setFormData({ ...formData, priceMonth: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <label className="text-xs font-medium text-gray-400 block mb-1">Currency</label>
            <select
              className="w-full bg-transparent border-none text-lg font-bold focus:outline-none text-white [&>option]:bg-gray-800"
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>{curr.name} ({curr.code})</option>
              ))}
            </select>
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <label className="text-xs font-medium text-gray-400 block mb-1">Per Hour</label>
            <input
              type="number"
              placeholder="0"
              className="w-full bg-transparent border-none text-lg font-bold focus:outline-none placeholder:text-gray-600"
              value={formData.pricePerHour}
              onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
            />
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <label className="text-xs font-medium text-gray-400 block mb-1">Per Night</label>
            <input
              type="number"
              placeholder="60"
              className="w-full bg-transparent border-none text-lg font-bold focus:outline-none placeholder:text-gray-600"
              value={formData.priceNight}
              onChange={e => setFormData({ ...formData, priceNight: e.target.value })}
            />
          </div>
        </div>

        {/* Note about auto-currency */}
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-2">
          <span className="text-blue-400 text-lg">💡</span>
          <p className="text-xs text-blue-300">
            <strong>Tip:</strong> Currency is automatically selected based on your country. You can change it if needed.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;