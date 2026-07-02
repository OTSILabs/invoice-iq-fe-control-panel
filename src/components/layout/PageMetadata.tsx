import { Helmet } from "@dr.pogodin/react-helmet"

interface PageMetadataProps {
  title: string
  description: string
  keywords: string
}

export function PageMetadata({ title, description, keywords }: PageMetadataProps) {
  return (
    <Helmet>
      <title>{title} | Invoice IQ</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={`${title} | Invoice IQ`} />
      <meta property="og:description" content={description} />
    </Helmet>
  )
}
