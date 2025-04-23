export default function Logo({ className = '' }: { className?: string }) {
  return (
    <img
      src="img/Lumenis.png"
      alt="Logo Lumenis"
      className={`h-10 ${className}`}
    />
  )
}