import type { NextPage } from 'next';
import BN from 'bn.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { useEffect, useState, createRef } from 'react';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import Head from 'next/head';
import Image from 'next/image';
import ToyoLogo from '@assets/toyo_logo---Copia.png';
import XeonLogo from '@assets/TITLESTOP_BOTTOM-2.png';
import XeonBox from '@assets/Xeon-Pier-0-Closed-2048.png';
import ToyoTokenIcon from '@assets/icons/toyo_token_icon.png';
import MintNowButton from '@assets/buttons/mint_btt.png';
import MintNowButtonDisabled from '@assets/buttons/mint_disabled.png';
import XeonToyoList from '@assets/HORIZONTAL_RARITY-RULE2022.png';
import LearnMoreButton from '@assets/buttons/learn_more.png';
import OpenSeaButton from '@assets/buttons/opensea.png';
import PolygonIcon from '@assets/icons/polygon_w.png';
import MetamaskIcon from '@assets/icons/metamask_w.png';
import ToyoLogo2 from '@assets/icons/TOYO-BW_LOGO.png';
import Section from 'components/Section';
import Step from 'components/Step';
import Button from 'components/Button';
import ExternalLink from 'components/ExternalLink';
import SocialButton from 'components/SocialButton';
import QuantityList from 'components/QuantityList';
import NftTokenCrowdsale from 'contracts/NftTokenCrowdsale.json';
import ToyoGovernanceToken from 'contracts/ToyoGovernanceToken.json';
import {
  TOYO_COINMARKETCAP_ID,
  COINMARKETCAP_QUOTE_CURRENCY,
  TYPE_ID,
  MUMBAI_CHAIN_ID,
} from '../constants';

interface MetamaskRPCError {
  code: number;
  message: string;
}

const contracts = {
  nftTokenAddress: '0x68118EDf6d9CCA7960D19f87B94583216ADd12B8',
  nftTokenContractSymbol: 'TOYSB',
  nftTokenCrowdsaleAddress: '0xeAC3AaC0467B16621D0e12C86541e3dd89D3f86d',
  toyoGovernanceToken: '0x292124a29Bb14EA071EfDDB573595a12925be8Be',
};

const year = new Date().getFullYear();

const Home: NextPage = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [initialToyoPrice, setInitialToyoPrice] = useState('0');
  const [selectedQuantity, setSelectedQuantity] = useState('1');
  const [minted, setMinted] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [purchaseCap, setPurchaseCap] = useState(1);
  const [accountConnected, setAccountConnected] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [toyoPrice, setToyoPrice] = useState(0);

  const [loading, setLoading] = useState(false);

  const [isSalePaused, setIsSalePaused] = useState(false);

  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const recaptchaRef = createRef<ReCAPTCHA>();

  const totalPrice = Number(initialToyoPrice) * Number(selectedQuantity);
  const totalToyoInUSD = toyoPrice * totalPrice;
  const formattedTotalToyoInUSD = parseFloat(totalToyoInUSD.toFixed(2));

  const isBtnBlocked = isSalePaused || !buttonEnabled || loading;

  useEffect(() => {
    function isMetamaskInstalled() {
      if (window.ethereum) {
        setIsMetamaskInstalled(true);
      }
    }

    isMetamaskInstalled();
  }, []);

  useEffect(() => {
    async function isAccountConnected() {
      if (window.ethereum?.request) {
        try {
          const account = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (account.length > 0) {
            setAccountConnected(true);
            setAddress(account[0]);

            const w3 = new Web3(window.ethereum);
            setWeb3(w3);

            const abi: AbiItem | any = NftTokenCrowdsale.abi;

            const c = new w3.eth.Contract(
              abi,
              contracts.nftTokenCrowdsaleAddress,
            );

            setContract(c);
          }
        } catch (error) {
          const ethError = error as MetamaskRPCError;

          if (ethError.code === 4001) {
            toast('Please accept the request to continue', {
              hideProgressBar: true,
              autoClose: 3000,
              type: 'error',
            });
          } else {
            toast('An error occurred while connecting to wallet', {
              hideProgressBar: true,
              autoClose: 3000,
              type: 'error',
            });
            console.error(ethError.message);
          }
        }
      }
    }

    isAccountConnected();
  }, []);

  useEffect(() => {
    async function getTOYOPrice() {
      try {
        const response = await fetch('/api/coinmarketcap', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { data } = await response.json();

        const toyoPrice: number =
          data.data[TOYO_COINMARKETCAP_ID].quote[COINMARKETCAP_QUOTE_CURRENCY]
            .price;

        const fixedPrice = parseFloat(toyoPrice.toFixed(2));

        setToyoPrice(fixedPrice);
      } catch (error) {
        const errTyped = error as Error;

        console.error(errTyped?.message);
      }
    }

    getTOYOPrice();
  }, []);

  useEffect(() => {
    checkConnectedNetwork();
  }, []);

  async function getTotalSupply() {
    try {
      const resp = await contract?.methods.getTotalSupply(TYPE_ID).call();
      setMinted(resp);
    } catch (error) {
      console.error(error);
    }
  }

  async function getMaxSupply() {
    try {
      const resp = await contract?.methods.getMaxSupply(TYPE_ID).call();
      setMaxSupply(resp);
    } catch (error) {
      console.error(error);
    }
  }

  async function getPurchaseCap() {
    try {
      const resp = await contract?.methods.getPurchaseCap(TYPE_ID).call();
      setPurchaseCap(resp);
    } catch (error) {
      console.error(error);
    }
  }

  async function refreshTokenRate() {
    try {
      const resp = await contract?.methods.getRate(TYPE_ID).call();
      const etherPrice = web3?.utils.fromWei(resp, 'ether');

      if (etherPrice) {
        setInitialToyoPrice(etherPrice);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getIsSalePaused() {
    try {
      const resp = await contract?.methods.isPaused(TYPE_ID).call();
      setIsSalePaused(resp);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (contract) {
      async function getSupply() {
        await getTotalSupply();
        await getMaxSupply();
        await getPurchaseCap();
        await refreshTokenRate();
        await getIsSalePaused();
      }

      getSupply();
    }
  }, [contract]);

  async function switchNetwork() {
    if (isMetamaskInstalled && window.ethereum.request) {
      window.ethereum
        .request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MUMBAI_CHAIN_ID }],
        })
        .catch((switchError) => {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            addNetwork();
          }
        });
    }
  }

  async function addNetwork() {
    if (isMetamaskInstalled && window.ethereum.request) {
      window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: MUMBAI_CHAIN_ID,
            chainName: 'Polygon Mumbai',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
          },
        ],
      });
    }
  }

  async function checkConnectedNetwork() {
    if (isMetamaskInstalled && window.ethereum.request) {
      try {
        const resp = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Connected to chainId: ' + resp);

        if (resp !== MUMBAI_CHAIN_ID) {
          toast('Wrong network', {
            hideProgressBar: true,
            autoClose: 3000,
            type: 'error',
          });

          await switchNetwork();
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function addToWallet() {
    if (!isMetamaskInstalled) {
      return toast('Please install metamask to continue', {
        hideProgressBar: true,
        autoClose: 3000,
        type: 'error',
      });
    }

    if (window.ethereum?.request) {
      try {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: contracts.nftTokenAddress,
              symbol: contracts.nftTokenContractSymbol,
              decimals: 0,
              image:
                'https://ipfs.io/ipfs/QmUdDyL22m4wbmshvspLBpysfLPUT7r8dXnZ22Zh6F8SQz',
            },
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function connectWallet() {
    if (!isMetamaskInstalled) {
      return toast('Please install metamask to continue', {
        hideProgressBar: true,
        autoClose: 3000,
        type: 'error',
      });
    }

    if (accountConnected) {
      return;
    }

    if (window.ethereum?.request) {
      try {
        const account = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (account.length > 0) {
          setAccountConnected(true);
          setAddress(account[0]);

          const w3 = new Web3(window.ethereum);
          setWeb3(w3);

          const abi: AbiItem | any = NftTokenCrowdsale.abi;

          const c = new w3.eth.Contract(
            abi,
            contracts.nftTokenCrowdsaleAddress,
          );

          setContract(c);
        }

        toast('Wallet Connected!', {
          hideProgressBar: true,
          autoClose: 3000,
          type: 'success',
        });

        await checkConnectedNetwork();
      } catch (error) {
        const ethError = error as MetamaskRPCError;

        if (ethError.code === 4001) {
          toast('Please accept the request to continue', {
            hideProgressBar: true,
            autoClose: 3000,
            type: 'error',
          });
        } else {
          toast('An error occurred while connecting to wallet', {
            hideProgressBar: true,
            autoClose: 3000,
            type: 'error',
          });
          console.error(ethError.message);
        }
      }
    }
  }

  async function approveBuy() {
    if (!accountConnected || !isMetamaskInstalled) {
      toast('Connect wallet!', {
        hideProgressBar: true,
        autoClose: 3000,
        type: 'error',
      });
      return;
    }

    setLoading(true);

    const toyoApproveContractAbi: AbiItem | any = ToyoGovernanceToken.abi;

    const w3 = new Web3(window.ethereum);

    const c = new w3.eth.Contract(
      toyoApproveContractAbi,
      contracts.toyoGovernanceToken,
    );

    const toyopriceBN = web3?.utils.toBN(totalPrice);
    const toweiToyoPrice = web3?.utils.toWei(toyopriceBN as BN, 'ether');

    try {
      await c.methods
        .approve(contracts.nftTokenCrowdsaleAddress, toweiToyoPrice)
        .send({
          from: address,
          gasPrice: 50000000000, // 50 Gwei
        });

      await buyTokens();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  async function buyTokens() {
    if (!accountConnected || !isMetamaskInstalled) {
      toast('Connect wallet!', {
        hideProgressBar: true,
        autoClose: 3000,
        type: 'error',
      });
      return;
    }

    const quantity = web3?.utils.toBN(selectedQuantity);
    const typeIDBN = web3?.utils.toBN(TYPE_ID);

    try {
      await contract?.methods.buyTokens(address, typeIDBN, quantity).send({
        from: address,
        value: 0,
        gasPrice: 50000000000, // 75 Gwei
      });

      toast('Tokens minted, check your wallet!', {
        hideProgressBar: true,
        autoClose: 3000,
        type: 'success',
      });

      setButtonEnabled(false);
      recaptchaRef.current?.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function onReCAPTCHAChange(captchaCode: string | null) {
    if (!captchaCode) {
      return;
    }

    try {
      const response = await fetch('/api/google', {
        method: 'POST',
        body: JSON.stringify({ captcha: captchaCode }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setButtonEnabled(true);
      } else {
        console.log('CAPTCHA not ok', response.json());
      }
    } catch (error) {
      const errTyped = error as Error;

      alert(errTyped?.message || 'Something went wrong');
    }
  }

  return (
    <div className="overflow-hidden">
      <Head>
        <title>Toyo - Next-Gen Action Figures NFT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Section bg="bg-section-one">
        <div className="relative w-full xl:h-104 h-96">
          <Image
            src={ToyoLogo}
            alt="Toyo logo."
            className="object-contain"
            sizes="100vw"
            layout="fill"
          />
        </div>
        <div className="relative w-full h-80 3xl:-mt-0 -mt-20">
          <Image
            src={XeonLogo}
            alt="Xeon-1 collection."
            className="object-contain"
            sizes="100vw"
            layout="fill"
          />
        </div>
      </Section>
      <Section bg="bg-main">
        <div className="py-32">
          <h1 className="font-bold text-center text-7xl text-white font-saira">
            Minting Steps
          </h1>
        </div>
        <div className="flex flex-col lg:flex-row">
          <Step
            title={'Step 1'}
            text={
              'Select Polygon/Matic Network in your Metamask, then click the "LOG IN WITH METAMASK" button.'
            }
          />
          <Step
            title={'Step 2'}
            text={
              'To enable the mint buttons, confirm that you are not a robot by clicking the reCAPTCHA checkbox.'
            }
          />
          <Step
            title={'Step 3'}
            text={
              'Select the quantity and click "MINT NOW" below the box you want to mint into your wallet. Limit of 9 boxes per transaction.'
            }
          />
          <Step
            title={'Step 4'}
            text={
              'To mint the boxes, you must wait 33 seconds cooldown and re-check the reCAPTCHA.'
            }
          />
        </div>
        <div className="flex justify-center items-center py-32">
          <Button
            bg={accountConnected ? 'metamask-connected' : 'metamask-login'}
            onClick={connectWallet}
          />
        </div>
      </Section>
      <Section bg="bg-main">
        <div className="flex flex-col">
          <div className="relative w-full h-96">
            <Image
              src={XeonBox}
              layout="fill"
              alt="Xeon box."
              objectFit="contain"
              priority
            />
          </div>
          <div>
            <h1 className="font-bold text-center text-4xl text-white font-saira">
              Xeon-1 Box
            </h1>
            <p className="text-center text-white font-barlow">
              {minted || '-'} minted / {maxSupply || '-'} max supply
            </p>
          </div>
          <div className="flex flex-row items-center justify-between mt-4 mx-8">
            <div className="flex flex-row justify-center items-center ml-4">
              <div className="relative w-7 h-7 mr-2">
                <Image
                  src={ToyoTokenIcon}
                  layout="fill"
                  alt="Toyo token icon."
                  objectFit="contain"
                  priority
                />
              </div>
              <p className="text-yellow-400 text-3xl font-barlow">
                {totalPrice || '-'}
              </p>
            </div>
            <div className="flex items-center">
              <p className="text-center text-white text-xl pt-2 font-barlow">
                U$ {formattedTotalToyoInUSD || '-'}
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between mt-4 mx-8">
            <div className="flex items-center">
              <p className="text-white text-2xl ml-2 font-barlow">Quantity:</p>
            </div>
            <QuantityList
              quantity={purchaseCap}
              setSelectedQuantity={setSelectedQuantity}
            />
          </div>
          <div className="flex flex-row justify-center">
            <button
              disabled={isBtnBlocked}
              className="relative w-64 h-28"
              onClick={approveBuy}
            >
              <Image
                src={!isBtnBlocked ? MintNowButton : MintNowButtonDisabled}
                layout="fill"
                alt="Mint now button."
                objectFit="contain"
                priority
              />
            </button>
          </div>
          <div className="flex flex-row justify-center mb-4">
            <ReCAPTCHA
              ref={recaptchaRef}
              size="normal"
              sitekey={'6Ld-1C0iAAAAAAlvcKgLOG4dWUsWvJ6rQxsK6vaW'}
              onChange={onReCAPTCHAChange}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row justify-between">
              <p className="text-white font-barlow">Common Edition</p>
              <p className="text-white font-barlow">52%</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-uncommon font-barlow">Uncommon Edition</p>
              <p className="text-uncommon font-barlow">32%</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-rare font-barlow">Rare Edition</p>
              <p className="text-rare font-barlow">10%</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-limited font-barlow">Limited Edition</p>
              <p className="text-limited font-barlow">4%</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-collectors font-barlow">Collectors Edition</p>
              <p className="text-collectors font-barlow">1.5%</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-prototype font-barlow">Prototype Edition</p>
              <p className="text-prototype font-barlow">0.5%</p>
            </div>
          </div>
        </div>
      </Section>
      <Section bg="bg-main">
        <div className="flex py-12 mt-16">
          <h1 className="font-bold text-center text-7xl text-white font-saira">
            Xeon-1 / Pier-0 Toyos
          </h1>
        </div>
        <div className="relative w-full h-[628px]">
          <Image
            src={XeonToyoList}
            layout="fill"
            alt="Xeon toyo list."
            objectFit="contain"
            priority
          />
        </div>
      </Section>
      <Section bg="bg-main">
        <div className="flex py-32">
          <h1 className="font-bold text-center text-7xl text-white font-saira">
            Unboxing Event
          </h1>
        </div>
        <div className="flex flex-col">
          <p className="mb-8 text-justified text-white font-barlow">
            Scientists and engineers have worked on this page as a portal that
            links our simulation (yes, we live in a simulation!) to the Toyo
            Parallel Metaverse. As of now, no one knows how to open the boxes
            yet, since they were sealed using an unknown technology.
          </p>
          <p className="mb-8 text-justified text-white font-barlow">
            We put a team of archaeologists, anthropologists, and IT nerds to
            figure out how to open those boxes and reveal which Toyo is inside
            each of these. Deadlines were given to the team and they confirmed
            it'll be in 2022, exact date TBA.
          </p>
          <p className="mb-8 text-justified text-white font-barlow">
            As soon as they figure it out, we will launch an Unboxing Event and
            you will finally get to meet your Toyo(s).
          </p>
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center py-32">
          <a
            target="_blank"
            href="https://link.medium.com/LWJPEI1LAtb"
            rel="noopener noreferrer"
            className="relative w-60 lg:h-40 h-28 mx-12"
          >
            <Image
              src={LearnMoreButton}
              layout="fill"
              alt="Learn more button."
              objectFit="contain"
              priority
            />
          </a>
          <a
            target="_blank"
            href="https://opensea.io/collection/toyo-first-9-new"
            rel="noopener noreferrer"
            className="relative lg:w-80 w-60 lg:h-40 h-28 mx-12"
          >
            <Image
              src={OpenSeaButton}
              layout="fill"
              alt="OpenSea button."
              objectFit="contain"
              priority
            />
          </a>
        </div>
      </Section>
      <footer className="flex flex-col items-center justify-center bg-main bg-cover bg-center min-w-full lg:h-80 h-104 3xl:px-96 lg:px-24 px-12">
        <div className="flex flex-col lg:flex-row items-center justify-between min-w-full">
          <div className="flex flex-row">
            <div className="relative w-40 h-40">
              <Image
                src={ToyoLogo2}
                layout="fill"
                alt="Second toyo logo."
                objectFit="contain"
                priority
              />
            </div>
            <div className="flex flex-col m-4">
              <a href="#home" className="text-white font-barlow">
                Home
              </a>
              <ExternalLink
                link="https://whitepaper.toyoverse.com/"
                text="Toyo Whitepaper"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-row">
              <SocialButton bg="discord" link="https://discord.gg/RwegM2w6zv" />
              <SocialButton bg="telegram" link="https://t.me/toyoverse" />
              <SocialButton bg="twitter" link="https://twitter.com/ToyoVerse" />
              <SocialButton bg="medium" link="https://medium.com/@toyoverse" />
              <SocialButton
                bg="youtube"
                link="https://www.youtube.com/channel/UCKwCI_rs6JyzmMn6TYNVnsA"
              />
              <SocialButton
                bg="instagram"
                link="https://www.instagram.com/toyoverse/"
              />
            </div>
            <div className="flex flex-row mt-12">
              <div className="relative w-28 h-8 mr-4">
                <Image
                  src={PolygonIcon}
                  layout="fill"
                  alt="Polygon icon."
                  objectFit="contain"
                  priority
                />
              </div>
              <div className="relative w-28 h-8">
                <Image
                  src={MetamaskIcon}
                  layout="fill"
                  alt="Metamask icon."
                  objectFit="contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex mt-16">
          <p className="text-white text-center font-barlow relative">
            Copyright © {year} Lucid Dreams. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
