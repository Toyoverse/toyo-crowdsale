import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';

// check which one we will work on, maybe get this from somewhere
const activeChainId = ChainId.Mumbai;

const supportedChains = [ChainId.Polygon, ChainId.Mumbai];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider supportedChains={supportedChains} desiredChainId={activeChainId}>
      <Component {...pageProps} />
      <ToastContainer />
    </ThirdwebProvider>
  );
}

export default MyApp;
