import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Typography, Button, Col, Menu, Row, Input, Form } from "antd";
import "antd/dist/antd.css";
import Authereum from "authereum";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useEventListener } from "eth-hooks/events/useEventListener";
import Fortmatic from "fortmatic";
// https://www.npmjs.com/package/ipfs-http-client
// import { create } from "ipfs-http-client";
import { React, useRef, useEffect, useState, useCallback } from "react";
// import ReactJson from "react-json-view";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
//import Torus from "@toruslabs/torus-embed"
import WalletLink from "walletlink";
import Web3Modal from "web3modal";
import { INFURA_ID, NETWORK, NETWORKS } from "../../constants";
import { Transactor } from "../../helpers";
import { useContractConfig } from "../../hooks";
// import Hints from "./Hints";

const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI.create({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
console.log("ipfs")
console.log(ipfs)
const { ethers } = require("ethers");


/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
    )
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Portis ID: 6255fb2b-58c8-433b-a2c9-62098c05ddc9
/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "pk_live_5A7C91B2FC585A17", // required
      },
    },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, _options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});

export default function MintPage({
  tx,
  writeContracts,
  address
}) {
  // const mainnetProvider =
  //   poktMainnetProvider && poktMainnetProvider._isProvider
  //     ? poktMainnetProvider
  //     : scaffoldEthProvider && scaffoldEthProvider._network
  //     ? scaffoldEthProvider
  //     : mainnetInfura;

  // const [injectedProvider, setInjectedProvider] = useState();
  // const [address, setAddress] = useState();

  // const logoutOfWeb3Modal = async () => {
  //   await web3Modal.clearCachedProvider();
  //   if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
  //     await injectedProvider.provider.disconnect();
  //   }
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 1);
  // };

  // /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  // const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  // /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  // const gasPrice = useGasPrice(targetNetwork, "fast");
  // // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  // const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  // const userSigner = userProviderAndSigner.signer;
  // console.log("userSigner")
  // console.log(userSigner)
  // useEffect(() => {
  //   async function getAddress() {
  //     if (userSigner) {
  //       const newAddress = await userSigner.getAddress();
  //       setAddress(newAddress);
  //     }
  //   }
  //   getAddress();
  // }, [userSigner]);

  // // You can warn the user if you would like them to be on a specific network
  // const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  // const selectedChainId =
  //   userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // // The transactor wraps transactions and provides notificiations
  // const tx = Transactor(userSigner, gasPrice);
  // console.log("tx")
  // console.log(tx)

  // // Faucet Tx can be used to send funds from the faucet
  // const faucetTx = Transactor(localProvider, gasPrice);

  // // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  // const yourLocalBalance = useBalance(localProvider, address);

  // // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  // // Load in your local 📝 contract and read a value from it:
  // const readContracts = useContractLoader(localProvider, contractConfig);

  // // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  // const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // // EXTERNAL CONTRACT EXAMPLE:
  // //
  // // If you want to bring in the mainnet DAI contract it would look like:
  // const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // // If you want to call a function on a new block
  // useOnBlock(mainnetProvider, () => {
  //   console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  // });

  // // Then read your DAI balance like:
  // const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
  //   "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  // ]);

  // // keep track of a variable from the contract in the local React state:
  // const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [address]);
  // console.log("🤗 balance:", balance);

  // // 📟 Listen for broadcast events
  // const transferEvents = useEventListener(readContracts, "YourCollectible", "Transfer", localProvider, 1);
  // console.log("📟 Transfer events:", transferEvents);

  // //
  // // 🧠 This effect will update yourCollectibles by polling when your balance changes
  // //
  // const yourBalance = balance && balance.toNumber && balance.toNumber();
  // const [yourCollectibles, setYourCollectibles] = useState();

  // useEffect(() => {
  //   const updateYourCollectibles = async () => {
  //     const collectibleUpdate = [];
  //     for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
  //       try {
  //         console.log("GEtting token index", tokenIndex);
  //         const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex);
  //         console.log("tokenId", tokenId);
  //         const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
  //         console.log("tokenURI", tokenURI);

  //         const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
  //         console.log("ipfsHash", ipfsHash);

  //         const jsonManifestBuffer = await getFromIPFS(ipfsHash);

  //         try {
  //           const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
  //           console.log("jsonManifest", jsonManifest);
  //           collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
  //         } catch (e) {
  //           console.log(e);
  //         }
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     }
  //     setYourCollectibles(collectibleUpdate);
  //   };
  //   updateYourCollectibles();
  // }, [address, yourBalance]);

  // /*
  // const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  // console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  // */

  // //
  // // 🧫 DEBUG 👨🏻‍🔬
  // //
  // useEffect(() => {
  //   if (
  //     DEBUG &&
  //     mainnetProvider &&
  //     address &&
  //     selectedChainId &&
  //     yourLocalBalance &&
  //     yourMainnetBalance &&
  //     readContracts &&
  //     writeContracts &&
  //     mainnetContracts
  //   ) {
  //     console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
  //     console.log("🌎 mainnetProvider", mainnetProvider);
  //     console.log("🏠 localChainId", localChainId);
  //     console.log("👩‍💼 selected address:", address);
  //     console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
  //     console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
  //     console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
  //     console.log("📝 readContracts", readContracts);
  //     console.log("🌍 DAI contract on mainnet:", mainnetContracts);
  //     console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
  //     console.log("🔐 writeContracts", writeContracts);
  //   }
  // }, [
  //   mainnetProvider,
  //   address,
  //   selectedChainId,
  //   yourLocalBalance,
  //   yourMainnetBalance,
  //   readContracts,
  //   writeContracts,
  //   mainnetContracts,
  // ]);

  // let networkDisplay = "";
  // if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
  //   const networkSelected = NETWORK(selectedChainId);
  //   const networkLocal = NETWORK(localChainId);
  //   if (selectedChainId === 1337 && localChainId === 31337) {
  //     networkDisplay = (
  //       <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
  //         <Alert
  //           message="⚠️ Wrong Network ID"
  //           description={
  //             <div>
  //               You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
  //               HardHat.
  //               <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
  //             </div>
  //           }
  //           type="error"
  //           closable={false}
  //         />
  //       </div>
  //     );
  //   } else {
  //     networkDisplay = (
  //       <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
  //         <Alert
  //           message="⚠️ Wrong Network"
  //           description={
  //             <div>
  //               You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
  //               <Button
  //                 onClick={async () => {
  //                   const ethereum = window.ethereum;
  //                   const data = [
  //                     {
  //                       chainId: "0x" + targetNetwork.chainId.toString(16),
  //                       chainName: targetNetwork.name,
  //                       nativeCurrency: targetNetwork.nativeCurrency,
  //                       rpcUrls: [targetNetwork.rpcUrl],
  //                       blockExplorerUrls: [targetNetwork.blockExplorer],
  //                     },
  //                   ];
  //                   console.log("data", data);

  //                   let switchTx;
  //                   // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
  //                   try {
  //                     switchTx = await ethereum.request({
  //                       method: "wallet_switchEthereumChain",
  //                       params: [{ chainId: data[0].chainId }],
  //                     });
  //                   } catch (switchError) {
  //                     // not checking specific error code, because maybe we're not using MetaMask
  //                     try {
  //                       switchTx = await ethereum.request({
  //                         method: "wallet_addEthereumChain",
  //                         params: data,
  //                       });
  //                     } catch (addError) {
  //                       // handle "add" error
  //                     }
  //                   }

  //                   if (switchTx) {
  //                     console.log(switchTx);
  //                   }
  //                 }}
  //               >
  //                 <b>{networkLocal && networkLocal.name}</b>
  //               </Button>
  //             </div>
  //           }
  //           type="error"
  //           closable={false}
  //         />
  //       </div>
  //     );
  //   }
  // } else {
  //   networkDisplay = (
  //     <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
  //       {targetNetwork.name}
  //     </div>
  //   );
  // }

  // const loadWeb3Modal = useCallback(async () => {
  //   const provider = await web3Modal.connect();
  //   setInjectedProvider(new ethers.providers.Web3Provider(provider));

  //   provider.on("chainChanged", chainId => {
  //     console.log(`chain changed to ${chainId}! updating providers`);
  //     setInjectedProvider(new ethers.providers.Web3Provider(provider));
  //   });

  //   provider.on("accountsChanged", () => {
  //     console.log(`account changed!`);
  //     setInjectedProvider(new ethers.providers.Web3Provider(provider));
  //   });

  //   // Subscribe to session disconnection
  //   provider.on("disconnect", (code, reason) => {
  //     console.log(code, reason);
  //     logoutOfWeb3Modal();
  //   });
  // }, [setInjectedProvider]);

  // useEffect(() => {
  //   if (web3Modal.cachedProvider) {
  //     loadWeb3Modal();
  //   }
  // }, [loadWeb3Modal]);

  // const [route, setRoute] = useState();
  // useEffect(() => {
  //   setRoute(window.location.pathname);
  // }, [setRoute]);

  // let faucetHint = "";
  // const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  // const [faucetClicked, setFaucetClicked] = useState(false);
  // if (
  //   !faucetClicked &&
  //   localProvider &&
  //   localProvider._network &&
  //   localProvider._network.chainId == 31337 &&
  //   yourLocalBalance &&
  //   ethers.utils.formatEther(yourLocalBalance) <= 0
  // ) {
  //   faucetHint = (
  //     <div style={{ padding: 16 }}>
  //       <Button
  //         type="primary"
  //         onClick={() => {
  //           faucetTx({
  //             to: address,
  //             value: ethers.utils.parseEther("0.01"),
  //           });
  //           setFaucetClicked(true);
  //         }}
  //       >
  //         💰 Grab funds from the faucet ⛽️
  //       </Button>
  //     </div>
  //   );
  // }

  const [yourJSON, setYourJSON] = useState({});
  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsDownHash, setIpfsDownHash] = useState();
  const [downloading, setDownloading] = useState();
  const [ipfsContent, setIpfsContent] = useState();
  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [minting, setMinting] = useState(false);
  const [count, setCount] = useState(1);
  const [name, setName] = useState("");
  const [linkedIn, setlinkedIn] = useState("");
  const [github, setGithub] = useState("");
  const [school, setSchool] = useState("");
  const [resume, setResume] = useState("");

  // const [count, setCount] = useState(1);
  const getJson = () => {
    return {
      name: name,
    };
  };

  const mintItem = async () => {
    // upload to ipfs
    const uploaded = await ipfs.add(JSON.stringify(getJson()));
    console.log("Uploaded Hash: ", uploaded);
    const result = tx(
      writeContracts &&
        writeContracts.YourCollectible &&
        writeContracts.YourCollectible.mintItem(address, uploaded.path),
      update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          console.log(" 🍾 Transaction " + update.hash + " finished!");
          console.log(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
  };

  const handleSubmit = async event => {
    alert("A name was submitted: " + this.state.value);
    event.preventDefault();
    var status = await mintItem();
  };

  return (
    <Menu style={{height:"100%", margin: "5%", padding:"5%", }}>
      {/* <Form onSubmit={handleSubmit}> */}
      <Typography.Title level={3}>Minting in 1 step what?!</Typography.Title>
      <Input
        id="0xName"
        name="0xName"
        autoComplete="off"
        autoFocus={true}
        placeholder={"Name"}
        onChange={e => {
          setName(e.target.value);
        }}
      ></Input>
      <Input
        id="0xSchool"
        name="0xSchool"
        autoComplete="off"
        autoFocus={true}
        placeholder={"School"}
        onChange={e => {
          setSchool(e.target.value);
        }}
      ></Input>
      <Input
        id="0xLinkedIn"
        name="0xLinkedIn"
        autoComplete="off"
        autoFocus={true}
        placeholder={"LinkedIn"}
        onChange={e => {
          setlinkedIn(e.target.value);
        }}
      ></Input>
      <Input
        id="0xGithub"
        name="0xGithub"
        autoComplete="off"
        autoFocus={true}
        placeholder={"Github"}
        onChange={e => {
          setGithub(e.target.value);
        }}
      ></Input>
      <Input
        id="0xResume"
        name="0xResume"
        autoComplete="off"
        autoFocus={true}
        placeholder={"Resume"}
        onChange={e => {
          setResume(e.target.value);
        }}
      ></Input>

      <Button
        disabled={minting}
        shape="round"
        size="large"
        onClick={() => {
          mintItem();
        }}
      >
        MINT NFT
      </Button>
      {/* </Form> */}
    </Menu>
  );
}
