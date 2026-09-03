const items = ['♡', '✿', '♡', '❀', '♡', '✦', '♡', '✿', '♡', '❀']

export default function FloatingDecor() {
  return (
    <div className="floating-decor" aria-hidden="true">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="floating-item"
          style={{
            '--left': `${7 + ((index * 9.6) % 88)}%`,
            '--delay': `${(index % 5) * -1.35}s`,
            '--duration': `${7 + (index % 4) * 1.3}s`,
            '--size': `${16 + (index % 4) * 5}px`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}
