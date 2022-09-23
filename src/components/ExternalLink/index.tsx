import { ExternalLinkProps } from './types';

function ExternalLink({ link, text }: ExternalLinkProps) {
  return (
    <a target="_blank" href={link} rel="noopener noreferrer" className="text-white font-barlow">
      {text}
    </a>
  );
}

export default ExternalLink;
