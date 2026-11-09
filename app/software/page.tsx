import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "@/components/site/arrows"
import { Breadcrumbs, PageIntro } from "@/components/site/shared"
import { SoftwareProjectCard } from "@/components/site/software-section"
import styles from "@/components/site/software.module.css"
import { SoftwareInquiryForm } from "@/components/forms/software-inquiry-form"
import {
  portfolioUrl,
  softwareProjects,
  softwareServices,
} from "@/lib/software-projects"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata(
  "Software & Websites by Drew",
  "Websites, voice agents, and other software built by Drew. See a few projects and send a short, no-commitment inquiry.",
  "/software"
)

export default function Software() {
  return (
    <div className="shell inner-page">
      <Breadcrumbs name="Software & websites" path="/software" />
      <PageIntro
        title="Software & websites, built by Drew."
        description="Alongside pet care, I build websites, voice agents, and other software. Here are a few of my projects and the kinds of work I can help with."
      />

      <section
        className={styles.pageSection}
        aria-labelledby="software-projects-title"
      >
        <div className="section-heading">
          <h2 id="software-projects-title">A few things I’ve made.</h2>
          <p>Each one links to the project’s own site.</p>
        </div>
        <div className={styles.projectGrid}>
          {softwareProjects.map((project) => (
            <SoftwareProjectCard key={project.name} project={project} />
          ))}
        </div>
        <p className={styles.portfolioLink}>
          <a href={portfolioUrl} className="text-link">
            View my full portfolio at drewsepeczi.xyz <ArrowUpRight size={16} />
          </a>
        </p>
      </section>

      <section
        className={styles.pageSection}
        aria-labelledby="software-services-title"
      >
        <div className="section-heading">
          <h2 id="software-services-title">Where I can help.</h2>
          <p>Every project starts with a conversation about what you need.</p>
        </div>
        <ul className={styles.serviceList}>
          {softwareServices.map((service, i) => (
            <li key={service.title}>
              <span className="step-number" aria-hidden="true">
                0{i + 1}
              </span>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="inquire"
        className={styles.inquireSection}
        aria-labelledby="software-inquire-title"
      >
        <div className={styles.inquireIntro}>
          <span className="eyebrow">SAY HELLO</span>
          <h2 id="software-inquire-title">Have something in mind?</h2>
          <p>
            Tell me a little about your business or idea. I’ll read it myself
            and reply by email. Asking doesn’t commit you to anything.
          </p>
          <p className={styles.inquireAside}>
            Looking for pet care instead?{" "}
            <Link href="/book" className="text-link">
              Request care <ArrowRight size={14} />
            </Link>
          </p>
        </div>
        <div className={styles.inquireForm}>
          <SoftwareInquiryForm />
        </div>
      </section>
    </div>
  )
}
