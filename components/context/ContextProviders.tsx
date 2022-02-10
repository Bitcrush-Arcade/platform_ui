import {ReactNode} from 'react'
import {ethers} from 'ethers'
import { Web3ReactProvider } from '@web3-react/core'
import { TransactionLoadingContext } from 'components/context/TransactionContext'
import { AuthContext } from 'components/context/AuthContext'
import { EmotionCache } from '@emotion/react';
import { LiveWalletsContext } from './LiveWalletContext'

export default function ContextProviders( props: {children: ReactNode, emotionCache: EmotionCache }){
  
  const getLibrary = ( provider:any ): ethers.providers.Web3Provider =>{ 
    const library = new ethers.providers.Web3Provider(  provider )
    library.pollingInterval = 12000
    return library
  }

  return <Web3ReactProvider getLibrary={ getLibrary }>
    <TransactionLoadingContext emotionCache={props.emotionCache}>
      <AuthContext>
        <LiveWalletsContext>
          {props.children}
        </LiveWalletsContext>
      </AuthContext>
    </TransactionLoadingContext>
  </Web3ReactProvider>
} 