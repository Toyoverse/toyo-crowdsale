import Image from 'next/image';
import DiscordIcon from '@assets/icons/discord.png';
import TelegramIcon from '@assets/icons/telegram.png';
import TwitterIcon from '@assets/icons/twitter.png';
import MediumIcon from '@assets/icons/medium.png';
import YouTubeIcon from '@assets/icons/youtube.png';
import InstagramIcon from '@assets/icons/insta.png';
import { SocialButtonProps } from './types';

function SocialButton({ link, bg }: SocialButtonProps) {
  function renderImage() {
    switch (bg) {
      case 'discord':
        return (
          <Image
            src={DiscordIcon}
            layout="fill"
            alt="Discord icon."
            objectFit="contain"
            priority
          />
        );
      case 'telegram':
        return (
          <Image
            src={TelegramIcon}
            layout="fill"
            alt="Telegram icon."
            objectFit="contain"
            priority
          />
        );
      case 'twitter':
        return (
          <Image
            src={TwitterIcon}
            layout="fill"
            alt="Twitter icon."
            objectFit="contain"
            priority
          />
        );
      case 'medium':
        return (
          <Image
            src={MediumIcon}
            layout="fill"
            alt="Medium icon."
            objectFit="contain"
            priority
          />
        );
      case 'youtube':
        return (
          <Image
            src={YouTubeIcon}
            layout="fill"
            alt="Youtube icon."
            objectFit="contain"
            priority
          />
        );
      case 'instagram':
        return (
          <Image
            src={InstagramIcon}
            layout="fill"
            alt="Instagram icon."
            objectFit="contain"
            priority
          />
        );
      default:
        break;
    }
  }

  return (
    <a
      target="_blank"
      href={link}
      rel="noopener noreferrer"
      className="relative w-8 h-8 mx-2"
    >
      {renderImage()}
    </a>
  );
}

export default SocialButton;
