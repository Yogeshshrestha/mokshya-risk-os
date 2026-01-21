import { 
  Document, 
  Packer, 
  Paragraph, 
  ImageRun, 
  PageBreak, 
  AlignmentType 
} from 'docx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas-pro';
// import { jsPDF } from 'jspdf';

/**
 * Capture an element as a canvas with specified width
 */
async function captureElement(element: HTMLElement, width: number = 816): Promise<HTMLCanvasElement> {
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = `${width}px`;
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.padding = '0';
  tempContainer.style.margin = '0';
  tempContainer.style.overflow = 'visible';
  document.body.appendChild(tempContainer);

  const elementClone = element.cloneNode(true) as HTMLElement;
  elementClone.style.width = `${width}px`;
  elementClone.style.minHeight = 'fit-content';
  elementClone.style.boxSizing = 'border-box';
  elementClone.style.transform = 'scale(1)';
  elementClone.style.transformOrigin = 'top left';
  elementClone.style.zoom = '1';
  elementClone.style.position = 'relative';
  elementClone.style.overflow = 'visible';
  // Add generous padding buffer so content is not visually cut in the capture
  elementClone.style.paddingBottom = '40px';
  elementClone.style.paddingTop = '8px';

  tempContainer.appendChild(elementClone);
  tempContainer.offsetHeight;

  // Copy computed styles from original to clone
  const originalElements = element.querySelectorAll('*');
  const clonedElements = elementClone.querySelectorAll('*');

  originalElements.forEach((originalEl, index) => {
    const clonedEl = clonedElements[index] as HTMLElement;
    if (!clonedEl) return;

    const computedStyle = window.getComputedStyle(originalEl);
    const props = [
      'color', 'background-color', 'background-image', 'background-size',
      'border-color', 'border-width', 'border-style', 'border-radius',
      'font-family', 'font-size', 'font-weight', 'line-height',
      'text-align', 'width', 'padding', 'margin',
      'display', 'position', 'flex', 'flex-direction', 'gap',
      'justify-content', 'align-items', 'opacity', 'box-shadow'
    ];

    props.forEach(prop => {
      let value = computedStyle.getPropertyValue(prop);
      if (value && value !== '') {
        // Normalize problematic positions that rely on viewport
        if (prop === 'position' && (value === 'fixed' || value === 'sticky')) {
          value = 'relative'
        }

        if (['color', 'background-color', 'border-color'].includes(prop)) {
          value = convertColorToRGB(value);
        }
        try {
          clonedEl.style.setProperty(prop, value, 'important');
        } catch (e) {
          // ignore errors setting style
        }
      }
    });

    // Make sure clone elements are not height-constrained and will expand to fit
    try {
      clonedEl.style.height = 'auto';
      clonedEl.style.minHeight = '0';
      clonedEl.style.maxHeight = 'none';
      if (!clonedEl.style.display || clonedEl.style.display === '') {
        clonedEl.style.display = computedStyle.getPropertyValue('display') || 'block';
      }
      clonedEl.style.visibility = 'visible';
      
      // For SVG elements, ensure they have explicit dimensions
      if (clonedEl.tagName === 'svg') {
        const bbox = (originalEl as any).getBBox ? (originalEl as any).getBBox() : null;
        if (bbox) {
          if (!clonedEl.getAttribute('width')) clonedEl.setAttribute('width', Math.ceil(bbox.width).toString());
          if (!clonedEl.getAttribute('height')) clonedEl.setAttribute('height', Math.ceil(bbox.height).toString());
        }
      }
    } catch (e) {
      // ignore
    }
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if element contains charts/SVGs and give extra time for rendering
  const hasCharts = elementClone.querySelector('svg') || elementClone.querySelector('canvas');
  if (hasCharts) {
    // Force layout recalculation on all SVG elements
    const svgs = elementClone.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.getBoundingClientRect(); // Force layout
      // Ensure SVG is visible and has proper size
      const style = window.getComputedStyle(svg);
      if (!svg.getAttribute('width')) {
        const width = parseFloat(style.width);
        if (width > 0) svg.setAttribute('width', width.toString());
      }
      if (!svg.getAttribute('height')) {
        const height = parseFloat(style.height);
        if (height > 0) svg.setAttribute('height', height.toString());
      }
    });
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  try {
    const fonts = (document as any).fonts;
    if (fonts && fonts.ready && typeof fonts.ready.then === 'function') {
      await fonts.ready;
    }
  } catch (e) {
    // ignore if fonts API is not supported
  }

  tempContainer.getBoundingClientRect();

  // Copy canvas contents
  try {
    const originalCanvases = element.querySelectorAll('canvas');
    const clonedCanvases = elementClone.querySelectorAll('canvas');
    for (let idx = 0; idx < originalCanvases.length; idx++) {
      const origCanvas = originalCanvases[idx] as HTMLCanvasElement;
      const cloneCanvas = clonedCanvases[idx] as HTMLCanvasElement | undefined;
      if (!cloneCanvas) continue;
      try {
        const ctx = cloneCanvas.getContext('2d');
        if (ctx) {
          cloneCanvas.width = origCanvas.width;
          cloneCanvas.height = origCanvas.height;
          ctx.drawImage(origCanvas, 0, 0);
        }
      } catch (e) {
        // ignore
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
    });

    return canvas;
  } finally {
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}

/**
 * Convert OKLCH colors to RGB for Word compatibility
 */
function convertColorToRGB(color: string): string {
  if (!color || ['transparent', 'rgba(0,0,0,0)', 'none'].includes(color)) return color;
  if (!color.includes('oklch') && !color.includes('oklab')) return color;
  
  try {
    const temp = document.createElement('div');
    temp.style.color = color;
    document.body.appendChild(temp);
    const computed = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);
    return computed || 'rgb(0, 0, 0)';
  } catch (e) {
    return 'rgb(0, 0, 0)';
  }
}

/**
 * Helper to convert Base64 string to Uint8Array safely
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate Word Document from report preview pages
 */
export async function generateReportWord(filename: string = 'Risk-Assessment-Report.docx'): Promise<void> {
  try {
    console.log('Starting Word export...');
    
    const previewContainer = document.querySelector('.space-y-8') as HTMLElement;
    if (!previewContainer) throw new Error('Report preview not found.');

    const pages = Array.from(previewContainer.children) as HTMLElement[];
    if (pages.length === 0) throw new Error('No report pages found.');

    const docChildren: Paragraph[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page) continue;
      
      console.log(`Processing page ${i + 1}/${pages.length}...`);

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '816px';
      tempContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempContainer);

      const pageClone = page.cloneNode(true) as HTMLElement;
      pageClone.style.width = '816px';
      pageClone.style.height = '1056px';
      tempContainer.appendChild(pageClone);

      // Copy and fix colors (keeping your logic)
      const originalElements = page.querySelectorAll('*');
      const clonedElements = pageClone.querySelectorAll('*');
      
      originalElements.forEach((originalEl, index) => {
        const clonedEl = clonedElements[index] as HTMLElement;
        if (!clonedEl) return;
        const computedStyle = window.getComputedStyle(originalEl);
        
        ['color', 'background-color', 'border-color'].forEach(prop => {
          let value = computedStyle.getPropertyValue(prop);
          if (value) {
            clonedEl.style.setProperty(prop, convertColorToRGB(value), 'important');
          }
        });
      });

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 816,
        });

        // FIX: Extract clean base64 and convert to Uint8Array
        const imageData = canvas.toDataURL('image/png');
        const base64Data = imageData.split(',')[1];
        if (!base64Data) throw new Error('Failed to extract base64 image data');
        const imageBytes = base64ToUint8Array(base64Data);

        // Use Letter width (8.5in = 612pt) to match PDF output. Calculate height to maintain aspect ratio.
        const imageWidthInPoints = 612;
        const imageHeightInPoints = (canvas.height * imageWidthInPoints) / canvas.width;

        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imageBytes,
                transformation: {
                  width: imageWidthInPoints,
                  height: imageHeightInPoints,
                },
                type: 'png', // Crucial for Word's XML relationship mapping
              }),
            ],
            spacing: { before: 0, after: 0 },
          })
        );

        if (i < pages.length - 1) {
          docChildren.push(new Paragraph({ children: [new PageBreak()] }));
        }
        
      } finally {
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
      }
    }

    // Final Document Generation
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        children: docChildren,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
    console.log('Word document exported successfully!');
    
  } catch (error) {
    console.error('Word export failed:', error);
    throw error;
  }
}

/**
 * Generate Word Document from dashboard components
 */
export async function generateDashboardWord(
  reportType: 'cro' | 'ciso' | 'board',
  organizationName: string,
  generatedDate: string,
  onProgress?: (message: string) => void,
  rootElement?: HTMLElement
): Promise<void> {
  try {
    onProgress?.('Initializing Word generation...');

    const docChildren: Paragraph[] = [];

    // Step 1: Generate and add cover page
    onProgress?.('Generating cover page...');

    let coverCaptured = false;
    if (rootElement) {
      const coverChild = rootElement.querySelector('.report-cover') as HTMLElement | null;
      if (coverChild) {
        const canvas = await captureElement(coverChild, 816);
        const base64Data = canvas.toDataURL('image/png').split(',')[1];
        if (base64Data) {
          const imageBytes = base64ToUint8Array(base64Data);
          const imageWidthInPoints = 612;
          const imageHeightInPoints = (canvas.height * imageWidthInPoints) / canvas.width;

          docChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: imageBytes,
                  transformation: {
                    width: imageWidthInPoints,
                    height: imageHeightInPoints,
                  },
                  type: 'png',
                }),
              ],
              spacing: { before: 0, after: 0 },
            })
          );

          docChildren.push(new Paragraph({ children: [new PageBreak()] }));
          coverCaptured = true;
        }
      }
    }

    if (!coverCaptured) {
      onProgress?.('Creating fallback cover page...');
      // Fallback: create a simple text-based cover
      docChildren.push(
        new Paragraph({
          text: `${reportType.toUpperCase()} Report`,
          alignment: AlignmentType.CENTER,
          spacing: { before: 1440, after: 720 },
        }),
        new Paragraph({
          text: organizationName,
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
        }),
        new Paragraph({
          text: new Date(generatedDate).toLocaleDateString(),
          alignment: AlignmentType.CENTER,
          spacing: { after: 1440 },
        }),
        new Paragraph({ children: [new PageBreak()] })
      );
    }

    // Step 2: Capture dashboard content
    onProgress?.('Capturing dashboard content...');

    const mainContent = rootElement ? rootElement : (document.querySelector('main') as HTMLElement);
    if (!mainContent) {
      throw new Error('Main content not found');
    }

    const dashboardContainer = (mainContent.querySelector?.('.space-y-6, .space-y-8') as HTMLElement) || mainContent;
    if (!dashboardContainer) {
      throw new Error('Dashboard container not found');
    }

    const sections = Array.from(dashboardContainer.children).filter(child => {
      const el = child as HTMLElement;
      return el.offsetHeight > 0 && !el.classList.contains('hidden');
    }) as HTMLElement[];

    onProgress?.(`Found ${sections.length} dashboard sections to export`);

    const captureWidth = 816;
    const pageHeight = 792;
    const padding = 30; // Increased for safety

    // Capture sections individually
    const capturedSections: Array<{ canvas: HTMLCanvasElement; imgData: string; width: number; height: number; element?: HTMLElement }> = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section) continue;

      onProgress?.(`Capturing section ${i + 1}/${sections.length}...`);

      try {
        const canvas = await captureElement(section, captureWidth);
        const imgData = canvas.toDataURL('image/png');
        capturedSections.push({
          canvas,
          imgData,
          width: canvas.width,
          height: canvas.height,
          element: section
        });
      } catch (error) {
        console.error(`Failed to capture section ${i + 1}:`, error);
      }
    }

    // Add captured sections to Word document, with pagination logic that prevents cutting
    for (let i = 0; i < capturedSections.length; i += 2) {
      const section1 = capturedSections[i];
      const section2 = capturedSections[i + 1];

      const imgWidthFixed = 612 - (padding * 2);
      const maxHeight = pageHeight - (padding * 2);

      const pushImage = (base64Data: string, width: number, height: number) => {
        const bytes = base64ToUint8Array(base64Data);
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: bytes,
                transformation: {
                  width,
                  height,
                },
                type: 'png',
              }),
            ],
            spacing: { before: padding, after: padding },
          })
        );
      };

      if (section1 && section2) {
        const imgHeight1 = (section1.canvas.height * imgWidthFixed) / section1.canvas.width;
        const imgHeight2 = (section2.canvas.height * imgWidthFixed) / section2.canvas.width;

        // If either is taller than a full page, place them on individual pages scaled to fit
        if (imgHeight1 > maxHeight || imgHeight2 > maxHeight) {
          // Section 1
          const base64Data1 = section1.imgData.split(',')[1];
          if (base64Data1) {
            if (imgHeight1 > maxHeight) {
              const scale = maxHeight / imgHeight1;
              pushImage(base64Data1, Math.round(imgWidthFixed * scale), Math.round(imgHeight1 * scale));
            } else {
              pushImage(base64Data1, imgWidthFixed, Math.round(imgHeight1));
            }
            docChildren.push(new Paragraph({ children: [new PageBreak()] }));
          }

          // Section 2
          const base64Data2 = section2.imgData.split(',')[1];
          if (base64Data2) {
            if (imgHeight2 > maxHeight) {
              const scale2 = maxHeight / imgHeight2;
              pushImage(base64Data2, Math.round(imgWidthFixed * scale2), Math.round(imgHeight2 * scale2));
            } else {
              pushImage(base64Data2, imgWidthFixed, Math.round(imgHeight2));
            }
            if (i + 2 < capturedSections.length) {
              docChildren.push(new Paragraph({ children: [new PageBreak()] }));
            }
          }
        } else {
          // If either section is large (>= 45% page height) or explicitly marked, put them on separate pages to avoid cramped pairings
          const s1Full = Boolean(section1.element && (section1.element.getAttribute('data-report-full') === 'true' || section1.element.classList.contains('report-full')))
          const s2Full = Boolean(section2.element && (section2.element.getAttribute('data-report-full') === 'true' || section2.element.classList.contains('report-full')))

          if (s1Full || s2Full || imgHeight1 > (maxHeight * 0.45) || imgHeight2 > (maxHeight * 0.45)) {
            const base64Data1 = section1.imgData.split(',')[1]
            if (base64Data1) { pushImage(base64Data1, imgWidthFixed, Math.round(imgHeight1)); docChildren.push(new Paragraph({ children: [new PageBreak()] })) }
            const base64Data2 = section2.imgData.split(',')[1]
            if (base64Data2) { pushImage(base64Data2, imgWidthFixed, Math.round(imgHeight2)); if (i + 2 < capturedSections.length) docChildren.push(new Paragraph({ children: [new PageBreak()] })) }
          } else {
            // Both fit on a single page
            const sectionGap = padding * 1.5
            const totalHeight = imgHeight1 + imgHeight2 + sectionGap;
            if (totalHeight <= maxHeight) {
              // If there's too much blank space, gently scale up both sections (up to 1.15x max) to better fill the page
              const scaleUp = Math.min(1.15, maxHeight / totalHeight)
              const base64Data1 = section1.imgData.split(',')[1]
              const base64Data2 = section2.imgData.split(',')[1]

              if (scaleUp > 1) {
                if (base64Data1) pushImage(base64Data1, Math.round(imgWidthFixed * scaleUp), Math.round(imgHeight1 * scaleUp))
                if (base64Data2) pushImage(base64Data2, Math.round(imgWidthFixed * scaleUp), Math.round(imgHeight2 * scaleUp))
              } else {
                if (base64Data1) pushImage(base64Data1, imgWidthFixed, Math.round(imgHeight1))
                if (base64Data2) pushImage(base64Data2, imgWidthFixed, Math.round(imgHeight2))
              }

              if (i + 2 < capturedSections.length) {
                docChildren.push(new Paragraph({ children: [new PageBreak()] }))
              }
            } else {
              // Combined too tall - put them on separate pages (no scaling to maintain readability)
              const base64Data1 = section1.imgData.split(',')[1]
              if (base64Data1) {
                pushImage(base64Data1, imgWidthFixed, Math.round(imgHeight1))
                docChildren.push(new Paragraph({ children: [new PageBreak()] }))
              }
              const base64Data2 = section2.imgData.split(',')[1]
              if (base64Data2) {
                pushImage(base64Data2, imgWidthFixed, Math.round(imgHeight2))
                if (i + 2 < capturedSections.length) {
                  docChildren.push(new Paragraph({ children: [new PageBreak()] }))
                }
              }
            }
          }
        }
      } else if (section1) {
        const imgHeight1 = (section1.canvas.height * imgWidthFixed) / section1.canvas.width;
        const base64Data1 = section1.imgData.split(',')[1];
        if (base64Data1) {
          if (imgHeight1 > maxHeight) {
            const scale = maxHeight / imgHeight1;
            pushImage(base64Data1, Math.round(imgWidthFixed * scale), Math.round(imgHeight1 * scale));
          } else {
            pushImage(base64Data1, imgWidthFixed, Math.round(imgHeight1));
          }
          if (i + 2 < capturedSections.length) {
            docChildren.push(new Paragraph({ children: [new PageBreak()] }));
          }
        }
      }
    }

    // Final Document Generation
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        children: docChildren,
      }],
    });

    const filename = `${reportType.toUpperCase()}-Report-${organizationName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`;
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);

    onProgress?.(`Word document exported successfully! (${capturedSections.length} sections)`);

  } catch (error) {
    console.error('Word generation failed:', error);
    throw error;
  }
}