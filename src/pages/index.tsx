import type { NextPage } from 'next';
import BN from 'bn.js';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Head from 'next/head';
import Image from 'next/image';
import ToyoLogo from '@assets/toyo_logo---Copia.png';
import XeonLogo from '@assets/TITLESTOP_BOTTOM-2.png';
import XeonBox from '@assets/Xeon-Pier-0-Closed-2048.png';
import ToyoTokenIcon from '@assets/icons/toyo_token_icon.png';
import MintNowButton from '@assets/buttons/mint_btt.png';
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

const TYPE_ID = '16';
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

  const totalPrice = Number(initialToyoPrice) * Number(selectedQuantity);

  useEffect(() => {
    async function isMetamaskInstalled() {
      if (window.ethereum?.request) {
        const resp = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (resp.length > 0) {
          setAccountConnected(true);
          setAddress(resp[0]);

          const w3 = new Web3(window.ethereum);
          setWeb3(w3);

          const abi: AbiItem | any = NftTokenCrowdsale.abi;

          const c = new w3.eth.Contract(
            abi,
            contracts.nftTokenCrowdsaleAddress,
          );

          setContract(c);
        }
      }
    }

    isMetamaskInstalled();
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

  useEffect(() => {
    if (contract) {
      async function getSupply() {
        await getTotalSupply();
        await getMaxSupply();
        await getPurchaseCap();
        await refreshTokenRate();
      }

      getSupply();
    }
  }, [contract]);

  useEffect(() => {
    async function getConnectedNetwork() {
      if (window.ethereum.request) {
        try {
          const resp = await window.ethereum.request({ method: 'eth_chainId' });
          console.log('Connected to chainId: ' + resp);
        } catch (error) {
          console.error(error);
        }
      }
    }

    getConnectedNetwork();
  }, []);

  async function addToWallet() {
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
    if (window.ethereum?.request) {
      try {
        const account = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccountConnected(true);
        setAddress(account.toString());
        toast('Wallet Connected!', {
          hideProgressBar: true,
          autoClose: 3000,
          type: 'success',
        });
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

  async function disconnectMetamask() {
    console.log('Log');
  }

  async function approveBuy() {
    if (window.ethereum) {
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
          });

        await buyTokens();
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function buyTokens() {
    if (!accountConnected) {
      toast('Connect wallet!', {
        hideProgressBar: true,
        autoClose: 3000,
        type: 'error',
      });
      return;
    }

    // TODO verify if Network is correct

    // TODO verify if buy is in cooldown

    // TODO implements reCAPTCHA

    const quantity = web3?.utils.toBN(selectedQuantity);
    const typeIDBN = web3?.utils.toBN(TYPE_ID);

    try {
      await contract?.methods.buyTokens(address, typeIDBN, quantity).send({
        from: address,
        value: 0,
      });

      toast('Tokens minted, check your wallet!', {
        hideProgressBar: true,
        autoClose: 3000,
        type: 'success',
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="overflow-hidden">
      <Head>
        <title>Toyo - Next-Gen Action Figures NFT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Section bg="bg-section-one">
        <div className="relative w-128 xl:h-104 h-96">
          <Image
            src={ToyoLogo}
            alt="Toyo logo."
            className="object-contain"
            sizes="100vw"
            layout="fill"
          />
        </div>
        <div className="relative w-[1200px] h-80 -mt-20">
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
        <div className="flex flex-row">
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
              'Select the quantity and click "MINT NOW" below the box you want to mint into your wallet. Limit of 3 boxes per transaction.'
            }
          />
          <Step
            title={'Step 4'}
            text={
              'To mint the boxes, you must wait 33 seconds cooldown and re-check the reCAPTCHA.'
            }
          />
        </div>
        <div className="flex py-32">
          {accountConnected ? (
            <Button
              bg={'metamask-connected'}
              onClick={() => disconnectMetamask()}
            />
          ) : (
            <Button bg={'metamask-login'} onClick={() => connectWallet()} />
          )}
          <Button bg="add-toyo" onClick={() => addToWallet()} />
        </div>
      </Section>
      <Section bg="bg-main">
        <div className="flex flex-col">
          <div className="relative w-96 h-96">
            <Image
              src={XeonBox}
              layout="fill"
              alt="Xeon box."
              objectFit="contain"
              priority
            />
          </div>
          <div className="mt-4">
            <h1 className="font-bold text-center text-4xl text-white font-saira">
              Xeon-1 Box
            </h1>
            <p className="text-center text-white font-barlow">
              {minted} minted / {maxSupply} max supply
            </p>
          </div>
          <div className="flex flex-row items-center justify-between mt-4 mx-16">
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
                {totalPrice}
              </p>
            </div>
            <div className="flex items-center">
              <p className="text-center text-white text-xl pt-2 font-barlow">
                -U$158
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between mt-4 mx-16">
            <div className="flex items-center">
              <p className="text-white text-2xl ml-2 font-barlow">Quantity:</p>
            </div>
            <QuantityList
              quantity={purchaseCap}
              setSelectedQuantity={setSelectedQuantity}
            />
          </div>
          <div className="flex flex-row justify-center">
            <button className="relative w-64 h-28" onClick={approveBuy}>
              <Image
                src={MintNowButton}
                layout="fill"
                alt="Mint now button."
                objectFit="contain"
                priority
              />
            </button>
          </div>
          <div className="flex flex-col mx-16">
            <div className="flex flex-row justify-between">
              <p className="text-white font-barlow">Common Edition</p>
              <p className="text-white font-barlow">50%</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-uncommon font-barlow">Uncommon Edition</p>
              <p className="text-uncommon font-barlow">34%</p>
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
        <div className="flex py-12">
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
        <div className="flex py-32">
          <a
            target="_blank"
            href="https://link.medium.com/LWJPEI1LAtb"
            rel="noopener noreferrer"
            className="relative w-60 h-40 mx-12"
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
            className="relative w-60 h-40 mx-12"
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
      <footer className="flex flex-col items-center justify-start bg-main bg-cover min-w-full h-80 px-24 lg:px-40 3xl:px-96">
        <div className="flex flex-row flex-1 items-center justify-between min-w-full">
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
              <ExternalLink
                link="https://www.google.com"
                text="Xeon-1 Drop Article"
              />
              <ExternalLink link="https://www.google.com" text="Our Team" />
            </div>
          </div>
          <div className="flex flex-col">
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
        <div className="flex mb-16">
          <p className="text-white font-barlow relative">
            Copyright © {year} Lucid Dreams. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
