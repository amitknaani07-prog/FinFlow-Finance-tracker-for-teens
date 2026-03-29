"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyContextType = {
  currency: string;
  setCurrency: (c: string) => void;
  rates: Record<string, number>;
  convert: (amount: number, from?: string, to?: string) => number;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  rates: { USD: 1 },
  convert: (amount) => amount,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  useEffect(() => {
    // Attempt to load from localStorage
    const saved = localStorage.getItem("finflow-currency");
    if (saved) setCurrency(saved);

    const fetchRates = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        setRates(data.rates);
      } catch (error) {
        console.error("Failed to fetch exchange rates, using fallbacks.", error);
        setRates({ USD: 1, ILS: 3.75, EUR: 0.92, GBP: 0.79 });
      }
    };
    fetchRates();
  }, []);

  const handleSetCurrency = (c: string) => {
    setCurrency(c);
    localStorage.setItem("finflow-currency", c);
  };

  const convert = (amount: number, from = "USD", to = currency) => {
    if (from === to) return amount;
    const baseAmount = amount / (rates[from] || 1);
    return baseAmount * (rates[to] || 1);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, rates, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
