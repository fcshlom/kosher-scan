export interface KosherItem {
  id: string;
  name: string;
  company: string;
  kosherCertification: string;
  notes?: string;
}

export async function fetchKosherData(): Promise<KosherItem[]> {
  try {
    console.log('🌐 Fetching data from kosharot.co.il...');
    const response = await fetch('https://www.kosharot.co.il/index2.php?id=281&lang=HEB');
    const html = await response.text();
    
    console.log('📄 HTML length:', html.length);
    console.log('📄 First 500 chars:', html.substring(0, 500));
    
    return parseKosherData(html);
  } catch (error) {
    console.error('❌ Error fetching kosher data:', error);
    // Return sample data for development/testing
    return getSampleData();
  }
}

function parseKosherData(html: string): KosherItem[] {
  const kosherItems: KosherItem[] = [];
  
  try {
    console.log('🔍 Starting HTML parsing...');
    
    // Remove HTML tags for better text extraction
    const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('🧹 Clean text length:', cleanText.length);
    console.log('🧹 First 300 chars of clean text:', cleanText.substring(0, 300));
    
    // Split into lines and filter
    const lines = cleanText.split(' ').filter(line => line.trim().length > 0);
    console.log('📝 Number of words:', lines.length);
    
    let currentItem: Partial<KosherItem> = {};
    let itemCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for kosher certification patterns
      if (line.includes('חתם') || 
          line.includes('סופר') ||
          line.includes('בית') ||
          line.includes('יוסף') || 
          line.includes('רבנות') ||
          line.includes('בדץ') ||
          line.includes('KF') ||
          line.includes('באישור')) {
        
        if (currentItem.name && currentItem.company) {
          kosherItems.push({
            id: `item_${kosherItems.length + 1}`,
            name: currentItem.name,
            company: currentItem.company,
            kosherCertification: line,
            notes: currentItem.notes,
          });
          itemCount++;
          console.log(`✅ Found item ${itemCount}:`, currentItem.name, '-', currentItem.company, '-', line);
          currentItem = {};
        }
      } else if (line.length > 2 && line.length < 50 && !line.includes('http') && !line.includes('www')) {
        // This might be a product or company name
        if (!currentItem.name) {
          currentItem.name = line;
        } else if (!currentItem.company) {
          currentItem.company = line;
        }
      }
    }
    
    console.log(`📊 Parsing complete. Found ${kosherItems.length} items.`);
    
  } catch (error) {
    console.error('❌ Error parsing HTML:', error);
  }
  
  // If no items found, return sample data
  if (kosherItems.length === 0) {
    console.log('⚠️ No items found, returning sample data');
    return getSampleData();
  }
  
  return kosherItems;
}

function getSampleData(): KosherItem[] {
  return [
    {
      id: '1',
      name: 'חלב טרי 3%',
      company: 'תנובה',
      kosherCertification: 'חתם סופר',
      notes: 'מומלץ על ידי כושרות',
    },
    {
      id: '2',
      name: 'לחם אחיד',
      company: 'אנגל',
      kosherCertification: 'בית יוסף',
    },
    {
      id: '3',
      name: 'שמן זית כתית',
      company: 'הרדוף',
      kosherCertification: 'רבנות ירושלים',
      notes: 'כשר לפסח',
    },
    {
      id: '4',
      name: 'קפה שחור',
      company: 'עלית',
      kosherCertification: 'בדץ בית יוסף',
    },
    {
      id: '5',
      name: 'שוקולד חלב',
      company: 'שטראוס',
      kosherCertification: 'חתם סופר',
    },
    {
      id: '6',
      name: 'מים מינרליים',
      company: 'מי עדן',
      kosherCertification: 'רבנות תל אביב',
    },
    {
      id: '7',
      name: 'יוגורט טבעי',
      company: 'יוטלה',
      kosherCertification: 'בית יוסף',
    },
    {
      id: '8',
      name: 'פסטה ספגטי',
      company: 'פסטה זארה',
      kosherCertification: 'חתם סופר',
      notes: 'כשר לפסח',
    },
    {
      id: '9',
      name: 'עוגיות שוקולד צ\'יפס',
      company: 'עלית',
      kosherCertification: 'בדץ בית יוסף',
    },
    {
      id: '10',
      name: 'מיץ תפוזים',
      company: 'פריגת',
      kosherCertification: 'רבנות חיפה',
    },
  ];
}

