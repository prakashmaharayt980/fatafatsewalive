import type { ReactNode } from 'react';

interface HomePageProps {
  mainBannerSection?: ReactNode;
  sectionOne?: ReactNode;
  sectionTwo?: ReactNode;
  offerSection?: ReactNode;
  ourArticlesSection?: ReactNode;
  basketSection1?: ReactNode;
  basketSection2?: ReactNode;
  basketSection3?: ReactNode;
  basketSection4?: ReactNode;
}

export default function HomePage({
  mainBannerSection,
  sectionOne,
  sectionTwo,
  offerSection,
  ourArticlesSection,
  basketSection1,
  basketSection2,
  basketSection3,
  basketSection4,
}: HomePageProps) {
  return (
    <main className="mx-auto min-h-screen bg-[#f8f9fa] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[80px] mix-blend-multiply opacity-70" />
        <div className="absolute top-[300px] right-[-10%] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[60px] mix-blend-multiply opacity-70" />
      </div>

      <div className="relative z-10 sm:px-2">
        {mainBannerSection}
        {sectionOne}
        {basketSection1}
        {basketSection2}

        {offerSection && (
          <div className="mx-[-8px] sm:mx-0">{offerSection}</div>
        )}

        <div className="md:px-2">
          {basketSection3}
          {sectionTwo}
          {basketSection4}
          {ourArticlesSection}
        </div>
      </div>
    </main>
  );
}
