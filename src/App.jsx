import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, Heart, PartyPopper, Send, Sparkles, UserRound, UsersRound } from 'lucide-react'
import FloatingDecor from './components/FloatingDecor.jsx'

const attendanceOptions = [
  {
    value: 'lam-dong',
    title: 'Về Lâm Đồng chung vui',
    description: 'Mình muốn tham dự vu quy tại nhà ở Lâm Đồng (ngày 12/12/2026).',
    badge: 'Vu quy',
  },
  {
    value: 'sai-gon',
    title: 'Hẹn nhau ở Sài Gòn',
    description: 'Mình muốn tham dự buổi báo hỷ tại Sài Gòn (dự định tháng 1 hoặc tháng 2/2027).',
    badge: 'Báo hỷ',
  },
  {
    value: 'either',
    title: 'Ở đâu cũng được',
    description: 'Hai bạn sắp xếp chỗ nào mình cũng vui vẻ tham gia.',
  },
]

const initialForm = {
  includeDetails: false,
  fullName: '',
  attendance: 'lam-dong',
  guestCount: '1',
  note: '',
}

const formatSubmittedAt = (date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(date)
  const getPart = (type) => parts.find((part) => part.type === type)?.value ?? ''

  return `${getPart('day')}/${getPart('month')}/${getPart('year')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const selected = useMemo(
    () => attendanceOptions.find((option) => option.value === form.attendance),
    [form.attendance],
  )

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const selectAttendance = (value) => {
    setForm((prev) => ({ ...prev, attendance: value }))
    setError('')
  }

  const toggleDetails = (event) => {
    const includeDetails = event.target.checked
    setForm((prev) => ({
      ...prev,
      includeDetails,
      ...(includeDetails ? {} : { fullName: '', guestCount: '1', note: '' }),
    }))
  }

  const validate = () => {
    if (!form.attendance) return 'Bạn chọn một địa điểm muốn tham dự giúp tụi mình nha.'
    return ''
  }

  const celebrate = () => {
    const defaults = { spread: 70, ticks: 120, gravity: 0.9, scalar: 0.9 }
    confetti({ ...defaults, particleCount: 75, origin: { x: 0.25, y: 0.65 } })
    confetti({ ...defaults, particleCount: 75, origin: { x: 0.75, y: 0.65 } })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationMessage = validate()

    if (validationMessage) {
      setError(validationMessage)
      return
    }

    const endpoint = import.meta.env.VITE_GOOGLE_SCRIPT_URL
    if (!endpoint) {
      setError('Chưa cấu hình VITE_GOOGLE_SCRIPT_URL. Xem README để kết nối Google Sheet.')
      return
    }

    setStatus('submitting')
    setError('')

    const payload = new URLSearchParams({
      fullName: form.includeDetails ? form.fullName.trim() : '',
      attendance: form.attendance,
      attendanceLabel: selected?.title ?? '',
      guestCount: form.includeDetails ? form.guestCount : '',
      note: form.includeDetails ? form.note.trim() : '',
      submittedAt: formatSubmittedAt(new Date()),
    })

    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: payload.toString(),
      })

      setStatus('success')
      celebrate()
    } catch (submitError) {
      console.error(submitError)
      setStatus('idle')
      setError('Có chút trục trặc khi gửi thông tin. Bạn thử lại giúp tụi mình nhé 🥺')
    }
  }

  const resetForm = () => {
    setForm(initialForm)
    setStatus('idle')
    setError('')
  }

  return (
    <main className="page-shell">
      <FloatingDecor />

      <motion.section
        className="survey-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="shine" aria-hidden="true" />

        <header className="hero">
          <motion.div
            className="heart-seal"
            animate={{ rotate: [0, -7, 7, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 1.2 }}
          >
            <Heart size={24} fill="currentColor" />
          </motion.div>

          <p className="eyebrow"><Sparkles size={15} /> Tụi mình sắp cưới rồi!</p>
          <h1>Chuyện vui của tụi mình<br /><em>có bạn thì vui hơn.</em></h1>
          <p className="hero-copy">
            Tụi mình đang lên kế hoạch để có thể gặp gỡ mọi người thật trọn vẹn. Bạn dành một phút chọn địa điểm thuận tiện nhất nhé.
          </p>

          <div className="mini-route" aria-label="Tên cô dâu chú rể">
            <span>Nguyệt</span>
            <Heart className="couple-heart" size={20} fill="currentColor" aria-hidden="true" />
            <span>Tú</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              className="success-state"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="success-icon"
                initial={{ rotate: -14 }}
                animate={{ rotate: [0, 8, -5, 0] }}
                transition={{ duration: 0.8 }}
              >
                <PartyPopper size={38} />
              </motion.div>
              <p className="eyebrow">Đã nhận được câu trả lời</p>
              <h2>Cảm ơn {form.fullName || 'bạn'} nhiều nha! 💖</h2>
              <p>
                Tụi mình đã ghi nhận lựa chọn <strong>{selected?.title.toLowerCase()}</strong>. Khi chốt kế hoạch, tụi mình sẽ gửi thông tin cụ thể cho bạn.
              </p>
              <button type="button" className="secondary-button" onClick={resetForm}>
                Gửi câu trả lời khác
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="survey-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <section className="form-section">
                <div className="section-heading">
                  <span className="section-number">01</span>
                  <div>
                    <h2>Bạn muốn gặp tụi mình ở đâu?</h2>
                    <p>Chọn phương án thuận tiện nhất với bạn nha.</p>
                  </div>
                </div>

                <div className="option-grid">
                  {attendanceOptions.map((option, index) => {
                    const active = form.attendance === option.value
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        className={`choice-card ${active ? 'active' : ''}`}
                        onClick={() => selectAttendance(option.value)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.985 }}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 + index * 0.08 }}
                        aria-pressed={active}
                      >
                        <span className="choice-copy">
                          {option.badge && <span className="choice-badge">{option.badge}</span>}
                          <strong>{option.title}</strong>
                          <small>{option.description}</small>
                        </span>
                        <span className="choice-check">{active && <Check size={17} />}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </section>

              <section className="form-section personal-section">
                <div className="section-heading">
                  <span className="section-number">02</span>
                  <div>
                    <h2>Bạn có muốn gửi kèm thông tin không?</h2>
                    <p>Phần này không bắt buộc. Bạn có thể bỏ qua hoặc gửi thêm vài thông tin để tụi mình tiện sắp xếp.</p>
                  </div>
                </div>

                <label className="details-toggle">
                  <input
                    type="checkbox"
                    checked={form.includeDetails}
                    onChange={toggleDetails}
                  />
                  <span className="toggle-control" aria-hidden="true" />
                  <span className="toggle-copy">
                    <strong>Gửi kèm thông tin của mình</strong>
                    <small>Tên, số người tham dự và lời nhắn đều là tùy chọn.</small>
                  </span>
                </label>

                <AnimatePresence initial={false}>
                  {form.includeDetails && (
                    <motion.div
                      className="fields-grid"
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <label className="field full-width">
                        <span><UserRound size={16} /> Họ và tên</span>
                        <input
                          name="fullName"
                          value={form.fullName}
                          onChange={updateField}
                          placeholder="Ví dụ: Nguyễn Minh Anh"
                          autoComplete="name"
                        />
                      </label>

                      <label className="field">
                        <span><UsersRound size={16} /> Số người tham dự</span>
                        <select name="guestCount" value={form.guestCount} onChange={updateField}>
                          <option value="1">1 người</option>
                          <option value="2">2 người</option>
                          <option value="3">3 người</option>
                          <option value="4">4 người</option>
                          <option value="5+">5 người trở lên</option>
                        </select>
                      </label>

                      <label className="field full-width">
                        <span>💬 Nhắn tụi mình vài lời</span>
                        <textarea
                          name="note"
                          value={form.note}
                          onChange={updateField}
                          rows="4"
                          placeholder="Lời nhắn, lưu ý ăn uống, hoặc điều gì bạn muốn tụi mình biết..."
                        />
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <AnimatePresence>
                {error && (
                  <motion.p
                    className="error-message"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                className="submit-button"
                disabled={status === 'submitting'}
                whileHover={status !== 'submitting' ? { scale: 1.015 } : undefined}
                whileTap={status !== 'submitting' ? { scale: 0.985 } : undefined}
              >
                {status === 'submitting' ? (
                  <><span className="spinner" /> Đang gửi tình yêu...</>
                ) : (
                  <><Send size={18} /> Gửi câu trả lời</>
                )}
              </motion.button>

              <p className="privacy-note">🔒 Tụi mình chỉ dùng thông tin này cho việc tổ chức lễ cưới & báo hỷ.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>

      <footer className="page-footer">Made with ♡ for a very happy day.</footer>
    </main>
  )
}

export default App
