import { useState } from 'react'
// Next
import Head from 'next/head'
import Image from 'next/image'
// Icons

// Bitcrush UI
import PageContainer from 'components/PageContainer'

const NiceSale = () => {
  const [fillPercent, setFillPercent] = useState<number>(50);

  const fillClass ="w-["+fillPercent+"%]"
  return <>
    <Head>
      <title>$NICE Presale</title>
      <meta name="description" content="Sale for $NICE, the currency of the upcoming Invaderverse. Stay tuned for more details"/>
      <meta name="author" content="Bitcrush"/>
    </Head>
    <PageContainer background='galactic'>
      <div className="flex items-center justify-center px-2">
        <div className="flex-grow border-2 border-secondary rounded-[32px] p-5 bg-paper-bg inner-glow-secondary max-w-[450px] text-white">
          <h2 className="text-right font-bold text-xl font-zeb tracking-widest">
            NICE Presale
          </h2>
          <div className="flex flex-row items-center">
            <Image src={"/assets/glowy.png"} width={75} height={75}/>
            <p className="pl-3 flex-grow text-justify text-sm">
              $NICE is the official currency of the Invaderverse.
            </p>
          </div>
          <div className="px-1 py-2 w-full">
            <div className="relative h-6 w-full overflow-hidden rounded-full">
              <h3 className='absolute text-center z-10 w-full'>
                {fillPercent}%
              </h3>
              <div className="absolute top-0 left-0 bg-[#00000080] h-6 w-full rounded-full"/>
              <div className={"absolute top-0 left-0 bg-primary h-6 "+fillClass}/>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  </>
}

export default NiceSale