import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import api, { getImageUrl } from '../../shared/config/api'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'

const Home = () => {
  const [products, setProducts] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(1) 
  const [prevBannerIndex, setPrevBannerIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState('right') 
  const currentIndexRef = useRef(1)
  const sliderRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const originalBannerImages = useMemo(() => {
    if (settings?.banner?.images && Array.isArray(settings.banner.images) && settings.banner.images.length > 0) {
      return settings.banner.images
    }
    if (settings?.banner?.image) {
      return [settings.banner.image]
    }
    return []
  }, [settings?.banner?.images, settings?.banner?.image])

  const bannerImages = useMemo(() => {
    if (originalBannerImages.length <= 1) {
      return originalBannerImages
    }
    return [
      originalBannerImages[originalBannerImages.length - 1], 
      ...originalBannerImages,
      originalBannerImages[0] 
    ]
  }, [originalBannerImages])

  useEffect(() => {
    currentIndexRef.current = currentBannerIndex
  }, [currentBannerIndex])

  useEffect(() => {
    if (originalBannerImages.length <= 1) return

    const totalImages = bannerImages.length
    const realImagesCount = originalBannerImages.length

    const handleTransitionEnd = () => {
      if (!sliderRef.current) return

      if (currentBannerIndex === 0) {
        sliderRef.current.style.transition = 'none'
        sliderRef.current.style.transform = `translateX(-${realImagesCount * 100}vw)`
        void sliderRef.current.offsetWidth
        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.style.transition = ''
            setCurrentBannerIndex(realImagesCount)
          }
        }, 10)
      }
      else if (currentBannerIndex === totalImages - 1) {
        sliderRef.current.style.transition = 'none'
        sliderRef.current.style.transform = `translateX(-${1 * 100}vw)`
        void sliderRef.current.offsetWidth
        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.style.transition = ''
            setCurrentBannerIndex(1)
          }
        }, 10)
      }
    }

    const slider = sliderRef.current
    if (slider) {
      slider.addEventListener('transitionend', handleTransitionEnd)
      return () => {
        slider.removeEventListener('transitionend', handleTransitionEnd)
      }
    }
  }, [currentBannerIndex, originalBannerImages.length, bannerImages.length])

  useEffect(() => {
    if (originalBannerImages.length <= 1) {
      setCurrentBannerIndex(0)
      setPrevBannerIndex(0)
      currentIndexRef.current = 0
      return
    }

    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;

      setSlideDirection('right')
      setPrevBannerIndex(currentIndexRef.current)
      setCurrentBannerIndex((prev) => {
        const next = prev + 1
        currentIndexRef.current = next
        return next
      })
    }, 5000) 

    return () => clearInterval(interval)
  }, [originalBannerImages.length])

  useEffect(() => {
    if (originalBannerImages.length > 1) {
      setCurrentBannerIndex(1) 
      setPrevBannerIndex(0)
      setSlideDirection('right')
      currentIndexRef.current = 1
    } else {
      setCurrentBannerIndex(0)
      setPrevBannerIndex(0)
      currentIndexRef.current = 0
    }
  }, [originalBannerImages.length])

  const fetchData = async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        api.get('/products?limit=12'),
        api.get('/settings')
      ])

      setProducts(productsRes.data)
      setSettings(settingsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  const goToBanner = (index) => {
    if (originalBannerImages.length <= 1) return
    const carouselIndex = index + 1
    if (carouselIndex === currentBannerIndex) return
    const direction = carouselIndex > currentBannerIndex ? 'right' : 'left'
    setSlideDirection(direction)
    setPrevBannerIndex(currentBannerIndex)
    setCurrentBannerIndex(carouselIndex)
  }

  const goToNextBanner = () => {
    if (originalBannerImages.length <= 1) return
    setSlideDirection('right')
    setPrevBannerIndex(currentBannerIndex)
    setCurrentBannerIndex((prev) => prev + 1)
  }

  const goToPrevBanner = () => {
    if (originalBannerImages.length <= 1) return
    setSlideDirection('left')
    setPrevBannerIndex(currentBannerIndex)
    setCurrentBannerIndex((prev) => prev - 1)
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {bannerImages.length > 0 ? (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <div 
                ref={sliderRef}
                className="banner-slider-container"
                style={{
                  width: `${bannerImages.length * 100}vw`,
                  transform: `translateX(-${currentBannerIndex * 100}vw)`
                }}
              >
                {bannerImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="banner-slide-item"
                    style={{
                      backgroundImage: `url(${getImageUrl(image)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100vw',
                      minWidth: '100vw'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {bannerImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevBanner}
                  className="absolute left-4 md:left-8 z-20 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-full group"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNextBanner}
                  className="absolute right-4 md:right-8 z-20 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-full group"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {originalBannerImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {originalBannerImages.map((_, index) => {
                  const isActive = (currentBannerIndex - 1) === index || 
                                   (currentBannerIndex === 0 && index === originalBannerImages.length - 1) ||
                                   (currentBannerIndex === bannerImages.length - 1 && index === 0)
                  return (
                    <button
                      key={index}
                      onClick={() => goToBanner(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        )}
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-6 animate-fade-in">
            {settings?.banner?.title || 'A S Gems'}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-12 tracking-wide max-w-2xl mx-auto">
            {settings?.banner?.description || 'Authentic Rare Natural Gemstones & Exquisite Jewelry'}
          </p>
          <Link
            to="/products"
            className="inline-block border-2 border-white text-white px-12 py-4 text-sm tracking-widest uppercase font-light hover:bg-white hover:text-black transition-all duration-300"
          >
            Our Collection
          </Link>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-baseline mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-black">Our Collection</h2>
            <Link
              to="/products"
              className="text-sm tracking-widest uppercase font-light text-black border-b border-black/20 hover:border-black transition-colors duration-300"
            >
              Explore All
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-24 font-light">No products available at the moment</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
