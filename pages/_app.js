import '../styles/globals.css'
import { useEffect } from 'react'
import { initStore } from '../lib/store'

export default function App({ Component, pageProps }) {
  useEffect(() => { initStore() }, [])
  return <Component {...pageProps} />
}
