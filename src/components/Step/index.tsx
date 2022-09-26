import { StepProps } from './types';

function Step({ title, text }: StepProps) {
  return (
    <div className="flex flex-col lg:px-8 lg:mb-0 mb-12">
      <h5 className="font-bold text-center text-2xl text-white font-saira">
        {title}
      </h5>
      <p className="text-center text-white pt-4 font-barlow">{text}</p>
    </div>
  );
}

export default Step;
