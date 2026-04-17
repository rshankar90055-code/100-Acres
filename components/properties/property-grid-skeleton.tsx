import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function PropertyGridSkeleton() {
  return (
    <div>
      {/* Results Count Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Property Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            {/* Image Skeleton */}
            <Skeleton className="aspect-[4/3] w-full" />
            
            {/* Content Skeleton */}
            <CardContent className="p-4">
              {/* Badge */}
              <Skeleton className="mb-2 h-5 w-20" />
              
              {/* Title */}
              <Skeleton className="mb-2 h-6 w-full" />
              
              {/* Location */}
              <Skeleton className="mb-4 h-4 w-3/4" />
              
              {/* Features */}
              <div className="mb-4 flex gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              
              {/* Button */}
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
