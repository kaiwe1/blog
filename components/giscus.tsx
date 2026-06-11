'use client'

import { useEffect, useRef } from 'react'

export function Giscus() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    const loadGiscus = () => {
      // 避免重复加载
      if (currentRef.querySelector('iframe')) return

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
      script.setAttribute('data-theme', 'preferred_color_scheme')
      script.setAttribute('data-lang', 'zh-CN')

      currentRef.appendChild(script)
    }

    // 在浏览器空闲时提前加载
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => loadGiscus(), { timeout: 2000 })
      return () => window.cancelIdleCallback(idleId)
    } else {
      const timerId = setTimeout(loadGiscus, 1000)
      return () => clearTimeout(timerId)
    }
  }, [])

  return (
    // giscus-theme-css 会在加载时自动处理它的自带 loading 样式
    <div ref={ref} className="min-h-[370px]" />
  )
}