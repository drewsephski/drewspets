const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://drewspets.com"
const canonicalSiteUrl = new URL(configuredSiteUrl)
if (canonicalSiteUrl.hostname === "www.drewspets.com")
  canonicalSiteUrl.hostname = "drewspets.com"

export const site = {
  name: "Drew’s Pet Care",
  url: canonicalSiteUrl.origin,
  description:
    "Pet sitting and dog walking by Drew in Fox River Grove, Cary, Barrington and nearby Illinois towns. House sitting from $55/night; dog walks and cat visits from $22.",
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
    image: "/images/drew-and-dog-at-home.jpg",
    imageAlt: "Drew spending time with a dog at home",
    imageWidth: 2200,
    imageHeight: 1650,
    imagePosition: "center",
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
    zip: "60021",
    intro: "Pet care, close to home.",
    copy: "Fox River Grove is the home base for Drew’s Pet Care. That makes it a natural starting point for regular walks, midday drop-ins, and overnight care with a familiar local face.",
    context:
      "If your day starts with a commute or takes you away for a weekend, share the times your pet normally eats, walks, and rests. I’ll help you choose between a visit, a longer walk, and overnight company.",
    tip: "For walks near the river, tell me how your dog responds to water, wildlife, and other dogs. We’ll choose a comfortable route together.",
    nearby: ["Cary", "Barrington"],
    faq: "Can we arrange recurring weekday visits?",
    answer:
      "Yes, include the weekdays and time windows you have in mind. Recurring visits are arranged around current availability and your pet’s routine.",
  },
  {
    slug: "cary-il",
    name: "Cary",
    zip: "60013",
    intro: "A familiar routine for your Cary pet.",
    copy: "Just next to Fox River Grove, Cary is part of the core service area. Walks and check-ins can help bridge long workdays, while house sitting keeps pets in their familiar home during a trip.",
    context:
      "A quick potty break and a full hour of attention serve different needs. When you request care, include your commute, your dog’s energy level, and when someone will next be home so we can choose the right visit length.",
    tip: "Share your usual neighborhood route and any busy crossings you prefer to avoid. Familiar walks can help a new sitter feel less new.",
    nearby: ["Fox River Grove", "Crystal Lake"],
    faq: "Can my cat stay home while I travel?",
    answer:
      "Yes. Cat visits cover meals, fresh water, litter, and a wellbeing check. We’ll agree on daily frequency and access before your trip.",
  },
  {
    slug: "barrington-il",
    name: "Barrington",
    zip: "60010",
    intro: "Thoughtful care for days away in Barrington.",
    copy: "From a workday away to a longer trip, pet care should fit the home and routine you already have. Drew’s Pet Care considers Barrington requests individually, including overnight stays and scheduled visits.",
    context:
      "Barrington addresses cover a broad area. Start with your city or ZIP and dates. We’ll discuss your exact address privately when checking travel time and preferred visit windows.",
    tip: "For properties with gates or longer driveways, mention access arrangements during planning. Please save gate codes and keys for a secure conversation after confirmation.",
    nearby: ["Fox River Grove", "Cary"],
    faq: "Does my address fall within the service area?",
    answer:
      "The town name is a starting point, not a guarantee. Send your city or ZIP and dates; we’ll discuss your address privately and review travel time before confirming care.",
  },
  {
    slug: "crystal-lake-il",
    name: "Crystal Lake",
    zip: "60014",
    intro: "Keep their day familiar in Crystal Lake.",
    copy: "Planning a weekend away or looking for help during the week? Crystal Lake families can request house sitting, dog walks, cat visits, and other personalized care from Drew’s Pet Care.",
    context:
      "For a regular walking arrangement, consistent time windows help make the route practical. For holiday travel, send your dates early so there’s time to discuss routines and arrange a meet & greet.",
    tip: "Tell me whether your dog prefers quiet residential walks or a little more activity. All outings are agreed around your pet’s comfort, not a one-size-fits-all route.",
    nearby: ["Cary", "Lake in the Hills"],
    faq: "Can you care for both my dog and cat?",
    answer:
      "Yes. Add every pet to your request, including their separate feeding routines. Additional-pet pricing is confirmed in your personal quote.",
  },
  {
    slug: "algonquin-il",
    name: "Algonquin",
    zip: "60102",
    intro: "Care that fits your Algonquin household.",
    copy: "Drew’s Pet Care welcomes requests from Algonquin for overnight stays, walks, and visits at home. The first step is a conversation about where you live, your dates, and what a normal day looks like for your pets.",
    context:
      "Travel time can vary across the area, so a flexible arrival window is useful for drop-ins. If medication or a puppy’s routine requires a precise time, tell me up front so I can check whether it’s workable.",
    tip: "For a multi-pet household, list who eats separately, who walks together, and any doors or rooms that need to stay closed.",
    nearby: ["Lake in the Hills", "Cary"],
    faq: "Can you guarantee a specific arrival time?",
    answer:
      "Time-sensitive needs are reviewed before confirmation. Please state the required window; I’ll only agree to a schedule I can reasonably keep.",
  },
  {
    slug: "lake-in-the-hills-il",
    name: "Lake in the Hills",
    zip: "60156",
    intro: "A little less worry. A well-cared-for pet.",
    copy: "For Lake in the Hills pet owners, Drew’s Pet Care offers a personal way to plan care at home or discuss daytime and overnight options. Your request is reviewed by Drew, with availability confirmed before you commit.",
    context:
      "If you’re considering care outside your home, we’ll discuss the setting and your pet’s comfort around unfamiliar places. For pets who prefer their own space, drop-ins or house sitting may be a better match.",
    tip: "Plan an introductory visit before an extended stay. It’s a useful time to practice entry, go over feeding, and see how your pet settles.",
    nearby: ["Algonquin", "Crystal Lake"],
    faq: "Can I request care at short notice?",
    answer:
      "You can always ask. Availability and the time needed for a meet & greet determine what’s possible; submitting a request doesn’t confirm a booking.",
  },
] as const
export const faqs = [
  [
    "Where does Drew offer pet sitting near me?",
    "Drew’s Pet Care is based in Fox River Grove, Illinois (60021). Fox River Grove and Cary are the core service area; requests from Barrington, Crystal Lake, Algonquin, and Lake in the Hills are reviewed for travel time and availability. Send your city or ZIP, service, and dates to check coverage.",
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
