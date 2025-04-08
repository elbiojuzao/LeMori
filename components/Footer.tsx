// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-indigo-300 text-center text-white bg-gray-100 text-sm py-4 ">
      &copy; {new Date().getFullYear()} LeMori - Lembrança e Memória. Todos os direitos reservados.
    </footer>
  )
}
