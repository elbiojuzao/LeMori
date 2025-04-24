import { useRouter } from 'next/router'

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
      <img
        src="/img/Lumenis.png"
        alt="Logo Lumenis"
        className={`h-10 ${className}`}
      />
    </button>
  )
}