import './globals.css'

export const metadata = {
  title: 'AI-DLC Readiness Assessor',
  description: 'Enterprise AI development readiness assessment built on AWS AI-DLC methodology',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
