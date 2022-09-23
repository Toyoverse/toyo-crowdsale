type ButtonTypes = 'metamask-login' | 'metamask-connected' | 'add-toyo';

export type ButtonProps = {
  onClick: () => void;
  bg: ButtonTypes;
};
