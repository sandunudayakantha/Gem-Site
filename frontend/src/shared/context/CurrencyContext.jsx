import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'RO', name: 'Omani Rial' },
];

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });
  const [rates, setRates] = useState({ USD: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      // Using a free API (no key required for some base pairs)
      // Note: Base is USD as our prices are stored in USD
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      if (data && data.rates) {
        setRates(data.rates);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback rates if API fails
      setRates({
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        LKR: 300,
        JPY: 151,
        AED: 3.67,
        AUD: 1.52,
        CAD: 1.36,
        CHF: 0.91,
        CNY: 7.23,
        HKD: 7.83,
        INR: 83.45,
        KRW: 1350,
        MYR: 4.75,
        NZD: 1.66,
        QAR: 3.64,
        SAR: 3.75,
        SGD: 1.35,
        THB: 36.5,
        ZAR: 18.5,
        SEK: 10.8,
        NOK: 10.9,
        DKK: 6.9,
        RUB: 92.5,
        TRY: 32.2,
        BRL: 5.1,
        TWD: 32.3,
        MOP: 8.05,
        VND: 25000,
        IDR: 16000,
        PKR: 278,
        BDT: 110,
        ILS: 3.7,
        EGP: 48.5,
        KWD: 0.31,
        BHD: 0.38,
        OMR: 0.38
      });
    } finally {
      setLoading(false);
    }
  };

  const changeCurrency = (code) => {
    setSelectedCurrency(code);
    localStorage.setItem('currency', code);
  };

  const formatPrice = (priceInUSD) => {
    if (!priceInUSD) return '';
    const rate = rates[selectedCurrency] || 1;
    const convertedPrice = priceInUSD * rate;
    const currencyInfo = currencies.find(c => c.code === selectedCurrency);
    const symbol = currencyInfo ? currencyInfo.symbol : '$';

    // Currencies that typically don't use decimal places
    const noDecimals = ['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'ISK', 'PYG'].includes(selectedCurrency);

    return `${symbol}${Number(convertedPrice).toLocaleString(undefined, {
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    })}`;
  };

  const value = {
    selectedCurrency,
    currencies,
    changeCurrency,
    formatPrice,
    rates,
    loading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
