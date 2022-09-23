import type { NextPage } from 'next';
import { useMetamask, useDisconnect } from '@thirdweb-dev/react';
import { toast } from 'react-toastify';
import Head from 'next/head';
import Image from 'next/image';
import BackgroundImage2 from '@assets/Site_Background.png';
import ToyoLogo from '@assets/toyo_logo---Copia.png';
import XeonLogo from '@assets/Titlestop_bottom-2.png';
import XeonBox from '@assets/Xeon-Pier-0-Closed-2048.png';
import MaticIcon from '@assets/buttons/matic_icon_1matic_icon.png';
import MintNowButton from '@assets/buttons/mint_btt.png';
import XeonToyoList from '@assets/HORIZONTAL_RARITY-RULE2022.png';
import LearnMoreButton from '@assets/buttons/learn_more.png';
import OpenSeaButton from '@assets/buttons/opensea.png';
import DiscordIcon from '@assets/icons/discord.png';
import TelegranIcon from '@assets/icons/telegram.png';
import TwitterIcon from '@assets/icons/twitter.png';
import MediumIcon from '@assets/icons/medium.png';
import YouTubeIcon from '@assets/icons/youtube.png';
import InstagramIcon from '@assets/icons/insta.png';
import PolygonIcon from '@assets/icons/polygon_w.png';
import MetamaskIcon from '@assets/icons/metamask_w.png';
import ToyoLogo2 from '@assets/icons/TOYO-BW_LOGO.png';
import Section from 'components/Section';
import Step from 'components/Step';
import Button from 'components/Button';
import { useEffect, useState } from 'react';

const Home: NextPage = () => {
  const [accountConnected, setAccountConnected] = useState(false);
  const connectWithMetamask = useMetamask();
  const disconnect = useDisconnect();

  function goToPage() {
    console.log('Button clicked');
  }

  useEffect(() => {
    async function checkAccounts() {
      const resp = await window?.ethereum?.request({ method: 'eth_accounts' });

      if (resp.length > 0) {
        setAccountConnected(true);
        toast('Wallet Connected!', { hideProgressBar: true, autoClose: 3000, type: 'success' });
      }
    }

    checkAccounts();
  }, []);

  async function connectMetamask() {
    await connectWithMetamask();
    setAccountConnected(true);
    toast('Wallet Connected!', { hideProgressBar: true, autoClose: 2000, type: 'success' });
  }

  async function disconnectMetamask() {
    await disconnect();
    setAccountConnected(false);
    toast('Wallet Disconnected!', { hideProgressBar: true, autoClose: 2000, type: 'success' });
  }

  const year = new Date().getFullYear();

  return (
    <div className="overflow-hidden">
      <Head>
        <title>Toyo - Next-Gen Action Figures NFT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Section bg="bg-section-one">
        <div className="relative w-128 xl:h-104 h-96">
          <Image src={ToyoLogo} alt="Section one" className="object-contain" sizes="100vw" layout="fill" />
        </div>
        <div className="relative w-[1200px] h-80 2xl:-mt-0 lg:-mt-32 -mt-20">
          <Image src={XeonLogo} alt="Section one" className="object-contain" sizes="100vw" layout="fill" />
        </div>
      </Section>
      <Section bg="bg-main">
        <div className="py-32">
          <h1 className="font-bold text-center text-7xl text-white font-saira">Minting Steps</h1>
        </div>
        <div className="flex flex-row">
          <Step
            title={'Step 1'}
            text={'Select Polygon/Matic Network in your Metamask, then click the "LOG IN WITH METAMASK" button.'}
          />
          <Step
            title={'Step 2'}
            text={'To enable the mint buttons, confirm that you are not a robot by clicking the reCAPTCHA checkbox.'}
          />
          <Step
            title={'Step 3'}
            text={
              'Select the quantity and click "MINT NOW" below the box you want to mint into your wallet. Limit of 3 boxes per transaction.'
            }
          />
          <Step
            title={'Step 4'}
            text={'To mint the boxes, you must wait 33 seconds cooldown and re-check the reCAPTCHA.'}
          />
        </div>
        <div className="flex py-32">
          {accountConnected ? (
            <Button bg={'metamask-connected'} onClick={() => disconnectMetamask()} />
          ) : (
            <Button bg={'metamask-login'} onClick={() => connectMetamask()} />
          )}
          <Button bg="add-toyo" onClick={() => console.log('Faça algo')} />
        </div>
      </Section>
      <Section bg="bg-main">
        <div className="flex flex-col mb-24">
          <div className="relative w-96 h-96">
            <Image src={XeonBox} layout="fill" alt="Section one" objectFit="contain" priority />
          </div>
          <div className="mt-4">
            <h1 className="font-bold text-center text-4xl text-white font-saira">Xeon-1 Box</h1>
            <p className="text-center text-white font-barlow">000 minted / 0000 max supply</p>
          </div>
          <div className="flex flex-row items-center justify-between mt-4 mx-16">
            <div className="flex items-center ml-4">
              <div className="relative w-7 h-7">
                <Image src={MaticIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
              <p className="text-blue-400 text-4xl font-barlow">110</p>
            </div>
            <div className="flex items-center">
              <p className="text-center text-white text-xl pt-2 font-barlow">-U$158</p>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between mt-4 mx-16">
            <div className="flex items-center">
              <p className="text-white text-2xl ml-2 font-barlow">Quantity:</p>
            </div>
            <div className="flex">
              <select className="block w-14 p-2 font-barlow text-lg bg-transparent border bg-gray-700 border-gray-400 text-white">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
          <div className="flex flex-row justify-center">
            <button className="relative w-64 h-28" onClick={goToPage}>
              <Image src={MintNowButton} layout="fill" alt="Section one" objectFit="contain" priority />
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
          <h1 className="font-bold text-center text-7xl text-white font-saira">Xeon-1 / Pier-0 Toyos</h1>
        </div>
        <div className="relative w-full h-[628px]">
          <Image src={XeonToyoList} layout="fill" alt="Section one" objectFit="contain" priority />
        </div>
      </Section>
      <Section bg="bg-main">
        <div className="flex py-32">
          <h1 className="font-bold text-center text-7xl text-white font-saira">Unboxing Event</h1>
        </div>
        <div className="flex flex-col">
          <p className="mb-8 text-justified text-white font-barlow">
            Scientists and engineers have worked on this page as a portal that links our simulation (yes, we live in a
            simulation!) to the Toyo Parallel Metaverse. As of now, no one knows how to open the boxes yet, since they
            were sealed using an unknown technology.
          </p>
          <p className="mb-8 text-justified text-white font-barlow">
            We put a team of archaeologists, anthropologists, and IT nerds to figure out how to open those boxes and
            reveal which Toyo is inside each of these. Deadlines were given to the team and they confirmed it'll be in
            2022, exact date TBA.
          </p>
          <p className="mb-8 text-justified text-white font-barlow">
            As soon as they figure it out, we will launch an Unboxing Event and you will finally get to meet your
            Toyo(s).
          </p>
        </div>
        <div className="flex py-32">
          <button className="relative w-60 h-40 mx-12" onClick={goToPage}>
            <Image src={LearnMoreButton} layout="fill" alt="Section one" objectFit="contain" priority />
          </button>
          <button className="relative w-80 h-40 mx-12" onClick={goToPage}>
            <Image src={OpenSeaButton} layout="fill" alt="Section one" objectFit="contain" priority />
          </button>
        </div>
      </Section>
      <footer className="flex flex-col items-center justify-start relative min-w-full h-80 2xl:px-96 lg:px-40 px-24">
        <Image src={BackgroundImage2} layout="fill" alt="Section one" objectFit="cover" priority />
        <div className="flex flex-row flex-1 items-center justify-between min-w-full">
          <div className="flex flex-row">
            <div className="relative w-40 h-40">
              <Image src={ToyoLogo2} layout="fill" alt="Section one" objectFit="contain" priority />
            </div>
            <div className="relative ml-4 mt-4">
              <p className="text-white font-barlow">Home</p>
              <p className="text-white font-barlow">Toyo Whitepaper</p>
              <p className="text-white font-barlow">Xeon-1 Drop Article</p>
              <p className="text-white font-barlow">Our Team</p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="relative w-8 h-8 mr-2">
                <Image src={DiscordIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
              <div className="relative w-8 h-8 mr-2">
                <Image src={TelegranIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
              <div className="relative w-8 h-8 mr-2">
                <Image src={TwitterIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
              <div className="relative w-8 h-8 mr-2">
                <Image src={MediumIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
              <div className="relative w-8 h-8 mr-2">
                <Image src={YouTubeIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
              <div className="relative w-8 h-8 mr-2">
                <Image src={InstagramIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
            </div>
            <div className="flex flex-row mt-12">
              <div className="relative w-28 h-8 mr-8">
                <Image src={PolygonIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
              <div className="relative w-28 h-8">
                <Image src={MetamaskIcon} layout="fill" alt="Section one" objectFit="contain" priority />
              </div>
            </div>
          </div>
        </div>
        <div className="flex mb-16">
          <p className="text-white font-barlow relative">Copyright {year} Lucid Dreams. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
