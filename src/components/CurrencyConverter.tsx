import { useState, useEffect } from "react";
import axios from "axios";
import './currencyConverter.scss';
import mobileBg from '../assets/currencyConverter/mobile/bgImageCurrencyConverter-mobile.webp';
import tabletBg from '../assets/currencyConverter/tablet/bgImageCurrencyConverter-tablet.webp';
import desktopBg from '../assets/currencyConverter/desktop/bgImageCurrencyConverter-desktop.webp';

type ConversionRates = Record<string, number>;

type ExchangeRateResponse = {
  conversion_rates: ConversionRates;
};

const CurrencyConverter = () => {
  const [rates, setRates] = useState<ConversionRates | null>(null);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState<number | "">(1);
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);

  useEffect(() => {
    axios.get<ExchangeRateResponse>("https://v6.exchangerate-api.com/v6/1ec9950e8b454da1ea047f17/latest/USD")
      .then((response) => {
        setRates(response.data.conversion_rates);
      }).catch((error) => {
        console.log("Erro ao obter dados da API", error);
      });
  }, []);

  useEffect(() => {
    if (rates) {
      const rateFrom = rates[fromCurrency] || 0;
      const rateTo = rates[toCurrency] || 0;
      setConvertedAmount(((Number(amount) / rateFrom) * rateTo).toFixed(2));
    }
  }, [amount, rates, fromCurrency, toCurrency]);

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
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
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
        <h3>
          {convertedAmount} {toCurrency}
        </h3>
        <p>
          {amount} {fromCurrency} valem {convertedAmount} {toCurrency}
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverter;
