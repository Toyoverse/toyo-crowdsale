import { SectionProps } from './types';

function Section({ children, bg }: SectionProps) {
  const justifyContent = bg === 'bg-section-one' ? 'justify-start' : 'justify-center';

  return (
    <section
      className={`flex flex-col items-center ${justifyContent} min-h-screen ${bg} bg-cover bg-center lg:px-36 sm:px-24 px-12`}
    >
      {children}
    </section>
  );
}

export default Section;