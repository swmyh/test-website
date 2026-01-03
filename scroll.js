const header = document.getElementById('header')
const navToggle = document.querySelector('[data-nav-toggle]')
const navLinks = document.querySelector('[data-nav]')

const setNavState = (isOpen) => {
  if (navLinks) {
    navLinks.classList.toggle('is-open', isOpen)
  }
  if (navToggle) {
    navToggle.setAttribute('aria-expanded', String(isOpen))
  }
  if (header) {
    header.classList.toggle('nav-open', isOpen)
  }
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    setNavState(!navLinks.classList.contains('is-open'))
  })

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavState(false))
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setNavState(false)
    }
  })
}

let lastScroll = window.pageYOffset

const updateHeader = () => {
  if (!header) {
    return
  }

  const currentScroll = window.pageYOffset
  header.classList.toggle('is-scrolled', currentScroll > 10)

  if (currentScroll > lastScroll && currentScroll > 120 && !header.classList.contains('nav-open')) {
    header.classList.add('is-hidden')
  } else {
    header.classList.remove('is-hidden')
  }

  lastScroll = currentScroll
}

window.addEventListener('scroll', updateHeader, { passive: true })
updateHeader()

requestAnimationFrame(() => {
  document.body.classList.add('is-ready')
})

const revealItems = document.querySelectorAll('[data-reveal]')
let revealObserver = null

const observeReveal = (item) => {
  if (revealObserver) {
    revealObserver.observe(item)
  } else {
    item.classList.add('is-visible')
  }
}

if ('IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.2 })
}

revealItems.forEach((item) => observeReveal(item))

const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return
      }
      if (node.hasAttribute('data-reveal')) {
        observeReveal(node)
      }
      node.querySelectorAll?.('[data-reveal]').forEach((child) => observeReveal(child))
    })
  })
})

mutationObserver.observe(document.body, { childList: true, subtree: true })

const parallaxItems = document.querySelectorAll('[data-parallax]')

if (parallaxItems.length > 0) {
  let ticking = false

  const updateParallax = () => {
    const scrollY = window.pageYOffset
    parallaxItems.forEach((item) => {
      const speed = parseFloat(item.dataset.speed || '0.2')
      const offset = scrollY * speed * -0.08
      item.style.setProperty('--parallax-y', `${offset}px`)
    })
    ticking = false
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax)
      ticking = true
    }
  }, { passive: true })
}

const spotlightTargets = document.querySelectorAll('[data-spotlight]')

spotlightTargets.forEach((target) => {
  const updateSpotlight = (event) => {
    const rect = target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    target.style.setProperty('--spotlight-x', `${x}px`)
    target.style.setProperty('--spotlight-y', `${y}px`)
  }

  target.addEventListener('mousemove', updateSpotlight)
  target.addEventListener('mouseleave', () => {
    target.style.removeProperty('--spotlight-x')
    target.style.removeProperty('--spotlight-y')
  })
})

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href')
    if (!href) {
      return
    }
    const target = document.querySelector(href)
    if (target) {
      event.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setNavState(false)
    }
  })
})
