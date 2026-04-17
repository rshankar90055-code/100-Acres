'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Maximize, ImageIcon, Play, Pause, Video } from 'lucide-react'

interface PropertyGalleryProps {
  images: string[]
  title: string
  videoUrl?: string | null
}

export function PropertyGallery({ images, title, videoUrl }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Combine video with images for navigation
  const hasVideo = !!videoUrl
  const totalMedia = images.length + (hasVideo ? 1 : 0)

  // Determine if YouTube video
  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be')
  
  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = ''
    if (url.includes('youtube.com/watch')) {
      videoId = url.split('v=')[1]?.split('&')[0] || ''
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`
  }

  if (images.length === 0 && !hasVideo) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-muted">
        <div className="text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">No images available</p>
        </div>
      </div>
    )
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % totalMedia)
  }

  const goToPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + totalMedia) % totalMedia)
  }

  // Determine if current index is the video
  const isCurrentVideo = hasVideo && selectedIndex === 0
  const imageIndex = hasVideo ? selectedIndex - 1 : selectedIndex

  return (
    <>
      {/* Main Gallery */}
      <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
        {/* Main Image/Video */}
        <button
          onClick={() => {
            setSelectedIndex(hasVideo ? 1 : 0)
            setShowVideo(false)
            setIsOpen(true)
          }}
          className="group relative col-span-full row-span-full overflow-hidden rounded-xl md:col-span-3 md:row-span-2"
        >
          <img
            src={images[0] || '/placeholder-property.jpg'}
            alt={`${title} - Main`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ aspectRatio: '16/9' }}
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize className="h-4 w-4" />
            View all {totalMedia} {hasVideo ? 'media' : 'photos'}
          </div>
        </button>

        {/* Video Thumbnail */}
        {hasVideo && (
          <button
            onClick={() => {
              setSelectedIndex(0)
              setShowVideo(true)
              setIsOpen(true)
            }}
            className="group relative hidden overflow-hidden rounded-xl md:block"
          >
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
              <div className="flex flex-col items-center gap-2 text-primary">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Watch Video</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </button>
        )}

        {/* Thumbnail Grid */}
        {images.slice(1, hasVideo ? 3 : 4).map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedIndex(hasVideo ? index + 2 : index + 1)
              setShowVideo(false)
              setIsOpen(true)
            }}
            className="group relative hidden overflow-hidden rounded-xl md:block"
          >
            <img
              src={image}
              alt={`${title} - ${index + 2}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ aspectRatio: '4/3' }}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            {index === (hasVideo ? 1 : 2) && images.length > (hasVideo ? 3 : 4) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <span className="text-lg font-semibold">+{images.length - (hasVideo ? 3 : 4)}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Video Button for Mobile */}
      {hasVideo && (
        <Button
          onClick={() => {
            setSelectedIndex(0)
            setShowVideo(true)
            setIsOpen(true)
          }}
          className="mt-4 w-full gap-2 md:hidden"
          variant="outline"
        >
          <Video className="h-5 w-5" />
          Watch Property Video
        </Button>
      )}

      {/* Lightbox */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl border-none bg-black/95 p-0">
          <div className="relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-10 text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image or Video */}
            <div className="relative flex items-center justify-center">
              {showVideo && hasVideo ? (
                <div className="aspect-video w-full">
                  {isYouTube ? (
                    <iframe
                      src={getYouTubeEmbedUrl(videoUrl)}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      className="h-full w-full object-contain"
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ) : (
                <img
                  src={images[imageIndex] || images[0]}
                  alt={`${title} - ${imageIndex + 1}`}
                  className="max-h-[80vh] w-full object-contain"
                />
              )}
            </div>

            {/* Navigation */}
            {totalMedia > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    goToPrev()
                    setShowVideo(hasVideo && (selectedIndex - 1 + totalMedia) % totalMedia === 0)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    goToNext()
                    setShowVideo(hasVideo && (selectedIndex + 1) % totalMedia === 0)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
              {showVideo ? 'Video' : `${imageIndex + 1} / ${images.length}`}
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex justify-center gap-2 overflow-x-auto px-4 pb-4">
              {/* Video thumbnail in lightbox */}
              {hasVideo && (
                <button
                  onClick={() => {
                    setSelectedIndex(0)
                    setShowVideo(true)
                  }}
                  className={`flex h-16 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 transition-colors ${
                    showVideo
                      ? 'border-white'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  } bg-primary/20`}
                >
                  <Play className="h-6 w-6 text-primary" />
                </button>
              )}
              {/* Image thumbnails */}
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedIndex(hasVideo ? index + 1 : index)
                    setShowVideo(false)
                  }}
                  className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    !showVideo && imageIndex === index
                      ? 'border-white'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
