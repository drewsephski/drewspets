import { useId, useState, type ComponentProps } from "react"
import { format, parseISO } from "date-fns"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea as TextareaControl } from "@/components/ui/textarea"
import {
  Select as SelectControl,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FieldMeta = { label: string; hint?: string }

export function Field({ label, hint, ...props }: ComponentProps<typeof Input> & FieldMeta) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="field">
      <label htmlFor={id}>{label}{props.required ? " *" : ""}</label>
      <Input id={id} aria-describedby={hint ? hintId : undefined} {...props} />
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  )
}

export function Textarea({ label, hint, ...props }: ComponentProps<typeof TextareaControl> & FieldMeta) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="field">
      <label htmlFor={id}>{label}{props.required ? " *" : ""}</label>
      <TextareaControl id={id} aria-describedby={hint ? hintId : undefined} {...props} />
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  )
}

export function Select({
  label,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
}: {
  label: string
  name: string
  options: readonly { value: string; label: string }[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | null) => void
  required?: boolean
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required ? " *" : ""}</label>
      <SelectControl
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        required={required}
        items={options}
      >
        <SelectTrigger id={id} className="field-select">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectControl>
    </div>
  )
}

export function DateField({
  label,
  name,
  value,
  onChange,
  min,
  required,
}: {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  min: string
  required?: boolean
}) {
  const labelId = useId()
  const [open, setOpen] = useState(false)
  const selected = value ? parseISO(value) : undefined
  const minDate = parseISO(min)

  return (
    <div className="field">
      <span id={labelId}>{label}{required ? " *" : ""}</span>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="date-trigger"
              aria-labelledby={labelId}
              aria-required={required}
            />
          }
        >
          {selected ? format(selected, "MMM d, yyyy") : "Choose a date"}
          <CalendarDays aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? minDate}
            disabled={{ before: minDate }}
            onSelect={(date) => {
              if (!date) return
              onChange(format(date, "yyyy-MM-dd"))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function Honeypot() {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Leave this empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
