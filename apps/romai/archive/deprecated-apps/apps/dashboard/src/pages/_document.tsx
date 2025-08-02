import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ro" className="scroll-smooth">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="ROMAI - Romanian AI Central Intelligence System Dashboard" />
        <meta name="keywords" content="ROMAI, Romanian AI, Artificial Intelligence, CodAI" />
        <meta name="author" content="CodAI Team" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#f97316" />
      </Head>
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
