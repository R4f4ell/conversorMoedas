import { useState, useEffect, useMemo, type FocusEvent } from "react";
import axios from "axios";
import './currencyConverter.scss';
import { getCurrencyDisplayName } from "../utils/currencyDisplay";

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
type CurrencySelectKind = "from" | "to";

type CurrencySelectProps = {
  currencies: string[];
  isOpen: boolean;
  value: string;
  onBlur: (event: FocusEvent<HTMLDivElement>) => void;
  onChange: (value: string) => void;
  onToggle: () => void;
};

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

const CurrencySelect = ({
  currencies,
  isOpen,
  value,
  onBlur,
  onChange,
  onToggle,
}: CurrencySelectProps) => (
  <div className="currency-select" onBlur={onBlur}>
    <button
      type="button"
      className="currency-select__trigger"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <span>{value}</span>
      <span className="currency-select__icon" aria-hidden="true" />
    </button>

    {isOpen && (
      <div className="currency-select__menu" role="listbox">
        {currencies.map((currency) => (
          <button
            type="button"
            key={currency}
            className="currency-select__option"
            aria-selected={currency === value}
            role="option"
            onClick={() => onChange(currency)}
          >
            <span className="currency-select__code">{currency}</span>
            <span className="currency-select__name">{getCurrencyDisplayName(currency)}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);

const CurrencyConverter = () => {
  const [rates, setRates] = useState<ConversionRates | null>(null);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [openSelect, setOpenSelect] = useState<CurrencySelectKind | null>(null);
  const numericAmount = getNumericAmount(amount);
  const isAmountEmpty = amount === "";
  const currencies = rates ? Object.keys(rates) : [];

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
    return (
      <div className="converter-wrapper">
        <div className="converter converter--status">{error}</div>
      </div>
    );
  }

  if (!rates) {
    return (
      <div className="converter-wrapper">
        <div className="converter converter--status">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="converter-wrapper">
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
        <CurrencySelect
          currencies={currencies}
          isOpen={openSelect === "from"}
          value={fromCurrency}
          onBlur={(e) => {
            const nextTarget = e.relatedTarget as Node | null;

            if (!e.currentTarget.contains(nextTarget)) {
              setOpenSelect(null);
            }
          }}
          onChange={(currency) => {
            setFromCurrency(currency);
            setOpenSelect(null);
          }}
          onToggle={() => setOpenSelect(openSelect === "from" ? null : "from")}
        />
        <span> para </span>
        <CurrencySelect
          currencies={currencies}
          isOpen={openSelect === "to"}
          value={toCurrency}
          onBlur={(e) => {
            const nextTarget = e.relatedTarget as Node | null;

            if (!e.currentTarget.contains(nextTarget)) {
              setOpenSelect(null);
            }
          }}
          onChange={(currency) => {
            setToCurrency(currency);
            setOpenSelect(null);
          }}
          onToggle={() => setOpenSelect(openSelect === "to" ? null : "to")}
        />
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
