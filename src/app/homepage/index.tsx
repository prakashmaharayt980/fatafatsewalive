'use client';

import Imgbanner from './Imgbanner';




interface HomePageProps {
  mainBannerData: any;
  sideBannerData: any;

  sectionOne: React.ReactNode;
  offerSection: React.ReactNode;
  sectionTwo: React.ReactNode;
  sectionThree: React.ReactNode;
  sectionFour: React.ReactNode;
  basketSection0: React.ReactNode;
  basketSection1: React.ReactNode;
  basketSection2: React.ReactNode;
  basketSection3: React.ReactNode;
  basketSection4: React.ReactNode;
  basketSection5: React.ReactNode;
  ourArticlesSection: React.ReactNode;
}

const HomePage = ({
  mainBannerData,
  sideBannerData,
  
  sectionOne,
  offerSection,
  sectionTwo,
  sectionThree,
  sectionFour,
  basketSection0,
  basketSection1,
  basketSection2,
  basketSection3,
  basketSection4,
  basketSection5,
  ourArticlesSection,
}: HomePageProps) => {


  return (
    <main className="mx-auto h-full m-0 p-0 sm:py-1 space-y-1  bg-[#f8f9fa] relative overflow-hidden">
      <h1 className="sr-only">Fatafat Sewa - Online Shopping in Nepal</h1>

      {/* Woodmart-Inspired Texture: Subtle Background Orbs */}
      <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute top-[300px] right-[-10%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute top-[800px] left-[20%] w-[700px] h-[700px] bg-indigo-50/50 rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10">
        <div className="sm:px-2 ">
          <Imgbanner
            mainBanner={mainBannerData}
            sideBanner={sideBannerData}
          />

          {basketSection0}

          {sectionOne}

          {basketSection1}

          {basketSection2}
        </div>
        {offerSection}
        <div className="sm:px-2 md:px-4">
          {basketSection3}

          {sectionTwo}

          {basketSection4}

          {sectionThree}

          {basketSection5}

          {sectionFour}

          {ourArticlesSection}

        </div>
      </div>
    </main>
  );
};

export default HomePage;