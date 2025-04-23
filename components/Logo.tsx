export default function Logo({ className = '' }: { className?: string }) {
  return (
    <img
      src="img/logo_lumenis.png"
      alt="Logo Lumenis"
      className={`h-10 ${className}`}
    />
  )
}