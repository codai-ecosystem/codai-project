import dynamic from 'next/dynamic'

const AideMainInterface = dynamic(() => import('../components/AideMainInterface'), {
  ssr: false
})

export default function Home() {
  return <AideMainInterface />
}
