import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Camera,
  Heart,
  Check,
  House,
  Sun,
  Footprints,
  Moon,
  Cat,
  ShieldCheck,
} from "lucide-react"
import { services, locations, testimonials, site, money } from "@/lib/content"
import { FAQ, FinalCTA, JsonLd } from "@/components/site/shared"
const icons = {
  house: House,
  sun: Sun,
  walk: Footprints,
  moon: Moon,
  cat: Cat,
  heart: Heart,
}
export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PetSitting",
          name: site.name,
          url: site.url,
          description: site.description,
          image: site.url + "/images/golden-retriever.jpg",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Fox River Grove",
            addressRegion: "IL",
            addressCountry: "US",
          },
          areaServed: locations.map((l) => ({ "@type": "City", name: l.name })),
          priceRange: "$$",
        }}
      />
      <section className="shell hero">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            <span className="status-dot" /> YOUR LOCAL PET PERSON
          </span>
          <h1>
            Happy pets.
            <br />
            Familiar routines.
            <br />
            <span className="serif-italic">Peace of mind.</span>
          </h1>
          <p>
            Reliable, personalized pet care while you’re away.
            <br className="wide-only" /> From daily walks to overnight company,
            a little
            <br className="wide-only" /> extra love for the ones you love most.
          </p>
          <div className="hero-buttons">
            <Link href="/book" className="button">
              Check availability <ArrowUpRight size={18} />
            </Link>
            <Link href="#services" className="text-link">
              Explore services <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-local">
            <MapPin size={17} />
            <span>Fox River Grove & nearby communities</span>
          </div>
          <div className="hero-personal">
            <span className="initial-avatar">D</span>
            <span>
              Hi, I’m Drew. <span>Your pet’s new familiar face.</span>
            </span>
            <svg viewBox="0 0 55 27" aria-hidden="true">
              <path
                d="M2 6c20 22 32 16 44 0m-13 1 14-3-2 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image">
            <Image
              src="/images/golden-retriever.jpg"
              alt="Golden retriever enjoying a quiet afternoon outside"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 52vw"
            />
            <span className="photo-label">
              <Heart size={14} /> Good days start with good care.
            </span>
          </div>
          <div className="care-stamp">
            <Heart size={21} />
            <span>
              PERSONAL CARE.
              <br />
              HAPPY TAILS.
            </span>
          </div>
          <div className="photo-update">
            <span className="update-icon">
              <Camera size={21} />
            </span>
            <div>
              <strong>A little update. A lot of reassurance.</strong>
              <span>Photos & messages, while you’re away.</span>
            </div>
            <span className="update-check">
              <Check size={14} />
            </span>
          </div>
        </div>
      </section>
      <div className="shell trust-band">
        {[
          [Heart, "Care built around your pet"],
          [Camera, "Regular photo updates"],
          [House, "Locally & independently owned"],
          [ShieldCheck, "Meet & greets available"],
        ].map(([Icon, text]) => {
          const I = Icon as typeof Heart
          return (
            <div key={String(text)}>
              <I size={19} strokeWidth={1.5} />
              <span>{String(text)}</span>
            </div>
          )
        })}
      </div>
      <section className="shell section" id="services">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A LITTLE HELP. A LOT OF CARE.</span>
            <h2>
              For all the ways
              <br />
              you need to be away.
            </h2>
          </div>
          <p>
            Long weekends. Busy workdays. Everyday life.
            <br />
            Thoughtful care that fits your pet’s world.
          </p>
        </div>
        <div className="featured-services">
          {services.slice(0, 3).map((s, i) => {
            const Icon = icons[s.icon]
            return (
              <Link
                href={`/services/${s.slug}`}
                className="service-card"
                key={s.slug}
              >
                <div className={`service-photo service-photo-${i}`}>
                  <Image
                    src={
                      "image" in s ? s.image : "/images/golden-retriever.jpg"
                    }
                    alt={
                      i === 0
                        ? "An attentive golden retriever"
                        : i === 1
                          ? "A cat relaxing comfortably at home"
                          : "Two dogs enjoying a grassy walking trail"
                    }
                    fill
                    sizes="(max-width: 700px) 100vw, 33vw"
                  />
                  <span className="service-photo-icon">
                    <Icon size={19} />
                  </span>
                </div>
                <div className="service-card-body">
                  <div className="card-title">
                    <h3>{s.name}</h3>
                    <ArrowUpRight size={21} />
                  </div>
                  <p>{s.short}</p>
                  <ul>
                    {s.includes.slice(0, 2).map((item) => (
                      <li key={item}>
                        <Check size={12} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="service-rate">
                    From <strong>{money(s.price!)}</strong> / {s.unit}
                    <span>
                      Explore care <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="more-services">
          {services.slice(3).map((s) => {
            const Icon = icons[s.icon]
            return (
              <Link key={s.slug} href={`/services/${s.slug}`}>
                <Icon size={24} strokeWidth={1.4} />
                <div>
                  <h3>{s.name}</h3>
                  <span>
                    {s.price
                      ? `From ${money(s.price)} / ${s.unit}`
                      : "Let’s find the right fit"}
                  </span>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            )
          })}
        </div>
      </section>
      <section className="how-section" id="how-it-works">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LESS WORRY, FROM THE FIRST HELLO.</span>
              <h2>
                Good care starts
                <br />
                with a conversation.
              </h2>
            </div>
            <Link href="/book" className="text-link">
              Let’s get to know your pet <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="steps">
            {[
              [
                "Tell me what you need",
                "Choose your care, pick your dates, and share a little about your pet.",
              ],
              [
                "Meet. Talk. Make a plan.",
                "We’ll talk through routines, meet when needed, and confirm the details together.",
              ],
              [
                "Go enjoy your day.",
                "Your pet gets personal attention. You get photos, updates, and peace of mind.",
              ],
            ].map(([title, copy], i) => (
              <div key={title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
          <p className="quiet-note">
            No payment to request. No booking confirmed until we’ve talked.
          </p>
        </div>
      </section>
      <section id="about" className="shell section about-section">
        <div className="about-photo">
          <Image
            src="/images/dogs-walking.jpg"
            alt="Two dogs running together along a green path"
            fill
            sizes="(max-width: 760px) 100vw, 45vw"
          />
          <div className="about-photo-caption">
            More sniffing. More sunshine. More good days.
          </div>
        </div>
        <div className="about-copy">
          <span className="eyebrow">
            A NEIGHBOR. A PET PERSON. YOUR SITTER.
          </span>
          <h2>
            Hi, I’m Drew.
            <br />
            <span className="serif-italic">It’s personal to me.</span>
          </h2>
          <p>
            I started Drew’s Pet Care to offer the kind of care I’d want for an
            animal I love: thoughtful, reliable, and built around the little
            things that make them feel at home.
          </p>
          <p>
            Right now, I personally handle every visit and stay. That means a
            familiar face for your pet, clear communication for you, and someone
            who takes the feeding notes seriously.
          </p>
          <div className="founder-signature">
            Drew <Heart size={22} strokeWidth={1.2} />
          </div>
          <span className="founder-label">FOUNDER & YOUR LOCAL PET SITTER</span>
          <Link href="/contact" className="text-link">
            Say hello <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section id="service-area" className="area-section">
        <div className="shell area-grid">
          <div>
            <span className="eyebrow">CLOSE TO HOME.</span>
            <h2>
              Local care.
              <br />
              Neighboring communities.
            </h2>
            <p>
              Based in Fox River Grove and caring for pets
              <br className="wide-only" /> throughout the surrounding area.
            </p>
            <Link href="/contact" className="text-link">
              Not sure if you’re in range? Ask. <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="area-list">
            {locations.map((l, i) => (
              <Link href={`/locations/${l.slug}`} key={l.slug}>
                <span>
                  {i === 0 ? (
                    <MapPin size={17} />
                  ) : (
                    <span className="area-dot" />
                  )}
                  {l.name}
                </span>
                {i === 0 ? (
                  <small>HOME BASE</small>
                ) : (
                  <ArrowUpRight size={16} />
                )}
              </Link>
            ))}
            <span className="area-footnote">
              And nearby neighborhoods. Let’s see what works.
            </span>
          </div>
        </div>
      </section>
      <section id="rates" className="shell section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CLEAR PRICING. NO SURPRISES.</span>
            <h2>
              A little clarity
              <br />
              before you make plans.
            </h2>
          </div>
          <p>
            Simple starting rates. A personal quote
            <br />
            before anything is confirmed.
          </p>
        </div>
        <div className="rates-grid">
          {[
            {
              title: "Overnight care",
              price: "$55",
              unit: "/ night",
              copy: "House sitting in the comfort of your home.",
              extra: "Puppy overnights from $60",
              slug: "house-sitting",
            },
            {
              title: "Drop-ins & walks",
              price: "$22",
              unit: "/ 30 min",
              copy: "A welcome visit or a walk around the neighborhood.",
              extra: "60-minute visits or walks from $35",
              slug: "drop-ins",
            },
            {
              title: "Daycare & boarding",
              price: "Let’s talk",
              unit: "",
              copy: "The right setting and care plan for your pet.",
              extra: "Personally quoted after we connect",
              slug: "boarding",
            },
          ].map((r) => (
            <div className="rate-card" key={r.title}>
              <h3>{r.title}</h3>
              <div className="rate-price">
                {r.price}
                <span>{r.unit}</span>
              </div>
              <p>{r.copy}</p>
              <small>{r.extra}</small>
              <Link href={`/book?service=${r.slug}`} className="text-link">
                Request exact pricing <ArrowUpRight size={16} />
              </Link>
            </div>
          ))}
        </div>
        <p className="pricing-note">
          Rates may vary for holidays, puppies, additional pets, or special care
          needs. Your final price is always agreed in advance.
        </p>
      </section>
      <section id="reviews" className="shell review-section">
        <Heart size={28} strokeWidth={1.3} />
        <span className="eyebrow">TRUST IS EARNED, ONE VISIT AT A TIME.</span>
        {testimonials.length ? (
          testimonials.map((t) => (
            <blockquote key={t.name}>
              <p>“{t.quote}”</p>
              <cite>
                {t.name}
                {t.petName && ` · ${t.petName}’s person`}
              </cite>
            </blockquote>
          ))
        ) : (
          <>
            <h2>
              Your pet’s next chapter.
              <br />
              Our first stories together.
            </h2>
            <p>
              Drew’s Pet Care is growing locally. Real client stories will
              appear here
              <br className="wide-only" /> as they’re shared—with permission, in
              their own words.
            </p>
            <Link href="/book" className="text-link">
              Start with a meet & greet <ArrowRight size={16} />
            </Link>
          </>
        )}
      </section>
      <section id="faq" className="shell section faq-section">
        <div>
          <span className="eyebrow">A FEW THINGS YOU MIGHT WONDER.</span>
          <h2>
            Good questions.
            <br />
            Straight answers.
          </h2>
          <p>Something else on your mind?</p>
          <Link href="/contact" className="text-link">
            I’m happy to help <ArrowUpRight size={16} />
          </Link>
        </div>
        <FAQ />
      </section>
      <FinalCTA />
    </>
  )
}
