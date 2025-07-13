import './globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

const sfFont = localFont({
  src: '../../public/font/sf.woff2',
  variable: '--font-sf'
})

export const metadata: Metadata = {
  title: 'منو هتل پارادایس',
  description: 'منو آنلاین غذاهای هتل پارادایس',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${sfFont.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
