import React, { useMemo, useEffect } from 'react';
import { Coins, Ticket, Wallet } from 'lucide-react';
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

export function StepPricing({ formData, setFormData, contributionType = 'property' }) {

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

    // Auto-set currency based on country
    useEffect(() => {
        if (formData.country) {
            const countryName = typeof formData.country === 'string' ? formData.country : formData.country.name;
            const normalized = (countryName === "United States" || countryName === "United States of America") ? "United States of America" : countryName;
            const matchedCountry = COUNTRIES.find(c => c.name === normalized);

            // Prefer the mock data currency, or fallback to the object's currency if available
            const currencyCode = matchedCountry?.currency || (typeof formData.country === 'object' ? formData.country.currency : null);

            if (currencyCode && formData.currency !== currencyCode) {
                setFormData(prev => ({ ...prev, currency: currencyCode }));
            }
        }
    }, [formData.country]);

    // Helper for robust symbol display
    const getCurrencySymbol = (currencyCode) => {
        if (!currencyCode) return '$';
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
            }).formatToParts(0).find(part => part.type === 'currency')?.value || currencyCode;
        } catch (e) {
            return currencyCode;
        }
    };

    const displaySymbol = getCurrencySymbol(formData.currency);

    // Render Event Pricing
    if (contributionType === 'event') {
        return (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Pricing</h2>
                <p className="text-sm text-slate-500 -mt-2 mb-6">Is this a free event or do attendees need tickets?</p>

                <div className="space-y-6">
                    {/* Event Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setFormData({ ...formData, eventPrice: 'free', priceAmount: 0 })}
                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${formData.eventPrice === 'free'
                                ? 'bg-accent/10 border-accent text-accent shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <span className="text-lg font-bold block mb-1">Free Event</span>
                            <span className="text-xs opacity-70">No cost for attendees</span>
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, eventPrice: 'fixed_price' })}
                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${formData.eventPrice === 'fixed_price'
                                ? 'bg-accent/10 border-accent text-accent shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <span className="text-lg font-bold block mb-1">Paid Ticket</span>
                            <span className="text-xs opacity-70">Set a ticket price</span>
                        </button>
                    </div>

                    {/* Price Input if Paid */}
                    {formData.eventPrice === 'fixed_price' && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-slate-100 p-3 rounded-lg"><Ticket className="h-6 w-6 text-accent" /></div>
                            <div className="flex-1">
                                <label className="text-sm font-bold block text-slate-700">Ticket Price <span className="text-red-500 ml-1">*</span></label>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xl font-bold text-accent min-w-[20px] text-center">{displaySymbol}</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-transparent border-none text-xl font-bold focus:outline-none placeholder:text-slate-400 text-slate-900"
                                        value={formData.priceAmount}
                                        onChange={e => setFormData({ ...formData, priceAmount: e.target.value })}
                                    />
                                </div>
                            </div>
                            {/* Simple Currency Selector for Event */}
                            <select
                                className="bg-white border border-slate-200 rounded-md text-sm text-slate-700 p-1.5 focus:outline-none cursor-pointer"
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            >
                                {currencies.map(curr => (
                                    <option key={curr.code} value={curr.code}>{curr.name} ({curr.code})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Note about auto-currency */}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                        <span className="text-blue-500 text-lg">💡</span>
                        <p className="text-xs text-blue-800">
                            <strong>Tip:</strong> Currency is automatically selected based on your country. You can change it if needed.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Render Travel Companion Budget
    if (contributionType === 'travel_companion') {
        return (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Budget Preference</h2>
                <p className="text-sm text-slate-500 -mt-2 mb-6">How do you plan to handle expenses?</p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setFormData({ ...formData, budgetPreference: 'shared' })}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${formData.budgetPreference === 'shared'
                            ? 'bg-accent/10 border-accent text-accent shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <span className="block mb-2 text-slate-600"><Wallet className="h-6 w-6" /></span>
                        <span className="text-lg font-bold block mb-1">Shared</span>
                        <span className="text-xs opacity-70">Split costs equally</span>
                    </button>
                    <button
                        onClick={() => setFormData({ ...formData, budgetPreference: 'separate' })}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${formData.budgetPreference === 'separate'
                            ? 'bg-accent/10 border-accent text-accent shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <span className="block mb-2 text-slate-600"><Coins className="h-6 w-6" /></span>
                        <span className="text-lg font-bold block mb-1">Separate</span>
                        <span className="text-xs opacity-70">Pay your own way</span>
                    </button>
                </div>
            </div>
        );
    }

    // Default: Property Pricing
    return (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Set your price</h2>
            <p className="text-sm text-slate-500 -mt-2 mb-6">You can offer discounts for longer stays.</p>

            <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <label className="text-sm font-bold block text-slate-700 mb-1">
                        Price Per Month <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-700 min-w-[20px] text-center">
                            {displaySymbol}
                        </span>
                        <input
                            type="number"
                            placeholder="1200"
                            className="w-full bg-transparent border-none text-xl font-bold focus:outline-none placeholder:text-slate-400 text-slate-900"
                            value={formData.priceMonth}
                            onChange={e => setFormData({ ...formData, priceMonth: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <label className="text-xs font-medium text-slate-500 block mb-1">Currency</label>
                        <select
                            className="w-full bg-transparent border-none text-lg font-bold focus:outline-none text-slate-900 cursor-pointer"
                            value={formData.currency}
                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        >
                            {currencies.map(curr => (
                                <option key={curr.code} value={curr.code}>{curr.name} ({curr.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <label className="text-xs font-medium text-slate-500 block mb-1">Per Week (Optional)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full bg-transparent border-none text-lg font-bold focus:outline-none placeholder:text-slate-400 text-slate-900"
                            value={formData.priceWeek || ''}
                            onChange={e => setFormData({ ...formData, priceWeek: e.target.value })}
                        />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <label className="text-xs font-medium text-slate-500 block mb-1">Per Night (Optional)</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full bg-transparent border-none text-lg font-bold focus:outline-none placeholder:text-slate-400 text-slate-900"
                            value={formData.priceNight || ''}
                            onChange={e => setFormData({ ...formData, priceNight: e.target.value })}
                        />
                    </div>
                </div>

                {/* Note about auto-currency */}
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <span className="text-blue-500 text-lg">💡</span>
                    <p className="text-xs text-blue-800">
                        <strong>Tip:</strong> Currency is automatically selected based on your country. You can change it if needed.
                    </p>
                </div>
            </div>
        </div>
    );
}
