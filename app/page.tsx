import { ArrowRight, ArrowUpRight } from "@/components/site/arrows"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Heart, House, Sun, Footprints, Moon, Cat } from "lucide-react"
import { services, locations, testimonials, money } from "@/lib/content"
import { PhotoGallery } from "@/components/site/photo-gallery"
import { aboutPhoto } from "@/lib/gallery"
import { FAQ, FinalCTA } from "@/components/site/shared"
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
      <section className="shell hero">
        <div className="hero-copy">
          <span className="eyebrow">YOUR LOCAL PET PERSON</span>
          <h1>
            Good care. Familiar routines.
            <br />
            <span className="serif-italic">Personally, by Drew.</span>
          </h1>
          <p>
            More walks, more belly rubs, less worry while you’re away. I’m
            Drew, your local pet sitter and dog walker in Fox River Grove,
            Cary, and nearby towns.
          </p>
          <div className="hero-buttons">
            <Button
              nativeButton={false}
              render={<Link href="/book" />}
              className="site-button"
              size="lg"
            >
              Check availability <ArrowUpRight size={18} />
            </Button>
            <Link href="#services" className="text-link">
              Explore services <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-local">
            <MapPin size={17} />
            <span>Fox River Grove & nearby communities</span>
          </div>
        </div>
        <figure className="hero-visual">
          <div className="hero-image">
            <Image
              src="/images/drew-walking-with-dog.jpg"
              alt="Drew spending time with a dog outdoors"
              fill
              preload
              sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) 90vw, 960px"
            />
          </div>
          <figcaption className="hero-caption">
            <span>A familiar face. A little fresh air.</span>
            <span>Care personally by Drew.</span>
          </figcaption>
        </figure>
      </section>
      <section className="shell section" id="services">
        <div className="section-heading">
          <div>
            <h2>A little help with your pet’s day.</h2>
          </div>
          <p>
            Dog walks, drop-ins, and overnight stays, planned around the way
            your pet is used to being cared for.
          </p>
        </div>
        <div className="featured-services">
          {services.slice(0, 3).map((s) => {
            return (
              <Link
                href={`/services/${s.slug}`}
                className="service-card"
                key={s.slug}
              >
                <div className="service-photo">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    width={s.imageWidth}
                    height={s.imageHeight}
                    sizes="(max-width: 700px) 100vw, 33vw"
                    style={{ objectPosition: s.imagePosition }}
                  />
                </div>
                <div className="service-card-body">
                  <div className="card-title">
                    <h3>{s.name}</h3>
                    <ArrowUpRight size={21} />
                  </div>
                  <p>{s.short}</p>
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
      <section id="rates" className="shell section">
        <div className="section-heading">
          <div>
            <h2>What does care cost?</h2>
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
            <h2>Get to know your sitter first.</h2>
            <p>
              You’ll speak directly with me before confirming care. We can
              arrange a meet & greet so you and your pets feel comfortable. I’m
              happy to answer questions before you decide.
            </p>
            <Link href="/book" className="text-link">
              Start with a meet & greet <ArrowRight size={16} />
            </Link>
          </>
        )}
      </section>
      <section className="how-section" id="how-it-works">
        <div className="shell">
          <div className="section-heading">
            <div>
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
              ["Request care", "Send your dates and a little about your pets."],
              ["I’ll contact you", "We’ll talk by phone, text, or email."],
              [
                "Meet if needed",
                "A chance for you and your pets to get comfortable.",
              ],
              ["Confirm together", "We’ll agree on care, dates, and price."],
              [
                "Stay in the loop",
                "Receive photos and updates while you’re away.",
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
            src={aboutPhoto.src}
            alt={aboutPhoto.alt}
            width={aboutPhoto.width}
            height={aboutPhoto.height}
            sizes="(max-width: 760px) 100vw, 45vw"
          />
        </div>
        <div className="about-copy">
          <h2>
            Hi, I’m Drew.
            <br />
            <span className="serif-italic">It’s personal to me.</span>
          </h2>
          <p>
            I started Drew’s Pet Care to give local pets steady, familiar care.
            I follow their routines, take note of the small details, and make
            sure you know how things are going.
          </p>
          <p>
            I personally handle every visit and stay. That means a familiar face
            for your pet, clear communication for you, and someone who takes the
            feeding notes seriously.
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
      <section
        className="shell section photo-gallery"
        aria-labelledby="photo-gallery-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="photo-gallery-title">A few familiar faces.</h2>
          </div>
          <p>
            Every pet has their own little routines, favorite spots, and way of
            settling in.
          </p>
        </div>
        <PhotoGallery />
      </section>
      <section id="service-area" className="area-section">
        <div className="shell area-grid">
          <div>
            <h2>Pet care near Fox River Grove.</h2>
            <p>
              Based in Fox River Grove and caring for pets
              <br className="wide-only" /> throughout the surrounding area.
            </p>
            <Link href="/locations" className="text-link">
              Explore the service area <ArrowUpRight size={17} />
            </Link>
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
      <section id="faq" className="shell section faq-section">
        <div>
          <h2>A few things you might be wondering.</h2>
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
