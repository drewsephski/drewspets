export const portfolioUrl = "https://drewsepeczi.xyz"

export type SoftwareProject = {
  name: string
  category: string
  description: string
  href: string
  domain: string
}

export const softwareProjects: SoftwareProject[] = [
  {
    name: "Krafty",
    category: "AI teammates",
    description:
      "AI teammates with their own memory and a shared cloud computer for handing back finished work.",
    href: "https://kraftybot.app",
    domain: "kraftybot.app",
  },
  {
    name: "LocalRedraft",
    category: "Websites",
    description:
      "Website redesigns for local businesses, shown as a ready-to-review draft of the new site.",
    href: "https://localredraft.com",
    domain: "localredraft.com",
  },
  {
    name: "Menace Voice",
    category: "Voice agents",
    description:
      "A place to design, test, and deploy voice AI agents for phone and browser calls.",
    href: "https://voice.menaceui.com",
    domain: "voice.menaceui.com",
  },
  {
    name: "funshader",
    category: "Web graphics",
    description:
      "A library of animated WebGL backgrounds you install as source and tune to fit your site.",
    href: "https://funshader.com",
    domain: "funshader.com",
  },
]

export type SoftwareService = {
  title: string
  copy: string
}

export const softwareServices: SoftwareService[] = [
  {
    title: "Business websites",
    copy: "A clear, fast site for a local business or project, from a fresh build to a redesign of the one you have.",
  },
  {
    title: "Voice agents",
    copy: "A voice agent that answers calls, takes intake details, or hands off to a person when it should.",
  },
  {
    title: "Other software",
    copy: "Small tools, internal dashboards, or AI features. If you have an idea, tell me about it.",
  },
]
