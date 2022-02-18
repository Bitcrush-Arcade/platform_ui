import { useState, useCallback } from 'react'
// Bitcrush UI
// Hooks
import { useAuthContext } from 'hooks/contextHooks'
// Props
type BridgeCardProps = {
  account: string;
  amount: number;
  walletBalance: number;
}

const BridgeCard = (props: BridgeCardProps) => {

  const { amount, walletBalance } = props

  const { login, account, chainId } = useAuthContext()
  const [selectedToken, setSelectedToken] = useState<boolean>(false)

  
  const tokenToggle= useCallback(() => {
    setSelectedToken( p => !p)
  },[setSelectedToken])
  
  return <div className="flex flex-col gap-10 border-2 border-secondary inner-glow-secondary bg-paper-bg px-10 pt-7 pb-10 rounded-[32px] max-w-[500px]">

          <div className="grid grid-col grid-cols-5 grid-rows-2 justify-items-center items-center">
          <h2 className="text-primary col-start-1 col-span-5 self-center">
              Select chains
          </h2>
            <div className="col-start-1 col-span-2 grid justify-items-center">
              <h2 className="text-s">
              FROM 
              </h2>
              <ChainSelector/>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 col-start-3 col-span-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="col-start-4 col-span-2 grid justify-items-center">
              <h2 className="text-s">
                TO 
              </h2>
              <ChainSelector/> 
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">

            <h2 className="text-primary">
              Select token
            </h2>

            {
              selectedToken
                ?

                <div className="grid grid-cols-3 justify-items-stretch items-center gap-2">
                  <h2 className="justify-self-end text-s">
                    NICE
                  </h2>
                  <button onClick={tokenToggle} className="justify-self-center flex flex-row border-2 border-primary rounded-[32px] w-20 p-1 ">
                    <div className="flex flex-row border-4 border-primary bg-primary rounded-[32px] basis-1/2 px-2 h-6 w-10"/>
                  </button>
                  <h2 className='text-xs text-slate-500'>
                    CRUSH
                  </h2>
                </div>
                :
                <div className="grid grid-cols-3 justify-items-stretch items-center gap-2">
                  <h2 className="text-xs justify-self-end text-slate-500">
                    NICE
                  </h2>
                  <button onClick={tokenToggle} className="justify-self-center flex flex-row justify-end border-2 border-primary rounded-[32px] w-20 p-1">
                    <div className="basis-1/2 flex flex-row border-4 border-primary bg-primary rounded-[32px] px-2 h-6 w-10"/>
                  </button>
                  <h2 className="text-s">
                    CRUSH
                  </h2>
                </div>
            }

            <div>
              <h2 className="text-xs text-primary">
                Amount to bridge
              </h2>
              <input
                type="number"
                className="
                  form-control
                  block
                  w-full
                  px-3
                  py-1.5
                  text-base
                  font-normal
                  text-white
                  bg-paper-bg bg-clip-padding
                  border-2 border-solid border-primary
                  rounded-[8px]
                  transition
                  ease-in-out
                  m-0
                  focus:text-white focus:bg-paper-bg focus:outline-none 
                "
                id="coinAmount"
                placeholder="0.0"
              />
            </div>
          </div>
          <div className="flex justify-center">
            {
              account
                ?
              <button disabled={amount>0 && amount<walletBalance} className="flex flex-row items-center gap-2 border-2 border-secondary inner-glow-secondary px-6 py-4 text-xs rounded-full hover:bg-secondary hover:text-black disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                BRIDGE TOKENS
              </button>
              :
              <button className="flex flex-row items-center gap-2 border-2 border-primary inner-glow-primary px-6 py-4 text-xs rounded-full hover:bg-primary hover:text-black" onClick={login}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                CONNECT TO WALLET
              </button>
            }
          </div>

          <div className="flex border-2 border-primary rounded-[32px] justify-center mx-2 p-4">
            <h2 className="text-center text-m whitespace-pre-line">
              CAPTION DATA{'\n'}
              <span className="text-s">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy text 
                ever since the 1500s, when an unknown printer took a galley of type
                and scrambled it to make a type specimen book. 
              </span>
            </h2>
          </div>
    </div>
}

export default BridgeCard

type SelectorProps = {
  onChange:(chainToSelect: string) => void,
  currentChain: string
  defaultChain: string
}
const ChainSelector = (props: SelectorProps) => {
  
  return <div className="flex justify-center">
    <div>
      <div className="dropdown relative">
        <button
          className="
            dropdown-toggle
            px-6
            py-2.5
            bg-paper-bg
            border-2 border-secondary 
            text-white
            font-medium
            text-xs
            leading-tight
            uppercase
            rounded-[8px]
            shadow-md
            transition
            duration-150
            ease-in-out
            flex
            items-center
            whitespace-nowrap
          "
          type="button"
          id="dropdownMenuButton1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          DEFAULT CHAIN
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="caret-down"
            className="w-2 ml-2"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <path
              fill="currentColor"
              d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
            ></path>
          </svg>
        </button>
        <ul
          className="
            dropdown-menu
            min-w-max
            absolute
            hidden
            bg-white
            text-base
            z-50
            float-left
            py-2
            list-none
            text-left
            rounded-lg
            shadow-lg
            mt-1
            hidden
            m-0
            bg-clip-padding
            border-none
          "
          aria-labelledby="dropdownMenuButton1"
        >
          <li>
            <a
              className="
                dropdown-item
                text-sm
                py-2
                px-4
                font-normal
                block
                w-full
                whitespace-nowrap
                bg-transparent
                text-gray-700
                hover:bg-gray-100
              "
              href="#"
              >
                Action
            </a>
          </li>
          <li>
            <a
              className="
                dropdown-item
                text-sm
                py-2
                px-4
                font-normal
                block
                w-full
                whitespace-nowrap
                bg-transparent
                text-gray-700
                hover:bg-gray-100
              "
              href="#"
              >
                Another action
            </a>
          </li>
          <li>
            <a
              className="
                dropdown-item
                text-sm
                py-2
                px-4
                font-normal
                block
                w-full
                whitespace-nowrap
                bg-transparent
                text-gray-700
                hover:bg-gray-100
              "
              href="#"
            >
            Something else here
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

}

