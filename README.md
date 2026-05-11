# Conversor de Moedas

Aplicacao para conversao de moedas

## Funcionalidade

- Busca cotacoes atualizadas na ExchangeRate API.
- Permite selecionar moeda de origem e moeda de destino.
- Calcula o valor convertido automaticamente.
- Usa imagens responsivas para mobile, tablet e desktop.

## Tecnologias

- React
- TypeScript
- Vite
- SCSS
- Axios

## Estrutura do projeto

```txt
conversorMoedas/
├─ public/
├─ src/
│  ├─ assets/
│  │  └─ currencyConverter/
│  │     ├─ desktop/
│  │     ├─ mobile/
│  │     └─ tablet/
│  ├─ components/
│  ├─ styles/
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