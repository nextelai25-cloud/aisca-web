'use client'

import React, { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Container } from '@/components/layout/Container'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ArrowLeft, CheckCircle, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function WristbandPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'event_pickup'>('event_pickup')
  const [quantity, setQuantity] = useState(1)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState<any>(null)

  const productPrice = 400
  const deliveryFee = deliveryMethod === 'delivery' ? 350 : 0
  const totalAmount = productPrice * quantity + deliveryFee

  const images = [
    '/products/Wrist band.webp',
    'gradient-placeholder-1',
    'gradient-placeholder-2'
  ]

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 10) val = val.slice(0, 10)
    
    if (val.length > 6) {
      val = `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6)}`
    } else if (val.length > 3) {
      val = `${val.slice(0, 3)} ${val.slice(3)}`
    }
    setPhone(val)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (deliveryMethod === 'delivery' && !address) {
      setError('Please provide a delivery address.')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: 'aisca-wristband',
          product_name: 'AISCA Wristband Black Edition',
          size: null,
          quantity: quantity,
          unit_price: productPrice,
          delivery_method: deliveryMethod,
          customer_name: fullName,
          customer_address: deliveryMethod === 'delivery' ? address : null,
          customer_phone: phone.replace(/\s/g, '')
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setOrderSuccess(data)
      } else {
        setError(data.error || 'Failed to place order. Please try again.')
      }
    } catch (err: any) {
      setError('Failed to contact server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main className="product-page-wrapper" style={{ flex: 1, background: '#080808', paddingTop: '120px', paddingBottom: '80px', paddingLeft: '40px', paddingRight: '40px' }}>
        <Container>
          {/* Back button */}
          <Link href="/#products" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-all text-xs tracking-wider uppercase mb-8">
            <ArrowLeft size={14} />
            <span>Back to Merchandise</span>
          </Link>

          <AnimatePresence mode="wait">
            {!orderSuccess ? (
              <motion.div 
                key="order-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
              >
                {/* Left Side: Images */}
                <div className="lg:col-span-6 space-y-6">
                  <div 
                    className="w-full overflow-hidden bg-[#111] rounded-2xl h-[300px] md:h-[500px]"
                    style={{
                      borderRadius: '16px',
                      background: '#111',
                      overflow: 'hidden'
                    }}
                  >
                    {images[selectedImage].startsWith('/') ? (
                      <img 
                        src={images[selectedImage]} 
                        alt="AISCA Wristband Black Edition"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain'
                        }} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-white/[0.02]">
                        <span className="text-white/10 font-bold text-4xl mb-2 font-display">AISCA CREST</span>
                        <span className="text-white/30 text-xs uppercase tracking-widest">Detail View Placeholder {images[selectedImage].slice(-1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        style={{
                          border: selectedImage === i ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)'
                        }}
                        className={`aspect-square w-full rounded-xl transition-all overflow-hidden bg-white/[0.02]`}
                      >
                        {img.startsWith('/') ? (
                          <img src={img} alt="Thumbnail" className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/20 uppercase">
                            View {img.slice(-1)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side: Details & Form */}
                <div className="lg:col-span-6 space-y-8" style={{ maxWidth: '500px', width: '100%' }}>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] font-bold text-white/50 uppercase">Official Merchandise</span>
                    <h1 style={{
                      fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                      fontWeight: '800',
                      color: '#ffffff',
                      lineHeight: '1.1',
                      marginBottom: '12px',
                      letterSpacing: '-0.02em'
                    }}>
                      AISCA Wristband Black Edition
                    </h1>
                    <div className="flex items-center gap-4 mt-3">
                      <p style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#ffffff',
                        marginBottom: '16px'
                      }}>LKR 400</p>
                    </div>
                    {/* Highlighted Banner */}
                    <div className="mt-4 p-4 bg-white/[0.02] border border-white/10 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                      <span className="text-xs font-bold tracking-wider text-white uppercase">
                        Pre-orders will be available soon
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: '1.7',
                    marginBottom: '28px',
                    textTransform: 'none',
                    letterSpacing: '0'
                  }}>
                    Matte black silicone band representing islandwide student unity across all 25 educational districts.
                  </p>

                  <form onSubmit={handleSubmitOrder} className="space-y-6 pt-4 border-t border-white/5">
                    {/* Quantity Spinner */}
                    <div className="space-y-2">
                      <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold">
                        Quantity
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={true}
                          className="w-10 h-10 rounded-lg border border-white/5 flex items-center justify-center text-white/20 transition-all bg-white/[0.01] cursor-not-allowed pointer-events-none"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-white/30">{quantity}</span>
                        <button
                          type="button"
                          disabled={true}
                          className="w-10 h-10 rounded-lg border border-white/5 flex items-center justify-center text-white/20 transition-all bg-white/[0.01] cursor-not-allowed pointer-events-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Delivery Method */}
                    <div className="space-y-3">
                      <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold">
                        Delivery Method
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          disabled={true}
                          style={{
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.02)',
                            color: 'rgba(255,255,255,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '16px',
                            minHeight: '72px',
                            width: '100%',
                            cursor: 'not-allowed',
                            pointerEvents: 'none'
                          }}
                          className="rounded-xl text-left transition-all"
                        >
                          <span className="block text-xs font-bold uppercase tracking-wider">Event Pickup</span>
                          <span className="block text-[10px] opacity-60">Free</span>
                        </button>
                        <button
                          type="button"
                          disabled={true}
                          style={{
                            border: '1px solid rgba(255,255,255,0.05)',
                            background: 'transparent',
                            color: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '16px',
                            minHeight: '72px',
                            width: '100%',
                            cursor: 'not-allowed',
                            pointerEvents: 'none'
                          }}
                          className="rounded-xl text-left transition-all"
                        >
                          <span className="block text-xs font-bold uppercase tracking-wider">Home Delivery</span>
                          <span className="block text-[10px] opacity-60">+ LKR 350</span>
                        </button>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-6 pt-6 border-t border-white/5">
                      <div className="space-y-3">
                        <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Kamal Perera"
                          required
                          disabled={true}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.3)',
                            borderRadius: '10px',
                            padding: '14px 18px',
                            cursor: 'not-allowed',
                            pointerEvents: 'none'
                          }}
                          className="product-input w-full outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="077 123 4567"
                          required
                          disabled={true}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.3)',
                            borderRadius: '10px',
                            padding: '14px 18px',
                            cursor: 'not-allowed',
                            pointerEvents: 'none'
                          }}
                          className="product-input w-full outline-none transition-all"
                        />
                      </div>

                      {deliveryMethod === 'delivery' && (
                        <div className="space-y-3">
                          <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold mb-1">
                            Delivery Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="123 Galle Road, Colombo 03"
                            required
                            rows={3}
                            disabled={true}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.3)',
                              borderRadius: '10px',
                              padding: '14px 18px',
                              cursor: 'not-allowed',
                              pointerEvents: 'none'
                            }}
                            className="product-input w-full outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>

                    {/* Total Calculator */}
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Items Total ({quantity}x)</span>
                        <span>LKR {(productPrice * quantity).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Delivery Fee</span>
                        <span>{deliveryFee === 0 ? 'Free' : `LKR ${deliveryFee}`}</span>
                      </div>
                      <div className="h-px bg-white/5 my-2" />
                      <div className="flex items-center justify-between text-sm font-bold text-white">
                        <span>Order Total</span>
                        <span style={{ color: '#ffffff', fontWeight: 'bold' }}>LKR {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Error display */}
                    {error && (
                      <p className="text-red-500 text-xs text-center">
                        ⚠️ {error}
                      </p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={true}
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        color: 'rgba(255,255,255,0.25)', 
                        fontWeight: '700',
                        border: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'not-allowed'
                      }}
                      className="w-full min-h-[48px] uppercase rounded-xl transition-all flex items-center justify-center gap-2 pointer-events-none"
                    >
                      <ShoppingBag size={14} className="opacity-50" />
                      <span>Pre-Orders Closed</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              /* Success Screen */
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-[#0b0b0b] border border-white/5 rounded-3xl p-8 md:p-12 text-center space-y-8 relative overflow-hidden"
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20" />

                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] tracking-[0.25em] font-bold text-white/50 uppercase">Pre-Order Successful</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight font-display">
                    Thank You for Your Order!
                  </h2>
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Order Number: {orderSuccess.orderNumber}
                  </p>
                </div>

                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-4 max-w-md mx-auto">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <CreditCard size={14} className="text-white/60" />
                    <span>Bank Transfer Details</span>
                  </h3>
                  <div className="text-xs space-y-2.5 text-white/60">
                    <div className="flex justify-between"><span>Bank:</span><strong className="text-white">Commercial Bank</strong></div>
                    <div className="flex justify-between"><span>Account Name:</span><strong className="text-white font-medium">All Island Schools Commerce Association</strong></div>
                    <div className="flex justify-between"><span>Account Number:</span><strong className="text-white">8013254921</strong></div>
                    <div className="flex justify-between"><span>Branch:</span><strong className="text-white">Colombo Fort</strong></div>
                    <div className="flex justify-between border-t border-white/5 pt-2.5 font-bold">
                      <span className="text-white/60">Amount to Transfer:</span>
                      <strong className="text-white font-bold">LKR {totalAmount.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed uppercase tracking-wider font-light">
                  Please complete the bank transfer within 24 hours and send your payment receipt/proof to our WhatsApp channel to verify delivery.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`https://wa.me/94778132137?text=Payment%20Proof%20for%20Order%20${orderSuccess.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#ffffff', color: '#000000', fontWeight: '700' }}
                    className="px-8 py-3 text-xs tracking-widest uppercase rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Send Payment Proof to WhatsApp</span>
                  </a>
                  <Link
                    href="/"
                    className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-white/10 transition-all"
                  >
                    Return Home
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
