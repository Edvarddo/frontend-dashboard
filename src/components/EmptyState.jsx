export default function EmptyState({ Image, title, description }) {
  return (
    <div className="w-full rounded-lg border border-border bg-muted/50 flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-background p-6 mb-4">
        <Image className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[500px]">
        {description}
      </p>
    </div>
  )
}