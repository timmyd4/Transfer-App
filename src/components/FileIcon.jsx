// A simple document-shaped icon, tinted by file category
// (image / video / audio / document / archive / generic).
export default function FileIcon({ category = 'generic', size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`file-icon file-icon-${category}`}
      aria-hidden="true"
    >
      <path
        d="M6 2h8l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M6 2h8l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M14 2v5h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
