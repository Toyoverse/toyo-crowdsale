type ButtonTypes =
  | 'discord'
  | 'telegram'
  | 'twitter'
  | 'medium'
  | 'youtube'
  | 'instagram';

export type SocialButtonProps = {
  link: string;
  bg: ButtonTypes;
};
