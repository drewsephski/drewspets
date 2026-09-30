"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "@/components/site/arrows"
import { galleryPhotos } from "@/lib/gallery"

const batchSize = 8

export function PhotoGallery() {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const shownCount = Math.min(visibleCount, galleryPhotos.length)

  return (
    <>
      <div className="photo-gallery-grid" id="pet-photos">
        {galleryPhotos.slice(0, shownCount).map((photo) => (
          <figure className="photo-gallery-item" key={photo.src}>
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 700px) 50vw, (max-width: 1000px) 50vw, 25vw"
              style={{ objectPosition: photo.position }}
            />
          </figure>
        ))}
      </div>
      <div className="gallery-actions">
        <p aria-live="polite" aria-atomic="true">
          {shownCount} of {galleryPhotos.length} photos
        </p>
        {shownCount < galleryPhotos.length && (
          <Button
            variant="outline"
            size="lg"
            aria-controls="pet-photos"
            onClick={() => setVisibleCount((count) => count + batchSize)}
          >
            Show more photos <ArrowRight size={18} />
          </Button>
        )}
      </div>
    </>
  )
}
