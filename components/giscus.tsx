'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/theme-provider'

export function Giscus() {
  const ref = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    const loadGiscus = () => {
      if (currentRef.querySelector('iframe')) {
        const iframe = currentRef.querySelector('iframe')
        if (iframe) {
          iframe.contentWindow?.postMessage(
            { giscus: { setConfig: { theme } } },
            'https://giscus.app'
          )
        }
        return
      }

      const script = document.createElement('script')
      script.src = 'https://giscus.app/client.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.setAttribute('data-repo', 'kaiwe1/blog')
      script.setAttribute('data-repo-id', process.env.NEXT_PUBLIC_GISCUS_REPO_ID!)
      script.setAttribute('data-category', process.env.NEXT_PUBLIC_GISCUS_CATEGORY!)
      script.setAttribute('data-category-id', process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!)
      script.setAttribute('data-mapping', 'pathname')
      script.setAttribute('data-strict', '0')
      script.setAttribute('data-reactions-enabled', '1')
      script.setAttribute('data-emit-metadata', '0')
      script.setAttribute('data-input-position', 'bottom')
      script.setAttribute('data-theme', theme)
      script.setAttribute('data-lang', 'zh-CN')

      currentRef.appendChild(script)
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => loadGiscus(), { timeout: 2000 })
      return () => window.cancelIdleCallback(idleId)
    } else {
      const timerId = setTimeout(loadGiscus, 1000)
      return () => clearTimeout(timerId)
    }
  }, [theme])

  return (
    <div ref={ref} className="min-h-[370px]" />
  )
}
