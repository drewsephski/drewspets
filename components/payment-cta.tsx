import { cn } from "cn"

type PaymentCTAProps = {
  variant?: "button" | "text-link"
  text?: string
  className?: string
}

export function PaymentCTA({
  variant = "button",
  text = "Pay now",
  className,
}: PaymentCTAProps) {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim()

  // Keep unconfigured payment links out of the page.
  if (!paymentLink) return null

  return (
    <a
      href={paymentLink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(variant === "button" ? "button" : "text-link", className)}
    >
      <span>
        {text}
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
    </a>
  )
}
