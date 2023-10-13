import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import { Contract, ethers } from "ethers";
import myContractManifest from "./contracts/MyContract.json";
import { useState, useEffect, useRef } from 'react';

function App() {
  const myContract = useRef(null);
  const [tikets, setTikets] = useState([]);

  useEffect(() => {
    initContracts();
  }, [])

  let initContracts = async () => {
    await configureBlockchain();
    let tiketsFromBlockchain = await myContract.current?.getTikets();
    if (tiketsFromBlockchain != null)
      setTikets(tiketsFromBlockchain)
  }

  let clickBuyTiket = async (i) => {
    const tx = await myContract.current.buyTiket(i);
    await tx.wait();

    const tiketsUpdated = await myContract.current.getTikets();
    setTikets(tiketsUpdated);
}


  let configureBlockchain = async () => {
    try {
      let provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const networkId = await provider.request({ method: 'net_version' })

        provider = new ethers.providers.Web3Provider(provider);
        const signer = provider.getSigner();

        myContract.current = new Contract(
          myContractManifest.networks[networkId].address,
          myContractManifest.abi,
          signer
        );

      }
    } catch (error) { }
  }

  return (
    <div>
      <h1>Tikets store</h1>
      <ul>
        {tikets.map((address, i) =>
          <li>Tiket {i} comprado por {address}
            {address == ethers.constants.AddressZero &&
              <a href="#" onClick={() => clickBuyTiket(i)}> buy</a>}
          </li>
        )}
      </ul>
    </div>
  )

}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
