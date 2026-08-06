import NextUpForm from './NextUpForm'

export const metadata = {
  title: 'NextUp | AISCA × Business Advisor Junior',
  description:
    "A national initiative by AISCA in partnership with Business Advisor Junior, spotlighting Sri Lanka's boldest young entrepreneurs, changemakers, and innovators. Apply to be featured.",
  alternates: { canonical: 'https://aisca.lk/nextup' },
}

export default function NextUpPage() {
  return (
    <>
      {/* Poster-style heading font, loaded only for this page */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <NextUpForm />
    </>
  )
}
