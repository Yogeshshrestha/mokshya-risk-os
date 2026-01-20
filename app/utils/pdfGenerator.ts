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
 * Generate PDF from report preview pages
 */
export async function generateReportPDF(filename: string = 'Risk-Assessment-Report.pdf'): Promise<void> {
  try {
    console.log('Starting PDF generation...')
    
    const previewContainer = document.querySelector('.space-y-8') as HTMLElement
    if (!previewContainer) {
      throw new Error('Report preview not found.')
    }

    const pages = Array.from(previewContainer.children) as HTMLElement[]
    if (pages.length === 0) {
      throw new Error('No report pages found.')
    }

    console.log(`Found ${pages.length} pages to export`)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
      compress: true
    })

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      if (!page) continue
      
      console.log(`Processing page ${i + 1}/${pages.length}...`)

      // Create off-screen container for clean capture
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'fixed'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = '816px'
      tempContainer.style.backgroundColor = '#ffffff'
      tempContainer.style.padding = '0'
      tempContainer.style.margin = '0'
      tempContainer.style.overflow = 'visible'
      document.body.appendChild(tempContainer)

      // Clone the page and normalize styles
      const pageClone = page.cloneNode(true) as HTMLElement
      pageClone.style.width = '816px'
      pageClone.style.height = '1056px'
      pageClone.style.minHeight = 'fit-content'
      pageClone.style.boxSizing = 'border-box'
      pageClone.style.transform = 'scale(1)'
      pageClone.style.transformOrigin = 'top left'
      pageClone.style.zoom = '1'
      pageClone.style.position = 'relative'
      pageClone.style.overflow = 'hidden'
      
      tempContainer.appendChild(pageClone)
      
      // Force layout calculation
      tempContainer.offsetHeight
      
      console.log(`Capturing at fixed width: 816px`)

      // Copy computed styles from original to clone
      const originalElements = page.querySelectorAll('*')
      const clonedElements = pageClone.querySelectorAll('*')
      
      originalElements.forEach((originalEl, index) => {
        const clonedEl = clonedElements[index] as HTMLElement
        if (!clonedEl) return
        
        const computedStyle = window.getComputedStyle(originalEl)
        
        // Copy essential visual properties
        const props = [
          'color', 'background-color', 'background-image', 'background-size',
          'border-color', 'border-width', 'border-style', 'border-radius',
          'font-family', 'font-size', 'font-weight', 'line-height',
          'text-align', 'width', 'height', 'padding', 'margin',
          'display', 'position', 'flex', 'flex-direction', 'gap',
          'justify-content', 'align-items', 'opacity', 'box-shadow'
        ]
        
        props.forEach(prop => {
          let value = computedStyle.getPropertyValue(prop)
          if (value && value !== '') {
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
      })

      // Wait for layout and fonts to fully render
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Force another layout recalculation
      tempContainer.getBoundingClientRect()

      try {
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff',
          allowTaint: true,
          width: 816,
          windowWidth: 816,
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
              })
            }
          }
        })

        // Calculate dimensions to fit PDF page width (US Letter: 612pt width)
        const pdfWidth = 612
        
        const imgWidth = pdfWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9)

        if (i > 0) pdf.addPage()
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
        
        console.log(`Page ${i + 1} added to PDF`)
        
      } finally {
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer)
        }
      }
    }

    pdf.save(filename)
    console.log('PDF exported successfully!')
    
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw error
  }
}
