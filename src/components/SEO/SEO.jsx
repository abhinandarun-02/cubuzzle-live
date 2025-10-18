import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

/**
 * SEO Component for dynamic meta tags across the application
 * Use this component in each page/route to customize SEO metadata
 */
function SEO({
  title = "Cubuzzle Champion League - Leaderboard & Live Results",
  description = "Cubuzzle Champion League leaderboard: watch live cubing competition results in real-time. Track competitors, view schedules, and follow Rubik's cube speedsolving events.",
  keywords = "cubuzzle, cubing competition, rubik's cube, speedcubing, live results, cube competition, WCA, speedsolving",
  image = "https://cubuzzle-leaderboard.vercel.app/og-image.png",
  url = "https://cubuzzle-leaderboard.vercel.app/",
  type = "website",
  author = "Cubuzzle Champion League",
  twitterHandle = "@cubuzzle",
  structuredData = null,
}) {
  const siteUrl = "https://cubuzzle-leaderboard.vercel.app";
  const fullUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Cubuzzle Champion League" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      {twitterHandle && <meta property="twitter:creator" content={twitterHandle} />}

      {/* Structured Data */}
      {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  author: PropTypes.string,
  twitterHandle: PropTypes.string,
  structuredData: PropTypes.object,
};

export default SEO;
