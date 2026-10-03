const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://drewspets.com"
const canonicalSiteUrl = new URL(configuredSiteUrl)
if (canonicalSiteUrl.hostname === "www.drewspets.com")
  canonicalSiteUrl.hostname = "drewspets.com"

export const site = {
  name: "Drew’s Pet Care",
  url: canonicalSiteUrl.origin,
  description:
    "Dog sitting, pet sitting and dog walking by Drew in Fox River Grove and Cary, IL. Huntley, Wauconda and nearby towns by request. Overnight care from $55/night.",
  // Public listing and contact details checked in Google Business Profile.
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+12243431711",
  googleMapsUrl:
    "https://www.google.com/maps/place/Drew%E2%80%99s+Pet+Care/data=!4m2!3m1!1s0x0:0xbec7dcdbeb0ebd47",
  googleReviewUrl:
    process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
    "https://g.page/r/CUe9Duvb3Me-EBM/review",
  sitterProfileUrl: "https://drew.sitterfolio.com/",
}
export const services = [
  {
    slug: "house-sitting",
    name: "House Sitting",
    short: "Their home. Their routine. Your peace of mind.",
    description:
      "Overnight company and attentive care in the place your pets know best. I stay in your home, follow your instructions, and keep you in the loop while you’re away.",
    price: 5500,
    unit: "night",
    icon: "house",
    image: "/images/gallery/puppy-napping.webp",
    imageAlt: "A puppy sleeping comfortably at home",
    imageWidth: 914,
    imageHeight: 1706,
    imagePosition: "50% 78%",
    includes: [
      "Overnight care in your home",
      "Meals, walks & familiar routines",
      "Daily photos and personal updates",
    ],
    best: "Pets who settle best at home, multi-pet households, and owners heading out of town.",
    question: "Will you be at my home all day?",
    answer:
      "House sitting includes an overnight stay and an agreed daytime routine. It is not continuous 24-hour supervision. We’ll discuss time alone and any extra visits before confirming.",
  },
  {
    slug: "drop-ins",
    name: "Drop-In Visits",
    short: "A friendly face to break up their day.",
    description:
      "A visit at home for food, fresh water, a potty break, playtime, or simply a little company. Choose a 30- or 60-minute visit to fit your pet’s day.",
    price: 2200,
    unit: "visit",
    icon: "sun",
    image: "/images/drew-with-saint-bernards.jpg",
    imageAlt: "Drew cuddling with Saint Bernards on a sofa at home",
    imageWidth: 1206,
    imageHeight: 1448,
    imagePosition: "50% 60%",
    includes: [
      "30- or 60-minute visits",
      "Feeding, fresh water & potty breaks",
      "A photo update after each visit",
    ],
    best: "Workdays, short trips, cats who prefer home, and pets who need a little extra attention.",
    question: "Can I request more than one visit a day?",
    answer:
      "Yes. Mention preferred visit times and frequency in the optional message, or we can discuss them when we talk. Your final quote will reflect the number and length of visits.",
  },
  {
    slug: "dog-walking",
    name: "Dog Walking",
    short: "Fresh air, happy noses, and a good stretch.",
    description:
      "One-on-one neighborhood walks at your dog’s pace. From a leisurely sniff around the block to a longer outing, each walk is built around your dog.",
    price: 2200,
    unit: "walk",
    icon: "walk",
    image: "/images/gallery/two-dogs-neighborhood-walk.webp",
    imageAlt: "Two dogs on a leashed neighborhood walk",
    imageWidth: 1092,
    imageHeight: 2000,
    imagePosition: "50% 90%",
    includes: [
      "30- or 60-minute walks",
      "A pace that suits your dog",
      "Fresh water & a post-walk update",
    ],
    best: "Busy workdays, regular exercise, and dogs who appreciate a dependable walking buddy.",
    question: "What happens in bad weather?",
    answer:
      "Safety comes first. In heat, cold, or storms, we’ll adjust outdoor time and discuss indoor enrichment. Tell me about any weather sensitivities when you request care.",
  },
  {
    slug: "daycare",
    name: "Doggy Day Care",
    short: "A little company while you take on the day.",
    description:
      "Daytime care with companionship, breaks, and time to rest. We’ll talk through the care setting and your dog’s needs before agreeing on a day.",
    price: null,
    unit: "day",
    icon: "sun",
    image: "/images/dogs-resting-by-the-window.jpg",
    imageAlt: "Two dogs resting together at home",
    imageWidth: 1650,
    imageHeight: 2200,
    imagePosition: "center",
    includes: [
      "An agreed daytime care window",
      "Play, potty breaks & downtime",
      "A meet & greet before care",
    ],
    best: "Dogs who need company during the day and owners with a long day away.",
    question: "Is every dog a fit for daycare?",
    answer:
      "Daycare depends on temperament, availability, and a suitable care setting. We’ll discuss social comfort, vaccination history, and rest needs at a meet & greet.",
  },
  {
    slug: "boarding",
    name: "Boarding",
    short: "A welcoming place for their own little getaway.",
    description:
      "Overnight care away from your home, with routines and a setting discussed in advance. Every boarding request is reviewed individually for fit and availability.",
    price: null,
    unit: "night",
    icon: "moon",
    image: "/images/dogs-relaxing-at-home.jpg",
    imageAlt: "Two dogs relaxing together at home",
    imageWidth: 1650,
    imageHeight: 2200,
    imagePosition: "center",
    includes: [
      "Individually reviewed stays",
      "Familiar food & bedtime routines",
      "Regular photos and updates",
    ],
    best: "Pets comfortable staying somewhere new after an introductory meet & greet.",
    question: "What should I bring?",
    answer:
      "Bring your pet’s normal food, labeled medications, leash, and a familiar bed or blanket. We’ll confirm the full packing list and care arrangements before the stay.",
  },
  {
    slug: "cat-sitting",
    name: "Cat Sitting",
    short: "Their space, their pace. Just how cats like it.",
    description:
      "Quiet, attentive visits for your cat at home. Food, water, litter care, and company on their terms—whether that’s a game with a favorite toy or a respectful check-in.",
    price: 2200,
    unit: "visit",
    icon: "cat",
    image: "/images/orange-cat-resting.jpg",
    imageAlt: "An orange cat relaxing at home",
    imageWidth: 1650,
    imageHeight: 2200,
    imagePosition: "center",
    includes: [
      "Food, water & litter refresh",
      "Play or quiet companionship",
      "A personal update each visit",
    ],
    best: "Cats who are happiest in familiar surroundings while their people are away.",
    question: "My cat hides. Is that okay?",
    answer:
      "Absolutely. Share their favorite hiding spots and normal behavior. I’ll check on their wellbeing without forcing interaction, and let you know how they’re doing.",
  },
  {
    slug: "puppy-care",
    name: "Puppy Care",
    short: "Small paws. A little extra attention.",
    description:
      "Gentle, consistent care during the busy puppy months. We’ll work around feeding, potty breaks, naps, and the routines you’re building at home.",
    price: 6000,
    unit: "night",
    icon: "heart",
    image: "/images/puppy-in-the-garden.jpg",
    imageAlt: "A young puppy exploring the garden",
    imageWidth: 600,
    imageHeight: 450,
    imagePosition: "center",
    includes: [
      "Age-appropriate breaks & play",
      "Your feeding and nap schedule",
      "Consistent household routines",
    ],
    best: "Young dogs needing more frequent attention, with a care plan agreed around their age.",
    question: "Do you provide puppy training?",
    answer:
      "I can follow the cues and routines you already use, but this is pet care, not a professional training service. Share your puppy’s current schedule so we can plan suitable coverage.",
  },
] as const
export type ServiceSlug = (typeof services)[number]["slug"]
export const locations = [
  {
    slug: "fox-river-grove-il",
    name: "Fox River Grove",
    core: true,
    zip: "60021",
    intro: "Pet care, close to home.",
    copy: "Fox River Grove is the home base for Drew’s Pet Care. That makes it a natural starting point for regular walks, midday drop-ins, and overnight care with a familiar local face.",
    context:
      "If your day starts with a commute or takes you away for a weekend, share the times your pet normally eats, walks, and rests. I’ll help you choose between a visit, a longer walk, and overnight company.",
    tip: "For walks near the river, tell me how your dog responds to water, wildlife, and other dogs. We’ll choose a comfortable route together.",
    nearby: ["Cary", "Barrington", "Lake Barrington", "Island Lake"],
    faq: "Can we arrange recurring weekday visits?",
    answer:
      "Yes, include the weekdays and time windows you have in mind. Recurring visits are arranged around current availability and your pet’s routine.",
  },
  {
    slug: "cary-il",
    name: "Cary",
    core: true,
    zip: "60013",
    intro: "A familiar routine for your Cary pet.",
    copy: "Just next to Fox River Grove, Cary is part of the core service area. Walks and check-ins can help bridge long workdays, while house sitting keeps pets in their familiar home during a trip.",
    context:
      "A quick potty break and a full hour of attention serve different needs. When you request care, include your commute, your dog’s energy level, and when someone will next be home so we can choose the right visit length.",
    tip: "Share your usual neighborhood route and any busy crossings you prefer to avoid. Familiar walks can help a new sitter feel less new.",
    nearby: ["Fox River Grove", "Crystal Lake", "Island Lake"],
    faq: "Can my cat stay home while I travel?",
    answer:
      "Yes. Cat visits cover meals, fresh water, litter, and a wellbeing check. We’ll agree on daily frequency and access before your trip.",
  },
  {
    slug: "barrington-il",
    name: "Barrington",
    core: false,
    zip: "60010",
    intro: "Thoughtful care for days away in Barrington.",
    copy: "From a workday away to a longer trip, pet care should fit the home and routine you already have. Drew’s Pet Care considers Barrington requests individually, including overnight stays and scheduled visits.",
    context:
      "Barrington addresses cover a broad area. Start with your city or ZIP and dates. We’ll discuss your exact address privately when checking travel time and preferred visit windows.",
    tip: "For properties with gates or longer driveways, mention access arrangements during planning. Please save gate codes and keys for a secure conversation after confirmation.",
    nearby: ["Fox River Grove", "Cary", "Lake Barrington", "Wauconda"],
    faq: "Does my address fall within the service area?",
    answer:
      "The town name is a starting point, not a guarantee. Send your city or ZIP and dates; we’ll discuss your address privately and review travel time before confirming care.",
  },
  {
    slug: "crystal-lake-il",
    name: "Crystal Lake",
    core: false,
    zip: "60014",
    intro: "Keep their day familiar in Crystal Lake.",
    copy: "Planning a weekend away or looking for help during the week? Crystal Lake families can request house sitting, dog walks, cat visits, and other personalized care from Drew’s Pet Care.",
    context:
      "For a regular walking arrangement, consistent time windows help make the route practical. For holiday travel, send your dates early so there’s time to discuss routines and arrange a meet & greet.",
    tip: "Tell me whether your dog prefers quiet residential walks or a little more activity. All outings are agreed around your pet’s comfort, not a one-size-fits-all route.",
    nearby: ["Cary", "Lake in the Hills", "Huntley"],
    faq: "Can you care for both my dog and cat?",
    answer:
      "Yes. Add every pet to your request, including their separate feeding routines. Additional-pet pricing is confirmed in your personal quote.",
  },
  {
    slug: "algonquin-il",
    name: "Algonquin",
    core: false,
    zip: "60102",
    intro: "Care that fits your Algonquin household.",
    copy: "Drew’s Pet Care welcomes requests from Algonquin for overnight stays, walks, and visits at home. The first step is a conversation about where you live, your dates, and what a normal day looks like for your pets.",
    context:
      "Travel time can vary across the area, so a flexible arrival window is useful for drop-ins. If medication or a puppy’s routine requires a precise time, tell me up front so I can check whether it’s workable.",
    tip: "For a multi-pet household, list who eats separately, who walks together, and any doors or rooms that need to stay closed.",
    nearby: ["Lake in the Hills", "Cary", "Huntley"],
    faq: "Can you guarantee a specific arrival time?",
    answer:
      "Time-sensitive needs are reviewed before confirmation. Please state the required window; I’ll only agree to a schedule I can reasonably keep.",
  },
  {
    slug: "lake-in-the-hills-il",
    name: "Lake in the Hills",
    core: false,
    zip: "60156",
    intro: "A little less worry. A well-cared-for pet.",
    copy: "For Lake in the Hills pet owners, Drew’s Pet Care offers a personal way to plan care at home or discuss daytime and overnight options. Your request is reviewed by Drew, with availability confirmed before you commit.",
    context:
      "If you’re considering care outside your home, we’ll discuss the setting and your pet’s comfort around unfamiliar places. For pets who prefer their own space, drop-ins or house sitting may be a better match.",
    tip: "Plan an introductory visit before an extended stay. It’s a useful time to practice entry, go over feeding, and see how your pet settles.",
    nearby: ["Algonquin", "Crystal Lake", "Huntley"],
    faq: "Can I request care at short notice?",
    answer:
      "You can always ask. Availability and the time needed for a meet & greet determine what’s possible; submitting a request doesn’t confirm a booking.",
  },
  {
    slug: "huntley-il",
    name: "Huntley",
    core: false,
    zip: "60142",
    intro: "A dog sitter for your time away from Huntley.",
    copy: "Looking for dog sitting in Huntley, IL 60142? Drew welcomes requests for overnight house sitting, dog walks, drop-ins, and cat visits. Care is based from Fox River Grove, so travel time and your dates are checked before a booking is agreed.",
    context:
      "For a trip away from Huntley, share your departure and return times as well as the nights you need covered. An overnight stay and several separate drop-ins involve different schedules; we’ll work out which can meet your dog’s feeding, walking, and time-alone needs.",
    tip: "If you need recurring midday walks in Huntley, include the days and arrival window. The drive from Fox River Grove needs to fit around existing visits, especially for puppies who cannot wait long between breaks.",
    nearby: ["Lake in the Hills", "Algonquin", "Crystal Lake"],
    faq: "Can I request overnight dog sitting in Huntley?",
    answer:
      "Yes. Send Huntley or 60142, your dates, and your pets’ needs. House sitting means an overnight stay in your home, with daytime visits and time alone agreed beforehand. Drew checks travel and availability before confirming; it does not include continuous 24-hour care.",
  },
  {
    slug: "wauconda-il",
    name: "Wauconda",
    core: false,
    zip: "60084",
    intro: "Plan walks and stays for your Wauconda pet.",
    copy: "Wauconda pet owners can request dog sitting, walks, and cat care from Drew. Whether you need company overnight or a visit during the day, your Wauconda, IL 60084 request is reviewed for travel from Fox River Grove and current availability.",
    context:
      "For care in Wauconda, tell me whether your dog needs a full walk or a shorter visit for meals and a potty break. If you live near busy roads or lakefront areas, we’ll discuss a familiar route and any places your dog finds overwhelming before the first walk.",
    tip: "For a dog who is drawn to water or wildlife, explain their leash habits and the routes you normally use. Walks follow an agreed routine; swimming and off-leash outings are not assumed.",
    nearby: ["Island Lake", "Lake Barrington", "Barrington"],
    faq: "Can you arrange regular dog walks in Wauconda?",
    answer:
      "You can request them. Include Wauconda or 60084, the weekdays, and your preferred time window. Drew checks the route from Fox River Grove and existing commitments before agreeing to recurring walks. A listed town or ZIP does not guarantee availability.",
  },
  {
    slug: "island-lake-il",
    name: "Island Lake",
    core: false,
    zip: "60042",
    intro: "Visits at home for Island Lake dogs and cats.",
    copy: "Need a dog sitter or cat sitter in Island Lake, IL 60042? Drew’s Pet Care welcomes requests for visits, walks, and overnight care in your home. Coverage is checked individually from the Fox River Grove home base.",
    context:
      "If you are leaving Island Lake for a weekend, plan the first and last visits around when someone will actually be home. Cats may need feeding and litter visits while your dog needs walks and overnight company; list each pet so the plan covers the whole household.",
    tip: "Tell me if your cat hides when someone arrives or your dog is wary at the door. We can go over a calm entry routine at a meet & greet before the first Island Lake visit.",
    nearby: ["Wauconda", "Cary", "Fox River Grove"],
    faq: "Can you visit my Island Lake cat while I’m away?",
    answer:
      "Yes, cat visits can be requested for Island Lake. They include meals, fresh water, litter care, and a wellbeing check. Send your dates and preferred visit frequency; travel time and availability are reviewed before the visits are confirmed.",
  },
  {
    slug: "lake-barrington-il",
    name: "Lake Barrington",
    core: false,
    zip: "60010",
    intro: "Overnight care and visits in Lake Barrington.",
    copy: "Drew welcomes dog sitting and pet-care requests in Lake Barrington, IL 60010. House sitting keeps pets at home with their familiar routines; walks and drop-ins can cover shorter periods away. Dates and coverage are confirmed personally.",
    context:
      "Lake Barrington and Barrington share the 60010 ZIP, so include your town as well when asking about coverage. For a home with visitor parking, shared entrances, or a gated driveway, we’ll review the practical access details privately before arranging visits.",
    tip: "If building or community rules affect visitors or dogs, mention them when planning care. Save entry codes and keys for the secure access conversation after confirmation.",
    nearby: ["Barrington", "Fox River Grove", "Wauconda"],
    faq: "Does a 60010 address confirm Lake Barrington coverage?",
    answer:
      "No. The ZIP is a starting point and is also used by Barrington addresses. Include Lake Barrington and your dates in the request. Drew will discuss your address privately, check travel and access, and confirm whether your care schedule is possible.",
  },
] as const
export type Location = (typeof locations)[number]

export const coverageSummary = `Fox River Grove and Cary are the core service area. Requests from ${locations
  .filter((location) => !location.core)
  .map((location) => location.name)
  .join(", ")} are reviewed for travel time and availability.`

export const faqs = [
  [
    "Where does Drew offer dog sitting and pet sitting near me?",
    `Drew’s Pet Care is based in Fox River Grove, Illinois (60021). ${coverageSummary} Send your city or ZIP, service, and dates to check coverage.`,
  ],
  [
    "How much does pet sitting cost?",
    "House sitting starts at $55 per night. Dog walks, drop-in visits, and cat sitting start at $22 per walk or visit; puppy care starts at $60 per night. Boarding and daycare are personally quoted. Holidays, extra pets, visit length, and special care can change the total. Drew confirms an exact quote before you book.",
  ],
  [
    "How do I book pet care?",
    "Choose a service, share your dates, and tell me a little about your pets. I’ll personally review your request, follow up with availability and pricing, and arrange a meet & greet when needed. Your request is free and comes with no obligation.",
  ],
  [
    "Will you meet my pet before the booking?",
    "Of course. A meet & greet is a lovely way for us to get comfortable, especially the first time. You can show me your pet’s routine and ask anything on your mind.",
  ],
  [
    "Who will be looking after my pet?",
    "Me — Drew. I handle every visit and stay myself, so you’ll know exactly who’s caring for your pets.",
  ],
  [
    "Will I receive photos and updates?",
    "Yes. Regular photos and messages are part of the care. We’ll agree on how you’d like to receive updates before the booking starts.",
  ],
  [
    "Can you help with medication or special care?",
    "Let me know briefly if your pet needs extra help. We’ll talk through the details together before making plans — no need to write out medication schedules in the form. I’ll be honest about what I can safely help with.",
  ],
  [
    "When do I pay?",
    "There’s no payment to send a request. We’ll talk first, agree on care and a price, then I’ll send you payment details. Holiday rates, extra pets, and special care are confirmed in advance.",
  ],
]
export type Testimonial = {
  quote: string
  name: string
  petName?: string
  photo?: string
  source?: "direct" | "google"
}
export const testimonials: Testimonial[] = []
const referralCredit = "$10"
export const referral = {
  credit: referralCredit,
  followUpMessage: (pet: string) =>
    `Thanks again for trusting me with ${pet}. If you know someone nearby who could use reliable pet care, I’d really appreciate the referral. When they complete their first paid booking, I’ll add a ${referralCredit} credit to your next booking.`,
}
export const reviewRequest = {
  url: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "",
  message:
    "If you’d like to share your experience, an honest Google review helps local pet owners find Drew’s Pet Care.",
}
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100)
