import "./App.css";
import { Profile } from "./components/Profile";
import { ToastContainer } from "react-toastify";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

import { alchemyProvider } from "wagmi/providers/alchemy";
// import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import ParticlesBackground from "./components/ParticlesBackground";
import { useEffect } from "react";

const { provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_API_KEY })]
);

const client = createClient({
  autoConnect: false,
  connector: new MetaMaskConnector({
    chains: [polygonMumbai],
  }),
  provider,
  webSocketProvider,
});

function App() {
  return (
    <>
      <ParticlesBackground />
      <ToastContainer />

      <WagmiConfig client={client}>
        <div className="App">
          <header className="App-header">
            <h1 className="text-3xl font-bold underline z-10 text-white">
              Welcome to GasLessDapp!
            </h1>

            <div className="mt-5 z-10">
              <Profile />
            </div>
          </header>
        </div>
      </WagmiConfig>
    </>
  );
}
export default App;
