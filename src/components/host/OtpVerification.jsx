import React, { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Check } from "lucide-react"

export default function OtpVerification({ email, onVerify, onResend, onClose, isOpen }) {
  const [otp, setOtp] = useState(["", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [timer, setTimer] = useState(30)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef([])
  const containerRef = useRef(null)
  const previouslyFocused = useRef(null)

  // prevent background scroll while modal open
  useEffect(() => {
    if (!isOpen) return
    previouslyFocused.current = document.activeElement
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
      if (previouslyFocused.current?.focus) previouslyFocused.current.focus()
    }
  }, [isOpen])

  // focus first input on mount
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [isOpen])

  // countdown timer
  useEffect(() => {
    if (!isOpen || timer <= 0) return
    const id = setInterval(() => setTimer(prev => (prev > 0 ? prev - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [isOpen, timer])

  // trap focus inside modal (simple)
  useEffect(() => {
    if (!isOpen) return
    function handleTab(e) {
      if (!containerRef.current) return
      const focusable = containerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleClose()
      }
    }
    document.addEventListener("keydown", handleTab)
    return () => document.removeEventListener("keydown", handleTab)
  }, [isOpen])

  const setOtpAt = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const clone = [...otp]
    clone[index] = value.slice(-1)
    setOtp(clone)
    // auto advance
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
    // auto submit when complete
    if (clone.every(d => d !== "")) {
      const code = clone.join("")
      handleVerify(code)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\s+/g, "").slice(0, 4).split("")
    if (!pasted.every(ch => /^\d$/.test(ch))) return
    const clone = ["", "", "", ""]
    pasted.forEach((d, i) => (clone[i] = d))
    setOtp(clone)
    const nextIndex = pasted.length < 4 ? pasted.length : 3
    inputRefs.current[nextIndex]?.focus()
    if (pasted.length === 4) handleVerify(pasted.join(""))
  }

  const handleVerify = async (code) => {
    if (isVerifying || isSuccess) return
    if (!/^\d{4}$/.test(code)) return
    try {
      setIsVerifying(true)
      // keep UI snappy — call parent verify handler
      const maybePromise = onVerify?.(code)
      // if parent returns a promise, await it (supports async API)
      if (maybePromise && typeof maybePromise.then === "function") {
        const res = await maybePromise
        // treat truthy success as verified
        if (res && res.success === false) {
          // parent returned explicit failure — handle below
          // You might want to add error state here
        } else {
          // success path
          setIsSuccess(true)
          // small delay so user sees success then close
          setTimeout(() => {
            setIsVerifying(false)
            onClose?.()
          }, 900)
          return
        }
      } else {
        // if parent didn't return promise/response, optimistically treat as success
        setIsSuccess(true)
        setTimeout(() => {
          setIsVerifying(false)
          onClose?.()
        }, 700)
        return
      }
    } catch (err) {
      // swallow — parent should show toast; we simply re-enable
      console.error("OTP verify error:", err)
      // Optionally add error state
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (isResending || timer > 0) return
    try {
      setIsResending(true)
      setTimer(30) // reset timer immediately
      const maybePromise = onResend?.()
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise
      }
    } catch (err) {
      console.error("Resend failed", err)
      // Optionally: restore timer or show error in parent
    } finally {
      setIsResending(false)
    }
  }

  const handleClose = () => {
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="OTP verification dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative">
          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Close verification dialog"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={isVerifying}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300">
            {!isSuccess ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            ) : (
              <Check className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-gray-900 mb-1">Verification Required</p>
            <p className="text-sm text-gray-500">Enter the 4-digit code sent to</p>
            <p className="text-sm font-medium text-gray-700 mt-1 truncate">{email}</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setOtpAt(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying || isSuccess}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-gray-900/10 transition-all duration-200 hover:border-gray-300 placeholder-gray-300 hover:shadow-md focus:shadow-lg"
                  placeholder="•"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => handleVerify(otp.join(""))}
              disabled={isVerifying || isSuccess || otp.some(d => !d)}
              className="group relative w-full py-3.5 px-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              aria-disabled={isVerifying || isSuccess || otp.some(d => !d)}
            >
              <span className="relative flex items-center justify-center gap-2">
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </>
                )}
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>
                  Resend code in{" "}
                  <span className="font-semibold text-gray-700" aria-live="polite">
                    {timer} seconds
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || isResending}
                className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                )}
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}