import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
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
        LKR: 300,
        EUR: 0.92,
        GBP: 0.79,
        AUD: 1.52,
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

    return `${symbol}${Number(convertedPrice).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
