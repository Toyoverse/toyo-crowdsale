import { useCallback } from 'react';
import Image from 'next/image';
import ButtonMetamaskLogin from '@assets/buttons/but1.png';
import ButtonMetamaskConnected from '@assets/buttons/but4.png';
import ButtonAddToyo from '@assets/buttons/but3.png';
import { ButtonProps } from './types';

function Button({ onClick, bg }: ButtonProps) {
  const onClickBtn = useCallback(() => {
    onClick();
  }, [onClick]);

  function renderImage() {
    switch (bg) {
      case 'metamask-login':
        return (
          <Image
            src={ButtonMetamaskLogin}
            layout="fill"
            alt="Metamask login button."
            objectFit="contain"
            priority
          />
        );
      case 'metamask-connected':
        return (
          <Image
            src={ButtonMetamaskConnected}
            layout="fill"
            alt="Metamask connected button."
            objectFit="contain"
            priority
          />
        );
      case 'add-toyo':
        return (
          <Image
            src={ButtonAddToyo}
            layout="fill"
            alt="Add toyo button."
            objectFit="contain"
            priority
          />
        );
      default:
        break;
    }
  }

  return (
    <button className="relative w-60 h-40 mx-12" onClick={onClickBtn}>
      {renderImage()}
    </button>
  );
}

export default Button;
