import Navbar from '@/components/layout/Navbar'

export default function WorkersReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  )
}



