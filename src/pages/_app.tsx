import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  DehydratedState,
} from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';

const activeChainId = ChainId.Mumbai;

const supportedChains = [ChainId.Polygon, ChainId.Mumbai];

function MyApp({
  Component,
  pageProps,
}: AppProps<{ dehydratedState: DehydratedState }>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        cacheTime: 1 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider
        supportedChains={supportedChains}
        desiredChainId={activeChainId}
      >
        <Hydrate state={pageProps.dehydratedState}>
          <Component {...pageProps} />
          <ToastContainer />
        </Hydrate>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
