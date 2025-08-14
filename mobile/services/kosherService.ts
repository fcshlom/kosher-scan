import { parseDocument } from 'htmlparser2';
import { selectAll, selectOne } from 'css-select';
import { getAttributeValue, textContent } from 'domutils';
import type { Element, Document, Node, AnyNode } from 'domhandler';

export interface KosherItem {
  id: string;
  name: string;
  company: string;
  kosherCertification: string;
  notes?: string;
  keywords?: string;
  imageUrl?: string;
}

export async function fetchKosherData(): Promise<KosherItem[]> {
  try {
    console.log('🌐 Fetching data from kosharot.co.il...');
    const response = await fetch('https://www.kosharot.co.il/index2.php?id=281&lang=HEB');
    const html = await response.text();

    console.log('📄 HTML length:', html.length);
    console.log('📄 First 500 chars:', html.substring(0, 500));

    const document = parseDocument(html);

    const parsed = parseWithDom(document);
    console.log(`📊 DOM parse count: ${parsed.length}`);

    return parsed;
  } catch (error) {
    console.error('❌ Error fetching kosher data:', error);
    return [];
  }
}

function parseWithDom(document: Document): KosherItem[] {
  const root: Node = document;

  // Using the entire document as the scope for querying
  let scope: Node = root;

  // Collect both product_card and product-card
  const cards: Element[] = selectAll('div.product_card, div.product-card', [scope]);

  if (cards.length === 0) {
    // Fallback: search by title nodes and expand upwards
    const titles: Element[] = selectAll('p.prd_title, p.prd-title', [scope]);
    const items: KosherItem[] = titles.map((titleNode: Node, idx: number) => buildItemFromTitleNode(titleNode, idx + 1)).filter(Boolean) as KosherItem[];
    return items;
  }

  const items: KosherItem[] = [];
  cards.forEach((cardNode: Element, idx: number) => {
    const titleNode = selectOne('p.prd_title, p.prd-title', [cardNode]);
    const name = titleNode ? cleanText(textContent(titleNode)) : '';
    if (!name) return;

    const company = extractCompanyFromTitle(name) || '—';

    // Image URL from <a class="parent_image"> (href) or nested <img src>
    let imageUrl: string | undefined;
    const a = selectOne('a.parent_image, a.parent-image', [cardNode]);
    if (a) {
      imageUrl = getAttributeValue(a as Element, 'href') || undefined;
      if (!imageUrl) {
        const img = selectOne('img', [a]);
        if (img) imageUrl = getAttributeValue(img as Element, 'src') || undefined;
      }
    }

    const kosherCertification = extractKosherCertification(imageUrl, name);

    const remarkNode = selectOne('div.remark', [cardNode]);
    const notes = remarkNode ? cleanText(textContent(remarkNode)) : undefined;

    const keywordsNode = selectOne('div.product_keywords, div.product-keywords', [cardNode]);
    const keywords = keywordsNode ? cleanText(textContent(keywordsNode)) : undefined;

    items.push({
      id: `item_${idx + 1}`,
      name,
      company,
      kosherCertification,
      notes,
      keywords,
      imageUrl,
    });
  });

  return items;
}

function buildItemFromTitleNode(titleNode: Node, index: number): KosherItem | null {
  try {
    const name = cleanText(textContent(titleNode as AnyNode));
    if (!name) return null;

    // Search nearby ancestors for expected blocks
    const cardLike = findAncestorWithClass(titleNode, ['product_card', 'product-card']) || titleNode.parentNode;

    let imageUrl: string | undefined;
    const a = cardLike ? selectOne('a.parent_image, a.parent-image', [cardLike as AnyNode]) : null;
    if (a) {
      imageUrl = getAttributeValue(a as Element, 'href') || (selectOne('img', [a as AnyNode]) ? getAttributeValue(selectOne('img', [a as AnyNode])! as Element, 'src') : undefined) || undefined;
    }

    const notes = cardLike && selectOne('div.remark', [cardLike as AnyNode]) ? cleanText(textContent(selectOne('div.remark', [cardLike as AnyNode])! as AnyNode)) : undefined;
    const keywords = cardLike && selectOne('div.product_keywords, div.product-keywords', [cardLike as AnyNode]) ? cleanText(textContent(selectOne('div.product_keywords, div.product-keywords', [cardLike as AnyNode])! as AnyNode)) : undefined;

    const company = extractCompanyFromTitle(name) || '—';
    const kosherCertification = extractKosherCertification(imageUrl, name);

    return {
      id: `title_item_${index}`,
      name,
      company,
      kosherCertification,
      notes,
      keywords,
      imageUrl,
    };
  } catch {
    return null;
  }
}

function findAncestorWithClass(node: Node, classNames: string[]): Node | null {
  let cur: Node | null = node;
  while (cur && cur.parentNode) {
    // Ensure cur is treated as Element to access attribs
    const attributes = (cur as Element).attribs || {};
    const cls = attributes['class'] || '';
    if (classNames.some((c) => cls.split(/\s+/).includes(c))) return cur;
    cur = cur.parentNode;
  }
  return null;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
}

function extractCompanyFromTitle(title: string): string | null {
  const companyPatterns = [
    /תנובה/i,
    /שטראוס/i,
    /עלית/i,
    /אנגל/i,
    /הרדוף/i,
    /יוטלה/i,
    /פריגת/i,
    /מי עדן/i,
    /פסטה זארה/i,
  ];
  for (const pattern of companyPatterns) {
    const match = title.match(pattern);
    if (match) return match[0];
  }
  return null;
}

function extractKosherCertification(imageUrl: string | undefined, title: string): string {
  if (imageUrl) {
    const urlDecoded = decodeURIComponent(imageUrl);
    const urlPatterns = [
      /חתם\s*סופר/i,
      /בית\s*יוסף/i,
      /רבנות[\s\-]*[\u0590-\u05FF]*/i,
      /בד["']?ץ?[\s\-]*[\u0590-\u05FF]*/i,
      /KF/i,
      /OU/i,
      /OK/i,
    ];
    for (const pattern of urlPatterns) {
      const match = urlDecoded.match(pattern);
      if (match) return match[0];
    }
  }

  const titlePatterns = [
    /חתם\s*סופר/i,
    /בית\s*יוסף/i,
    /רבנות[\s\-]*[\u0590-\u05FF]*/i,
    /בד["']?ץ?[\s\-]*[\u0590-\u05FF]*/i,
    /KF/i,
    /OU/i,
    /OK/i,
  ];
  for (const pattern of titlePatterns) {
    const match = title.match(pattern);
    if (match) return match[0];
  }
  return 'כשרות לא ידועה';
}

export function getSampleData(): KosherItem[] {
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
      name: "עוגיות שוקולד צ'יפס",
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

