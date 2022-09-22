import React from 'react';

type BgTypes = 'bg-section-one' | 'bg-main';

export type SectionProps = {
  children: React.ReactNode;
  bg: BgTypes;
};
