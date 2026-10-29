import siteData from "@/data/site.json";

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  social: {
    googleScholarUrl: string;
    githubUrl: string;
    twitterUrl: string;
    twitterHandle: string;
  };
};

export const site: SiteConfig = siteData;
