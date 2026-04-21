import { Link } from 'react-router-dom'

const ClaimSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white max-w-lg w-full p-12 text-center animate-slide-down shadow-2xl relative border border-black/5">
        {/* Decorative Gemstone Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-6">
          Thank You
        </h2>
        
        <p className="text-lg text-black/70 font-light tracking-wide mb-8 leading-relaxed">
          Your gemstone claim has been received. Our team will contact you soon for payment and delivery details.
        </p>

        <div className="space-y-4">
          <button
            onClick={onClose}
            className="block w-full bg-black text-white px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black/90 transition-all duration-300 shadow-md"
          >
            Continue Browsing
          </button>
          
          <Link
            to="/"
            className="block w-full text-black/40 hover:text-black text-xs tracking-widest uppercase font-light transition-colors duration-300"
            onClick={onClose}
          >
            Back to Home
          </Link>
        </div>

        {/* Subtle Accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
      </div>
    </div>
  )
}

export default ClaimSuccessModal
