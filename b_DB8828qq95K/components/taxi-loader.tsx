"use client"

import { Car } from "lucide-react"

interface TaxiLoaderProps {
  message?: string
}

export function TaxiLoader({ message = "Finding you a driver..." }: TaxiLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative">
        {/* Road */}
        <div className="h-2 w-48 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
        </div>
        
        {/* Taxi */}
        <div className="absolute -top-8 left-0 animate-[taxi-drive_2s_ease-in-out_infinite]">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary shadow-lg">
              <Car className="h-6 w-6 text-secondary-foreground" />
            </div>
            {/* Taxi light */}
            <div className="absolute -top-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes taxi-drive {
          0%, 100% {
            left: 0;
            transform: translateX(0);
          }
          50% {
            left: 100%;
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  )
}
