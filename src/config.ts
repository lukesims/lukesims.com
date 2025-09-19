export type ContactInfo = { icon: string; text: string; url?: string };
export const contactInfo: { [key: string]: ContactInfo } = {
  github: {
    icon: "icon-[ri--github-fill]",
    text: "Github",
    url: "https://github.com/lukesims",
  },
  linkedin: {
    icon: "icon-[ri--linkedin-box-fill]",
    text: "LinkedIn",
    url: "https://linkedin.com/in/lukesimsuk",
  },
  location: {
    icon: "icon-[ri--map-pin-fill]",
    text: "Essex, UK",
  },
  website: {
    icon: "icon-[ri--global-line]",
    text: "My Website",
    url: "https://lukesims.com",
  },
};
