import { useRouter } from 'next/router'
import Image from 'next/image'

interface LogoProps {
  className?: string
}

export default function Logo({ className = '' }: LogoProps) {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push('/')
  }

  return (
    <button
      onClick={handleLogoClick}
      className={`focus:outline-none ${className}`}
      style={{ border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
    >
      <Image
        src="/img/Lumenis.png"
        alt="Logo Lumenis"
        width={40}
        height={40}
        className={`h-10 ${className}`}
      />
    </button>
  )
}