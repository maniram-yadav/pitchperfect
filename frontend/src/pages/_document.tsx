import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>PitchPerfect - AI Cold Email Generator</title>
        <meta name="description" content="Generate high-converting cold emails with AI" />
      </Head>
      <body className="bg-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
