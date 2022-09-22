type ButtonTypes = 'metamask' | 'add-toyo';

export type ButtonProps = {
  onClick: () => void;
  bg: ButtonTypes;
};
