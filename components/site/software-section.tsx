import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "@/components/site/arrows"
import {
  portfolioUrl,
  softwareProjects,
  type SoftwareProject,
} from "@/lib/software-projects"
import styles from "./software.module.css"

export function SoftwareProjectCard({
  project,
  headingLevel = "h3",
}: {
  project: SoftwareProject
  headingLevel?: "h2" | "h3"
}) {
  const Heading = headingLevel
  return (
    <a href={project.href} className={styles.projectCard}>
      <span className={styles.projectCategory}>{project.category}</span>
      <Heading className={styles.projectName}>{project.name}</Heading>
      <p>{project.description}</p>
      <span className={styles.projectDomain}>
        {project.domain}
        <ArrowUpRight size={15} />
      </span>
    </a>
  )
}

/** A quiet homepage strip pointing to /software. Pet care stays primary. */
export function SoftwareSection() {
  return (
    <section
      className={`shell ${styles.homeSection}`}
      aria-labelledby="software-section-title"
    >
      <div className={styles.homeIntro}>
        <span className="eyebrow">ALSO BY DREW</span>
        <h2 id="software-section-title" className={styles.homeTitle}>
          I build software, too.
        </h2>
        <p>
          Away from pet care, I make websites, voice agents, and other software.
          Here are a few of my projects.
        </p>
        <Link href="/software" className="text-link">
          Software & websites <ArrowRight size={16} />
        </Link>
        <a href={portfolioUrl} className="text-link">
          View my full portfolio <ArrowUpRight size={16} />
        </a>
      </div>
      <ul className={styles.homeList}>
        {softwareProjects.map((project) => (
          <li key={project.name}>
            <a href={project.href}>
              <span>
                <strong>{project.name}</strong>
                <small>{project.category}</small>
              </span>
              <ArrowUpRight size={16} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
