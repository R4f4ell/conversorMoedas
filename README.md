# Conversor de Moedas

Aplicacao para conversao de moedas usando React, TypeScript e Vite. Uso da api no ExchangeRate API para busca de cotacoes atualizadas exibindo nome das moedas e calculando o valor convertido automaticamente .

## Tecnologias

- React
- TypeScript
- Vite
- SCSS
- Axios

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_EXCHANGE_RATE_API_BASE_URL=https://v6.exchangerate-api.com/v6
VITE_EXCHANGE_RATE_API_KEY=chave_da_api
VITE_EXCHANGE_RATE_BASE_CURRENCY=USD
```

## Estrutura do projeto

```txt
conversorMoedas/
|-- public/
|-- src/
|   |-- components/
|   |-- styles/
|   `-- utils/
|-- .env.example
|-- package.json
`-- vite.config.js
```

## Como rodar

Instale as dependencias:

```powershell
npm install
```

Inicie o ambiente de desenvolvimento:

```powershell
npm run dev
```