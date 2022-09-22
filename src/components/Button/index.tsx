import { useCallback } from 'react';
import Image from 'next/image';
import ButtonMetamask from '@assets/buttons/but4.png';
import ButtonAddToyo from '@assets/buttons/but3.png';
import { ButtonProps } from './types';

function Button({ onClick, bg }: ButtonProps) {
  const onClickBtn = useCallback(() => {
    onClick();
  }, [onClick]);

  function renderImage() {
    switch (bg) {
      case 'metamask':
        return <Image src={ButtonMetamask} layout="fill" alt="Section one" objectFit="contain" priority />;
      case 'add-toyo':
        return <Image src={ButtonAddToyo} layout="fill" alt="Section one" objectFit="contain" priority />;
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
