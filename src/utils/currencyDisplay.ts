const currencyDisplayNames = new Intl.DisplayNames(["pt-BR"], {
  type: "currency",
});

export const getCurrencyDisplayName = (currency: string) => {
  return currencyDisplayNames.of(currency) ?? currency;
};
