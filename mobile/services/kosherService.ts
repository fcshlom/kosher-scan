import { parse } from 'node-html-parser';

export interface KosherItem {
  id: string;
  name: string;
  company: string;
  imgSrc: string;
  kosherCertification: string;
  notes?: string;
  keywords?: string[];
}

export async function fetchKosherData(): Promise<KosherItem[]> {
  try {
    console.log('🌐 Fetching data from kosharot.co.il...');
    const response = await fetch('https://www.kosharot.co.il/index2.php?id=281&lang=HEB');
    const html = await response.text();
    
    console.log('📄 HTML length:', html.length);
    console.log('📄 First 50 chars:', html.substring(0, 50));
    
    return parseKosherData(html);
  } catch (error) {
    console.error('❌ Error fetching kosher data:', error);
    // Return sample data for development/testing
    return [];
  }
}

function parseKosherData(html: string): KosherItem[] {
  const kosherItems: KosherItem[] = [];
  
  try {
    console.log('🔍 Starting HTML parsing...');
    
    // Remove HTML tags for better text extraction
    const root = parse(html);
    const products = root.querySelectorAll('div.product_card');

    let currentItem: Partial<KosherItem> = {};
    let itemCount = 0;
    
    const toAbsoluteUrl = (src?: string | null): string => {
      if (!src) return '';
      if (src === "kosharotProductsFiles/NoPicture.jpg") return '';
      if (src.startsWith('http://') || src.startsWith('https://')) return src;
      if (src.startsWith('//')) return `https:${src}`;
      if (src.startsWith('/')) return `https://www.kosharot.co.il${src}`;
      return `https://www.kosharot.co.il/${src.replace(/^\.\//, '')}`;
    };
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(product.textContent);
      const name = product.querySelector('p.prd_title')?.textContent;
      const notes = product.querySelector('div.remark')?.textContent;
      const kosherCertification = product.querySelector('div.product_text>strong')?.textContent;
      const img = product.querySelector('a.parent_image>img')?.getAttribute('src');
      const keywords = product.querySelector('div.product_keywords')?.textContent.split(',');
      kosherItems.push({
        id: `item_${kosherItems.length + 1}`,
        name: name || '',
        company: "",
        imgSrc: toAbsoluteUrl(img || ''),
        kosherCertification: kosherCertification || "",
        notes: notes || "",
        keywords: keywords || [],
      });
      itemCount++;
      console.log(`✅ Found item ${itemCount}:`, img);
      currentItem = {};
    
    }
    
    console.log(`📊 Parsing complete. Found ${kosherItems.length} items.`);
    
  } catch (error) {
    console.error('❌ Error parsing HTML:', error);
  }
  
  return kosherItems;
}
