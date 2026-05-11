import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import './currencyConverter.scss';
import mobileBg from '../assets/currencyConverter/mobile/bgImageCurrencyConverter-mobile.webp';
import tabletBg from '../assets/currencyConverter/tablet/bgImageCurrencyConverter-tablet.webp';
import desktopBg from '../assets/currencyConverter/desktop/bgImageCurrencyConverter-desktop.webp';

type ConversionRates = Record<string, number>;

type ExchangeRateSuccessResponse = {
  result: "success";
  conversion_rates: ConversionRates;
};

type ExchangeRateErrorResponse = {
  result: "error";
  "error-type": string;
};

type ExchangeRateResponse = ExchangeRateSuccessResponse | ExchangeRateErrorResponse;

const EXCHANGE_RATE_API_BASE_URL = import.meta.env.VITE_EXCHANGE_RATE_API_BASE_URL;
const EXCHANGE_RATE_API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
const EXCHANGE_RATE_BASE_CURRENCY = import.meta.env.VITE_EXCHANGE_RATE_BASE_CURRENCY ?? "USD";
const EXCHANGE_RATE_API_URL = `${EXCHANGE_RATE_API_BASE_URL}/${EXCHANGE_RATE_API_KEY}/latest/${EXCHANGE_RATE_BASE_CURRENCY}`;
const INVALID_AMOUNT_KEYS = ["e", "E", "+", "-"];
const VALID_AMOUNT_PATTERN = /^\d*([.,]\d*)?$/;

const getNumericAmount = (value: string) => {
  const normalizedValue = value.replace(",", ".");

  if (!normalizedValue || normalizedValue === ".") {
    return null;
  }

  const numericValue = Number(normalizedValue.endsWith(".")
    ? normalizedValue.slice(0, -1)
    : normalizedValue);

  return Number.isFinite(numericValue) ? numericValue : null;
};

const CurrencyConverter = () => {
  const [rates, setRates] = useState<ConversionRates | null>(null);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const numericAmount = getNumericAmount(amount);
  const isAmountEmpty = amount === "";

  useEffect(() => {
    if (!EXCHANGE_RATE_API_BASE_URL || !EXCHANGE_RATE_API_KEY) {
      setError("Configuracao da API de cambio ausente");
      return;
    }

    axios.get<ExchangeRateResponse>(EXCHANGE_RATE_API_URL)
      .then((response) => {
        if (response.data.result !== "success") {
          setError("Erro ao obter dados da API");
          return;
        }

        setRates(response.data.conversion_rates);
      }).catch((error) => {
        console.log("Erro ao obter dados da API", error);
        setError("Erro ao obter dados da API");
      });
  }, []);

  const convertedAmount = useMemo(() => {
    if (numericAmount === null) {
      return null;
    }

    if (rates) {
      const rateFrom = rates[fromCurrency] || 0;
      const rateTo = rates[toCurrency] || 0;

      if (!rateFrom || !rateTo) {
        return null;
      }

      return ((numericAmount / rateFrom) * rateTo).toFixed(2);
    }

    return null;
  }, [numericAmount, rates, fromCurrency, toCurrency]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!rates) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="converter-wrapper">
      <picture className="background-image">
        <source 
          media="(max-width: 480px)" 
          srcSet={mobileBg}
          type="image/webp"
        />
        <source 
          media="(min-width: 481px) and (max-width: 1024px)" 
          srcSet={tabletBg}
          type="image/webp"
        />
        <source 
          media="(min-width: 1025px)" 
          srcSet={desktopBg}
          type="image/webp"
        />
        <img 
          src={desktopBg}
          alt="Currency Converter Background"
          className="bg-image"
        />
      </picture>
      
      <div className="converter">
        <h2>Conversor de Moedas</h2>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onKeyDown={(e) => {
            if (INVALID_AMOUNT_KEYS.includes(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const inputValue = e.target.value;

            if (inputValue === "") {
              setAmount("");
              return;
            }

            if (!VALID_AMOUNT_PATTERN.test(inputValue)) {
              return;
            }

            setAmount(inputValue);
          }}
        />
        <span>Selecione as moedas:</span>
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
        >
          {Object.keys(rates).map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <span> para </span>
        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
        >
          {Object.keys(rates).map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        {isAmountEmpty ? (
          <h3>Informe um valor</h3>
        ) : (
          <>
            <h3>
              {convertedAmount ?? "--"} {toCurrency}
            </h3>
            <p>
              {numericAmount ?? "--"} {fromCurrency} valem {convertedAmount ?? "--"} {toCurrency}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
