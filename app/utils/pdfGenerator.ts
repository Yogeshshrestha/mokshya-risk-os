import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

/**
 * Convert OKLCH colors to RGB for html2canvas compatibility
 */
function convertColorToRGB(color: string): string {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)' || color === 'none') {
    return color
  }

  if (!color.includes('oklch') && !color.includes('oklab')) {
    return color
  }

  try {
    const temp = document.createElement('div')
    temp.style.color = color
    temp.style.display = 'none'
    document.body.appendChild(temp)
    const computed = window.getComputedStyle(temp).color
    document.body.removeChild(temp)
    return computed || 'rgb(0, 0, 0)'
  } catch (e) {
    return 'rgb(0, 0, 0)'
  }
}

/**
 * Capture an element as a canvas with mobile-like width
 */
async function captureElement(element: HTMLElement, width: number = 816): Promise<HTMLCanvasElement> {
  // Create off-screen container for clean capture
  const tempContainer = document.createElement('div')
  tempContainer.style.position = 'fixed'
  tempContainer.style.left = '-9999px'
  tempContainer.style.top = '0'
  tempContainer.style.width = `${width}px`
  tempContainer.style.backgroundColor = '#ffffff'
  tempContainer.style.padding = '0'
  tempContainer.style.margin = '0'
  tempContainer.style.overflow = 'visible'
  document.body.appendChild(tempContainer)

  // Clone the element and normalize styles
  const elementClone = element.cloneNode(true) as HTMLElement
  elementClone.style.width = `${width}px`
  elementClone.style.minHeight = 'fit-content'
  elementClone.style.boxSizing = 'border-box'
  elementClone.style.transform = 'scale(1)'
  elementClone.style.transformOrigin = 'top left'
  elementClone.style.zoom = '1'
  elementClone.style.position = 'relative'
  elementClone.style.overflow = 'visible'
  // Add generous padding buffer so content is not visually cut in the capture
  elementClone.style.paddingBottom = '40px'
  elementClone.style.paddingTop = '8px'

  tempContainer.appendChild(elementClone)

  // Force layout calculation
  tempContainer.offsetHeight

  const originalElements = element.querySelectorAll('*')
  const clonedElements = elementClone.querySelectorAll('*')

  originalElements.forEach((originalEl, index) => {
    const clonedEl = clonedElements[index] as HTMLElement
    if (!clonedEl) return

    const computedStyle = window.getComputedStyle(originalEl)

    // Copy essential visual properties but skip explicit height constraints
    const props = [
      'color', 'background-color', 'background-image', 'background-size',
      'border-color', 'border-width', 'border-style', 'border-radius',
      'font-family', 'font-size', 'font-weight', 'line-height',
      'text-align', 'width', 'padding', 'margin',
      'display', 'position', 'flex', 'flex-direction', 'gap',
      'justify-content', 'align-items', 'opacity', 'box-shadow'
    ]

    props.forEach(prop => {
      let value = computedStyle.getPropertyValue(prop)
      if (value && value !== '') {
        // Normalize problematic positions that rely on viewport
        if (prop === 'position' && (value === 'fixed' || value === 'sticky')) {
          value = 'relative'
        }

        // Convert OKLCH colors to RGB
        if (prop.includes('color') || prop.includes('background')) {
          value = convertColorToRGB(value)
        }
        try {
          clonedEl.style.setProperty(prop, value, 'important')
        } catch (e) {
          // Ignore
        }
      }
    })

    // Ensure clones grow to fit content rather than inherit viewport-based constraints
    try {
      clonedEl.style.height = 'auto'
      clonedEl.style.minHeight = '0'
      clonedEl.style.maxHeight = 'none'
      if (!clonedEl.style.display || clonedEl.style.display === '') {
        clonedEl.style.display = computedStyle.getPropertyValue('display') || 'block'
      }
      clonedEl.style.visibility = 'visible'
      
      // For SVG elements, ensure they have explicit dimensions
      if (clonedEl.tagName === 'svg') {
        const bbox = (originalEl as any).getBBox ? (originalEl as any).getBBox() : null
        if (bbox) {
          if (!clonedEl.getAttribute('width')) clonedEl.setAttribute('width', Math.ceil(bbox.width).toString())
          if (!clonedEl.getAttribute('height')) clonedEl.setAttribute('height', Math.ceil(bbox.height).toString())
        }
      }
    } catch (e) {
      // ignore
    }
  })

  // Wait for layout and fonts to fully render
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Check if element contains charts/SVGs and give extra time for rendering
  const hasCharts = elementClone.querySelector('svg') || elementClone.querySelector('canvas')
  if (hasCharts) {
    // Force layout recalculation on all SVG elements
    const svgs = elementClone.querySelectorAll('svg')
    svgs.forEach(svg => {
      svg.getBoundingClientRect() // Force layout
      // Ensure SVG is visible and has proper size
      const style = window.getComputedStyle(svg)
      if (!svg.getAttribute('width')) {
        const width = parseFloat(style.width)
        if (width > 0) svg.setAttribute('width', width.toString())
      }
      if (!svg.getAttribute('height')) {
        const height = parseFloat(style.height)
        if (height > 0) svg.setAttribute('height', height.toString())
      }
    })
    await new Promise(resolve => setTimeout(resolve, 800))
  }

  // If available, wait for the FontFaceSet to be ready so webfonts render in the capture
  try {
    const fonts = (document as any).fonts
    if (fonts && fonts.ready && typeof fonts.ready.then === 'function') {
      await fonts.ready
    }
  } catch (e) {
    // ignore if fonts API is not supported or fails
  }

  // Force another layout recalculation
  tempContainer.getBoundingClientRect()

  // Copy canvas contents from original to cloned element (canvas cloning doesn't copy bitmap)
  try {
    const originalCanvases = element.querySelectorAll('canvas')
    const clonedCanvases = elementClone.querySelectorAll('canvas')
    for (let idx = 0; idx < originalCanvases.length; idx++) {
      const origCanvas = originalCanvases[idx] as HTMLCanvasElement
      const cloneCanvas = clonedCanvases[idx] as HTMLCanvasElement | undefined
      if (!cloneCanvas) continue
      try {
        const orig = origCanvas as HTMLCanvasElement
        // Ensure cloned canvas has the same bitmap size as the original
        cloneCanvas.width = orig.width
        cloneCanvas.height = orig.height
        // Also ensure the displayed size matches the original bounding rect (so CSS scaling works)
        const rect = (orig.getBoundingClientRect && orig.getBoundingClientRect()) || { width: orig.width, height: orig.height }
        cloneCanvas.style.width = `${rect.width}px`
        cloneCanvas.style.height = `${rect.height}px`

        const ctx = cloneCanvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, cloneCanvas.width, cloneCanvas.height)
          // Prefer using a data URL to avoid cross-origin taint issues when possible
          try {
            const dataUrl = orig.toDataURL('image/png')
            await new Promise<void>((res, rej) => {
              const img = new Image()
              img.onload = () => {
                try { ctx.drawImage(img, 0, 0); res() } catch (e) { rej(e) }
              }
              img.onerror = () => rej(new Error('Image load failed'))
              img.src = dataUrl
            })
          } catch (e) {
            // Fallback: attempt direct draw (may fail if canvas is tainted)
            try { ctx.drawImage(orig, 0, 0) } catch (err) { /* ignore */ }
          }
        }
      } catch (e) {
        // ignore drawing errors
      }
    }
  } catch (e) {
    // ignore
  }

  try {
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      width: width,
      windowWidth: width,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.querySelector('[style*="left: -9999px"]') as HTMLElement
        if (clonedContainer) {
          clonedContainer.style.visibility = 'visible'

          // Convert any remaining OKLCH colors
          const allEls = clonedContainer.querySelectorAll('*')
          allEls.forEach(el => {
            const element = el as HTMLElement
            if (element.style) {
              Array.from(element.style).forEach(prop => {
                const value = element.style.getPropertyValue(prop)
                if (value && (value.includes('oklch') || value.includes('oklab'))) {
                  element.style.setProperty(prop, convertColorToRGB(value), 'important')
                }
              })
            }
            
            // Ensure SVG elements are visible and have proper dimensions
            if (element.tagName === 'svg') {
              element.style.visibility = 'visible'
              element.style.display = 'block'
              // Force a specific size if the SVG doesn't have width/height
              if (!element.hasAttribute('width') && !element.hasAttribute('height')) {
                const bbox = (element as any).getBBox ? (element as any).getBBox() : null
                if (bbox && bbox.width && bbox.height) {
                  element.setAttribute('width', Math.ceil(bbox.width).toString())
                  element.setAttribute('height', Math.ceil(bbox.height).toString())
                }
              }
            }
          })

          // Also ensure cloned canvas elements retain pixel data by copying images already drawn above
          const clonedCanvases = clonedContainer.querySelectorAll('canvas')
          clonedCanvases.forEach((c) => {
            // nothing to do here; drawing was performed on the clone earlier
          })
        }
      }
    })

    return canvas
  } finally {
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer)
    }
  }
}

/**
 * Generate PDF from dashboard components
 */
export async function generateDashboardPDF(
  reportType: 'cro' | 'ciso' | 'board',
  organizationName: string,
  generatedDate: string,
  onProgress?: (message: string) => void,
  rootElement?: HTMLElement
): Promise<void> {
  try {
    onProgress?.('Initializing PDF generation...')

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
      compress: true
    })

    const pdfWidth = 612 // US Letter width in points
    let pageCount = 0

    // Step 1: Generate and add cover page
    onProgress?.('Generating cover page...')

    // If the caller provided a rootElement with a mounted .report-cover child, prefer capturing that.
    let coverCaptured = false
    if (rootElement) {
      const coverChild = rootElement.querySelector('.report-cover') as HTMLElement | null
      if (coverChild) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500)) // short settle
          const coverCanvas = await captureElement(coverChild, 816)
          const imgWidth = pdfWidth
          const imgHeight = (coverCanvas.height * imgWidth) / coverCanvas.width
          const imgData = coverCanvas.toDataURL('image/jpeg', 0.9)
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
          pageCount++
          onProgress?.(`Cover page added from mounted component (${pageCount} pages)`)
          coverCaptured = true
        } catch (e) {
          console.warn('Mounted cover capture failed, falling back to generated cover', e)
        }
      }
    }

    // Fallback: create cover HTML if not captured from a mounted component
    if (!coverCaptured) {
      // Create cover page element
      const coverPageContainer = document.createElement('div')
      coverPageContainer.style.width = '816px'
      coverPageContainer.style.height = '1056px'
      coverPageContainer.style.position = 'fixed'
      coverPageContainer.style.left = '-9999px'
      coverPageContainer.style.top = '0'
      // Add a light border to make cover visibility more robust in some PDF viewers
      coverPageContainer.style.border = '1px solid #e8f3f2'
      coverPageContainer.innerHTML = `
        <div style="width: 100%; height: 100%; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; position: relative; overflow: hidden;">
          <div style="position: absolute; inset: 0; opacity: 0.02; background-image: radial-gradient(#09423c 0.5px, transparent 0.5px); background-size: 24px 24px;"></div>
          
          <div style="position: absolute; top: 48px; left: 48px; display: flex; align-items: center; gap: 12px;">
            <div style="width: 48px; height: 48px; background: #09423c; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 28px; height: 28px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <div>
              <h3 style="font-size: 14px; font-weight: 900; color: #09423c; letter-spacing: -0.02em;">MOKSHYA</h3>
              <p style="font-size: 10px; font-weight: 700; color: #4f9690; text-transform: uppercase; letter-spacing: 0.1em;">Risk OS</p>
            </div>
          </div>

          <div style="position: relative; z-index: 10; text-align: center; max-width: 672px;">
            <div style="width: 96px; height: 96px; background: #e8f3f2; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid white;">
              <svg style="width: 56px; height: 56px; color: #09423c;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${reportType === 'cro' ? '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path>' :
          reportType === 'ciso' ? '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>' :
            '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>'}
              </svg>
            </div>

            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #09423c; color: white; border-radius: 9999px; margin-bottom: 24px;">
              <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">${reportType.toUpperCase()} Report</span>
            </div>

            <h1 style="font-size: 42px; font-weight: 900; color: #09423c; margin-bottom: 16px; letter-spacing: -0.02em; line-height: 1.2;">
              ${reportType === 'cro' ? 'Chief Risk Officer Report' :
          reportType === 'ciso' ? 'Chief Information Security Officer Report' :
            'Board of Directors Report'}
              </h1>

            <p style="font-size: 18px; color: #4f9690; margin-bottom: 48px; line-height: 1.6; font-weight: 500;">
              ${reportType === 'cro' ? 'Comprehensive Risk Assessment & Financial Exposure Analysis' :
          reportType === 'ciso' ? 'Security Posture & Control Maturity Assessment' :
            'Executive Cyber Risk Summary'}
              </p>

            <div style="background: #f8fbfb; border: 1px solid #e8f3f2; border-radius: 16px; padding: 32px; margin-bottom: 32px;">
              <div style="margin-bottom: 16px;">
                <p style="font-size: 11px; font-weight: 700; color: #4f9690; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Organization</p>
                <p style="font-size: 20px; font-weight: 900; color: #09423c;">${organizationName}</p>
              </div>
              <div style="height: 1px; background: #e8f3f2; margin: 16px 0;"></div>
              <div>
                <p style="font-size: 11px; font-weight: 700; color: #4f9690; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Report Generated</p>
                <p style="font-size: 16px; font-weight: 700; color: #09423c;">${new Date(generatedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #6b8a87;">
              <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Confidential & Proprietary</span>
            </div>
          </div>

          <div style="position: absolute; bottom: 48px; left: 48px; right: 48px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; font-weight: 500;">
            <span>© ${new Date().getFullYear()} Mokshya Risk OS</span>
            <span>Generated: ${new Date(generatedDate).toLocaleString()}</span>
          </div>
        </div>
      `
    document.body.appendChild(coverPageContainer)

    try {
      // Give cover a moment to settle (fonts, rendering)
      await new Promise(resolve => setTimeout(resolve, 500))
      const coverCanvas = await captureElement(coverPageContainer, 816)
      const imgWidth = pdfWidth
      const imgHeight = (coverCanvas.height * imgWidth) / coverCanvas.width
      const imgData = coverCanvas.toDataURL('image/jpeg', 0.9)

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
      pageCount++
      onProgress?.(`Cover page added (${pageCount} pages)`)
    } finally {
      document.body.removeChild(coverPageContainer)
    }
  }

  // Step 2: Capture dashboard content
  onProgress?.('Capturing dashboard content...')

    // If a rootElement is provided (off-screen mount), use that. Otherwise find the main page content.
    const mainContent = rootElement ? rootElement : (document.querySelector('main') as HTMLElement)
    if (!mainContent) {
      throw new Error('Dashboard content not found')
    }

    // Get dashboard container (either the root itself, or a child with standard dashboard spacing classes)
    const dashboardContainer = (mainContent.querySelector?.('.space-y-6, .space-y-8') as HTMLElement) || mainContent
    if (!dashboardContainer) {
      throw new Error('Dashboard container not found')
    }

    // Get all child sections to export (each direct child is a component/section)
    const sections = Array.from(dashboardContainer.children).filter(child => {
      const el = child as HTMLElement
      // Filter out loading states or empty divs
      return el.tagName !== 'SCRIPT' && 
             el.tagName !== 'STYLE' && 
             !el.classList.contains('hidden') &&
             el.offsetHeight > 0
    }) as HTMLElement[]

    onProgress?.(`Found ${sections.length} dashboard sections to export`)

    // Choose capture width: use a desktop viewport (816px) for better layout
    // This ensures components are captured with proper spacing and readability
    const captureWidth = 816
    const pageHeight = 792 // US Letter height in points
    const padding = 30 // Padding between sections and from edges (increased for safety)

    // Capture sections in pairs (2 per page) to reduce blank space
    const capturedSections: Array<{ canvas: HTMLCanvasElement; imgData: string; width: number; height: number; element?: HTMLElement }> = []
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      if (!section) continue

      onProgress?.(`Capturing section ${i + 1}/${sections.length}...`)

      try {
        const canvas = await captureElement(section, captureWidth)
        const imgWidth = pdfWidth - (padding * 2)
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        const imgData = canvas.toDataURL('image/jpeg', 0.9)
        
        capturedSections.push({ canvas, imgData, width: imgWidth, height: imgHeight, element: section })
      } catch (error) {
        console.error(`Failed to capture section ${i + 1}:`, error)
      }
    }

    // Add captured sections to PDF, prefer 2 per page but avoid cutting components
    for (let i = 0; i < capturedSections.length; i += 2) {
      const section1 = capturedSections[i]
      const section2 = capturedSections[i + 1]

      const maxHeight = pageHeight - (padding * 2)

      const addSingleSection = (section: { imgData: string; width: number; height: number }, labelIndex: number) => {
        // If section is taller than available height, scale it down to fit the page height
        if (section.height > maxHeight) {
          const scale = maxHeight / section.height
          const scaledHeight = section.height * scale
          const scaledWidth = section.width * scale
          const x = (pdfWidth - scaledWidth) / 2
          const y = padding
          pdf.addImage(section.imgData, 'JPEG', x, y, scaledWidth, scaledHeight, undefined, 'FAST')
          onProgress?.(`Page ${pageCount}: Added section ${labelIndex} (scaled to fit)`) 
        } else {
          const yOffset = (pageHeight - section.height) / 2
          pdf.addImage(section.imgData, 'JPEG', padding, yOffset, section.width, section.height, undefined, 'FAST')
          onProgress?.(`Page ${pageCount}: Added section ${labelIndex}`)
        }
      }

      if (section1 && section2) {
        // If either section is taller than a full page, put them on their own pages scaled to fit
        if (section1.height > maxHeight || section2.height > maxHeight) {
          // Section 1 on its own page
          pdf.addPage(); pageCount++
          addSingleSection(section1, i + 1)

          // Section 2 on its own page
          pdf.addPage(); pageCount++
          addSingleSection(section2, i + 2)
        } else {
          // If either section is annotated as full-page, or is large (>= 45% page height), place on separate pages
          const s1Full = Boolean(section1.element && (section1.element.getAttribute('data-report-full') === 'true' || section1.element.classList.contains('report-full')))
          const s2Full = Boolean(section2.element && (section2.element.getAttribute('data-report-full') === 'true' || section2.element.classList.contains('report-full')))

          if (s1Full || s2Full || section1.height > (maxHeight * 0.45) || section2.height > (maxHeight * 0.45)) {
            pdf.addPage(); pageCount++
            addSingleSection(section1, i + 1)

            pdf.addPage(); pageCount++
            addSingleSection(section2, i + 2)
          } else {
            // Add extra spacing between sections for visual separation
            const sectionGap = padding * 1.5
            const totalHeight = section1.height + section2.height + sectionGap

            if (totalHeight <= maxHeight) {
              // Both fit comfortably - place both on a single page
              pdf.addPage(); pageCount++
              // If there's excessive blank space, gently scale up both sections (up to 1.15x max) to better fill the page
              const available = maxHeight
              const scaleUp = Math.min(1.15, available / totalHeight)
              if (scaleUp > 1.05) {
                const s1h = section1.height * scaleUp
                const s2h = section2.height * scaleUp
                const sWidth = section1.width * scaleUp
                const startY = (pageHeight - (s1h + s2h + sectionGap)) / 2
                const startX = (pdfWidth - sWidth) / 2
                pdf.addImage(section1.imgData, 'JPEG', startX, startY, sWidth, s1h, undefined, 'FAST')
                pdf.addImage(section2.imgData, 'JPEG', startX, startY + s1h + sectionGap, sWidth, s2h, undefined, 'FAST')
                onProgress?.(`Page ${pageCount}: Added sections ${i + 1} and ${i + 2} (scaled up)`)
              } else {
                const startY = (pageHeight - totalHeight) / 2
                pdf.addImage(section1.imgData, 'JPEG', padding, startY, section1.width, section1.height, undefined, 'FAST')
                pdf.addImage(section2.imgData, 'JPEG', padding, startY + section1.height + sectionGap, section2.width, section2.height, undefined, 'FAST')
                onProgress?.(`Page ${pageCount}: Added sections ${i + 1} and ${i + 2}`)
              }
            } else {
              // Combined too tall - place them on separate pages to preserve readability
              pdf.addPage(); pageCount++
              addSingleSection(section1, i + 1)

              pdf.addPage(); pageCount++
              addSingleSection(section2, i + 2)
            }
          }
        }
      } else if (section1) {
        // Only one section left - place it on a page and scale if necessary
        pdf.addPage(); pageCount++
        addSingleSection(section1, i + 1)
      }
    }

    // Save the PDF
    const filename = `${reportType.toUpperCase()}-Report-${organizationName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(filename)

    onProgress?.(`PDF exported successfully! (${pageCount} pages)`)

  } catch (error) {
    console.error('PDF generation failed:', error)
    throw error
  }
}
