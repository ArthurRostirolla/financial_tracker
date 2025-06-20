import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  // A classe 'dark' será gerenciada no componente de tema ou no layout principal
  return <Component {...pageProps} />;
}