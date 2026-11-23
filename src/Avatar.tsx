/** A reader's photo, or the initial of their name when there is none. */
export function Avatar({ name, image, size }: { name: string; image: string | null; size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden bg-well font-pixel text-xl text-ivory"
    >
      {image ? (
        <img src={image} alt="" width={size} height={size} className="size-full object-cover" />
      ) : (
        ([...name.trim()][0]?.toUpperCase() ?? '')
      )}
    </span>
  )
}
