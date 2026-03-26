'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MapPin, CalendarIcon, Clock, Search } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { AmbulanceType } from '@/lib/data/types'

interface SearchFormProps {
  variant?: 'hero' | 'compact'
  defaultValues?: {
    pickup?: string
    drop?: string
    date?: Date
    time?: string
    type?: AmbulanceType | 'all'
  }
}

export function SearchForm({ variant = 'hero', defaultValues }: SearchFormProps) {
  const router = useRouter()
  const [pickup, setPickup] = useState(defaultValues?.pickup || '')
  const [drop, setDrop] = useState(defaultValues?.drop || '')
  const [date, setDate] = useState<Date | undefined>(defaultValues?.date)
  const [time, setTime] = useState(defaultValues?.time || '')
  const [ambulanceType, setAmbulanceType] = useState<AmbulanceType | 'all'>(
    defaultValues?.type || 'all'
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (pickup) params.set('pickup', pickup)
    if (drop) params.set('drop', drop)
    if (date) params.set('date', format(date, 'yyyy-MM-dd'))
    if (time) params.set('time', time)
    if (ambulanceType !== 'all') params.set('type', ambulanceType)
    
    router.push(`/search?${params.toString()}`)
  }

  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6
    const minute = i % 2 === 0 ? '00' : '30'
    const time24 = `${String(hour).padStart(2, '0')}:${minute}`
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return { value: time24, label: `${hour12}:${minute} ${ampm}` }
  })

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <Label htmlFor="pickup-compact" className="sr-only">Pickup Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="pickup-compact"
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="min-w-[180px] flex-1">
          <Label htmlFor="drop-compact" className="sr-only">Drop Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="drop-compact"
              placeholder="Drop location"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMM d") : "Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSearch} className="w-full space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pickup">Pickup Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="pickup"
              placeholder="Hospital, home address, or area"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="drop">Drop Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="drop"
              placeholder="Destination hospital or address"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="w-full">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Ambulance Type</Label>
          <Select value={ambulanceType} onValueChange={(v) => setAmbulanceType(v as AmbulanceType | 'all')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="basic">Basic Transport</SelectItem>
              <SelectItem value="oxygen">Oxygen Support</SelectItem>
              <SelectItem value="icu">ICU / Critical Care</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full gap-2">
        <Search className="h-5 w-5" />
        Search Available Ambulances
      </Button>
    </form>
  )
}
