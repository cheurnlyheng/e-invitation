import type { MetadataRoute } from "next";

// The invitation itself may be indexed, but the dashboard and the API should not be.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: ["/admin", "/api/"] } };
}
