interface YouTubeEmbedProps {
  url: string
  title: string
}

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    // https://www.youtube.com/watch?v=ID
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v')
    }
    // https://youtu.be/ID
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1)
    }
    // https://www.youtube.com/embed/ID
    if (parsed.pathname.startsWith('/embed/')) {
      return parsed.pathname.split('/embed/')[1]
    }
  } catch {
    // URL inválida
  }
  return null
}

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const videoId = extractVideoId(url)

  if (!videoId) return null

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={`Vídeo demonstração: ${title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  )
}
