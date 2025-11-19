import React, { useEffect } from 'react'

export default function GalleryModal({ open, index=0, images=[], onClose, onPrev, onNext }) {
  useEffect(() => {
    function onKey(e) {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, onPrev, onNext])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <button aria-label="Close" onClick={onClose} className="absolute top-6 right-6 text-white bg-transparent border border-gold rounded-full w-10 h-10 flex items-center justify-center">×</button>
      <button aria-label="Prev" onClick={onPrev} className="absolute left-6 text-white border border-gold rounded-full w-10 h-10 flex items-center justify-center">◀</button>
      <div className="max-w-6xl w-full px-6">
        <img src={images[index]} alt={`modal-${index}`} className="w-full h-[70vh] object-contain rounded-lg" />
      </div>
      <button aria-label="Next" onClick={onNext} className="absolute right-6 text-white border border-gold rounded-full w-10 h-10 flex items-center justify-center">▶</button>
    </div>
  )
}
