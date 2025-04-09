import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/">
      <Image src="/img/Lm_LeMori.png" alt="LeMori" width={120} height={40} />
    </Link>
  )
}
