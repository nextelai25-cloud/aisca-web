/**
 * BS360 Quiz Grid — question bank (all 6 grids).
 *
 * Each grid = 16 boxes arranged as a 4x4 board:
 *   rows    = difficulty (Easy, Medium, Hard, Super Hard)
 *   columns = subject    (Economics, Business Studies, Accounting, General Knowledge)
 *
 * box_index = difficultyIndex * 4 + subjectIndex   (0-15, row-major)
 * This index is the number stored in Supabase (bs360_reveals.box_index),
 * so the box order below MUST stay fixed for every grid.
 *
 * Grids 1-6 are generated from "BS360 Final Quiz.docx" (Question Sets 1-6).
 * Only the question is shown in the app (answers are intentionally omitted).
 * A few boxes carry an accompanying image (see the `image` field).
 */

export type QuizLang = 'en' | 'si' | 'ta';

export const SUBJECTS = [
  'Economics',
  'Business Studies',
  'Accounting',
  'General Knowledge',
] as const;

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Super Hard'] as const;

export const POINTS_BY_DIFFICULTY = [1, 3, 5, 8] as const; // Easy, Medium, Hard, Super Hard

export type Subject = (typeof SUBJECTS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface QuizBox {
  subject: Subject;
  difficulty: Difficulty;
  points: number;
  question: Record<QuizLang, string>;
  /** optional image shown with the question (path under /public) */
  image?: string;
  /** true = no question written yet for this box; shown as "coming soon" and not clickable */
  pending?: boolean;
}

export interface QuizGrid {
  id: number;
  label: string;
  /** false = this whole grid hasn't been uploaded yet */
  available: boolean;
  /** true = practice grid: fully client-side, never stored, never scored */
  demo?: boolean;
  boxes: QuizBox[]; // always length 16, ordered per the comment above
}

// ────────────────────────────────────────────────────────────
// DEMO GRID (id 0) — a practice board shown before Grid 01.
// It runs entirely on the device (no database, no sync) so it is
// independent everywhere and can NEVER affect the scoreboard.
// ────────────────────────────────────────────────────────────
function demoBox(subject: Subject, difficulty: Difficulty): QuizBox {
  const points = POINTS_BY_DIFFICULTY[DIFFICULTIES.indexOf(difficulty)];
  return {
    subject,
    difficulty,
    points,
    question: {
      en: `Practice question — ${subject} (${difficulty}).\n\nThis is the DEMO grid. Tap a box, choose which team is answering, then read the question in English, Sinhala and Tamil. Nothing here is saved or counted on the scoreboard.`,
      si: `පුහුණු ප්‍රශ්නය — ${subject} (${difficulty}).\n\nමෙය DEMO ජාලකයයි. කොටුවක් තට්ටු කර, පිළිතුරු දෙන කණ්ඩායම තෝරා, ප්‍රශ්නය ඉංග්‍රීසි, සිංහල සහ දෙමළ භාෂාවෙන් කියවන්න. මෙහි කිසිවක් සුරැකෙන්නේ හෝ ලකුණු පුවරුවට ගණන් ගන්නේ නැත.`,
      ta: `பயிற்சி கேள்வி — ${subject} (${difficulty}).\n\nஇது DEMO கட்டம். ஒரு பெட்டியைத் தட்டி, பதிலளிக்கும் அணியைத் தேர்ந்தெடுத்து, கேள்வியை ஆங்கிலம், சிங்களம், தமிழ் ஆகிய மொழிகளில் படியுங்கள். இங்கு எதுவும் சேமிக்கப்படாது அல்லது மதிப்பெண் பலகையில் கணக்கிடப்படாது.`,
    },
  };
}

const DEMO_GRID: QuizGrid = {
  id: 0,
  label: 'Demo Grid',
  available: true,
  demo: true,
  boxes: DIFFICULTIES.flatMap((d) => SUBJECTS.map((s) => demoBox(s, d))),
};

const GRID_1: QuizGrid = {
  id: 1,
  label: 'Grid 01',
  available: true,
  boxes: [
    // Row — Easy
    {
      subject: "Economics",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "If a firm wants to increase its revenue and the price elasticity of demand for its product is equal to -1.5, what should it do to the price?",
        si: "ආයතනයකට තම ආදායම වැඩි කර ගැනීමට අවශ්‍ය නම්, එම ආයතනයේ නිෂ්පාදනයක් සඳහා වන ඉල්ලුමේ මිල නම්‍යතාවය -1.5 නම්, එම නිෂ්පාදනයේ මිල සම්බන්ධයෙන් එම ආයතනය ගත යුතු ක්‍රියාමාර්ගය කුමක්ද?",
        ta: "ஒரு நிறுவனம் தனது வருவாயை அதிகரிக்க விரும்புகிறது மற்றும் அதன் தயாரிப்புக்கான தேவையின் விலை நெகிழ்ச்சி -1.5 க்கு சமமாக இருந்தால், அது என்ன செய்ய வேண்டும் - விலையை அதிகரிக்க வேண்டுமா அல்லது குறைக்க வேண்டுமா?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "What is the purpose of writing \"Not negotiable\"on a cheque?",
        si: "චෙක්පතක හුවමාරු කළ නොහැක) යනුවෙන් සටහන් කිරීමේ අරමුණ වන්නේ",
        ta: "காசோலையில் \"மாற்றிக் கொடுக்க இயலாது\" (Not Negotiable) என்று எழுதுவதன் நோக்கம் என்ன?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "The annual demand for a manufacturing business is 400,000 units. The holding cost per unit is Rs. 20, and the ordering cost per order is Rs. 400. Accordingly. Calculate the Economic Order Quantity (EOQ) of the business",
        si: "නිෂ්පාදන ව්‍යාපාරයක වාර්ෂික ඉල්ලුම ඒකක 400,000ක් වන අතර, ඒකකයක් රඳවා තබාගැනිමේ පිරිවැය රු. 20ක් වේ. එක් ඇණවුමක් සිදු කිරීමේ පිරිවැය රු. 400ක් වේ. ඒ අනුව, ව්‍යාපාරයේ ආර්ථික ඇණවුම් ප්‍රමාණය (EOQ) ගණනය කරන්න",
        ta: "**ஒரு உற்பத்தித் தொழிலின் (Manufacturing Business) வருடாந்திர தேவை (Annual Demand) 400,000 அலகுகள் ஆகும். ஒவ்வொரு அலகிற்குமான இருப்புச் செலவு (Holding Cost) ரூ. 20 ஆகவும், ஒவ்வொரு கொள்வனவு ஆணைக்குமான ஆணையிடல் செலவு (Ordering Cost) ரூ. 400 ஆகவும் உள்ளது.\nஅதன்படி, அத்தொழிலின் பொருளாதார கொள்வனவு அளவை (Economic Order Quantity – EOQ) கணக்கிடுக.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "The method of 'double-entry bookkeeping,' the fundamental basis of modern accounting, was first formally documented in a treatise in the year 1494 by whom?",
        si: "නවීන ගිණුම්කරණයේ මූලික පදනම වන ද්විත්ව සටහන් ක්‍රමය, 1494 වර්ෂයේ දී ග්‍රන්ථයක් මගින් නිල වශයෙන් ප්‍රථම වරට ලේඛනගත කළේ කවුරුන් විසින්ද?",
        ta: "நவீன கணக்கியலுக்கு அடிப்படையான \"இரட்டைப் பதிவு கணக்குவைப்பு\" முறை, 1494 ஆம் ஆண்டு ஆய்வுக் கட்டுரையில் முதன்முதலில் முறையாக ஆவணப்படுத்திய, பெரும்பாலும் \"கணக்கியலின் தந்தை\" என்று அழைக்கப்படும் நபர் யார்?",
      },
    },
    // Row — Medium
    {
      subject: "Economics",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "You are given the following macroeconomic data for a hypothetical economy:\nSavings (S) = Rs. 800 billion\nBudget deficit (BD) = Rs. 200 billion\nNet exports (NX) = Rs. -50 billion.\nAccording to this information, what must be the level of investment (I) for this economy?",
        si: "උපකල්පිත ආර්ථිකයක් සඳහා පහත සඳහන් සාර්ව ආර්ථික දත්ත ලබා දී ඇත:\nඉතිරිකිරීම් (S) = රු. බිලියන 800\nඅයවැය හිඟය (BD) = රු. බිලියන 200\nශුද්ධ අපනයන (NX) = රු. -බිලියන 50\nමෙම තොරතුරු වලට අනුව, මෙම ආර්ථිකයේ ආයෝජන මට්ටම (I) විය යුත්තේ කුමක්ද?",
        ta: "ஒரு கற்பனையான பொருளாதாரத்திற்கான பின்வரும் மேக்ரோ பொருளாதார தரவுகள் உங்களுக்கு வழங்கப்பட்டுள்ளன:\nசேமிப்பு (S) = ரூ. 800 பில்லியன்\nவரவுசெலவுத் திட்டப் பற்றாக்குறை (BD) = ரூ. 200 பில்லியன்\nநிகர ஏற்றுமதி (NX) = ரூ. -50 பில்லியன்.\nஇத்தகவல்களின்படி, இப்பொருளாதாரத்திற்கான முதலீட்டு மட்டம் (I) என்னவாக இருக்க வேண்டும்?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "While Sudara’s motor vehicle is Rs. 2 million worth he insured it for Rs. 1 million , a damage of 1.5 million loss occured for him in an accident.The compensation he will receive is?",
        si: "සුදාර මහතාගේ මෝටර් රථයේ සැබෑ වටිනාකම රු. මිලියන 2 කි. නමුත් ඔහු එය රු. මිලියන 1 කට පමණක් රක්ෂණය කර ඇත. අනතුරකදී ඔහුට රු. මිලියන 1.5 ක හානියක් සිදු විය.\nසුදාර මහතාට ලැබෙන වන්දි මුදල කොපමණද?",
        ta: "சுதாராவின் மோட்டார் வாகனத்தின் பெறுமதி ரூ. 2 மில்லியன் ஆகும். ஆனால், அவர் அதனை ரூ. 1 மில்லியனுக்கு மட்டுமே காப்புறுதி (Insurance) செய்துள்ளார். விபத்தொன்றில் அவருக்கு ரூ. 1.5 மில்லியன் பெறுமதியான சேதம் ஏற்பட்டது.\nஅவர் பெறும் காப்புறுதி இழப்பீட்டுத் தொகை (Compensation) எவ்வளவு?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "Nadeesha Limited Public Company manufactures a single product. The annual production capacity of the company is 5,000 units. The following information is related to this product.\nThe total cost at activity levels of 1,000 units and 2,000 units are Rs. 200,000 and Rs. 250,000 respectively. \nThe contribution to sales ratio is 60%. \nIf the activity level exceeds 2,500 units, the company has to incur an additional fixed cost of Rs. 50,000. \nCalculate:\nUnit variable cost \nProfit/(Loss) at an activity level of 3,000 units",
        si: "සීමිත නදීශා පොදු සමාගම තනි නිෂ්පාදන භාණ්ඩයක් නිෂ්පාදනය කරන අතර, එහි වාර්ෂික උපරිම නිෂ්පාදන ධාරිතාව ඒකක 5,000කි.\nමෙම භාණ්ඩයට අදාළ තොරතුරු පහත දැක්වේ:\nක්‍රියාකාරී මට්ටම ඒකක 1,000 දී මුළු පිරිවැය රු. 200,000ක් වන අතර, ක්‍රියාකාරී මට්ටම ඒකක 2,000 දී මුළු පිරිවැය රු. 250,000කි.\nදායක විකුණුම් අනුපාතය (Contribution to Sales Ratio) 60%කි.\nක්‍රියාකාරී මට්ටම ඒකක 2,500 ඉක්මවූ විට, සමාගමට අතිරේක ස්ථාවර පිරිවැයක් ලෙස රු. 50,000ක් දැරීමට සිදුවේ.\nඉහත තොරතුරු පදනම් කරගෙන පහත සඳහන් දෑ ගණනය කරන්න:\nඒකකයක විචල්‍ය පිරිවැය (Variable cost per unit)\nක්‍රියාකාරී මට්ටම ඒකක 3,000ක් වන විට ලාභය හෝ අලාභය",
        ta: "நதீஷா லிமிடெட் பொது நிறுவனம் ஒரு வகையான பொருளை மட்டுமே உற்பத்தி செய்கிறது. நிறுவனத்தின் வருடாந்திர உற்பத்தித் திறன் 5,000 அலகுகள் ஆகும். இப்பொருளுடன் தொடர்புடைய தகவல்கள் பின்வருமாறு:\n1,000 அலகுகள் மற்றும் 2,000 அலகுகள் என்ற செயற்பாட்டு மட்டங்களில் மொத்தச் செலவு முறையே ரூ. 200,000 மற்றும் ரூ. 250,000 ஆகும்.\nவிற்பனைக்கான பங்களிப்பு விகிதம் (Contribution to Sales Ratio) 60% ஆகும்.\nசெயற்பாட்டு மட்டம் 2,500 அலகுகளை மீறினால், நிறுவனம் மேலதிகமாக ரூ. 50,000 நிலையான செலவை ஏற்க வேண்டும்.\nகணக்கிடுக:\nஒரு அலகிற்கான மாறுபடு செலவு\n3,000 அலகுகள் என்ற செயற்பாட்டு மட்டத்தில் ஏற்படும் இலாபம் / (நட்டம்)",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "Which country is home to the largest number of active volcanoes in the world?",
        si: "ලෝකයේ වැඩිම සක්‍රීය ගිනි කඳු සංඛ්‍යාවක් ඇති රට කුමක්ද?",
        ta: "உலகின் அதிக எண்ணிக்கையிலான செயலில் உள்ள எரிமலைகளைக் கொண்ட நாடு எது?",
      },
    },
    // Row — Hard
    {
      subject: "Economics",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Assume that the government imposes a price ceiling of Rs. 200 per kilogram of rice to protect consumers. Calculate the consumer surplus before the price ceiling is imposed using the following demand and supply schedules:\n- At Price Rs. 50: Qd = 700, Qs = -50\n- At Price Rs. 100: Qd = 600, Qs = 0",
        si: "පාරිභෝගිකයින් ආරක්ෂා කිරීම සඳහා රජය සහල් කිලෝග්‍රෑමයකට රු. 200 ක උපරිම මිලක් පනවන බව උපකල්පනය කරන්න. උපරිම මිල පැනවීමට පෙර පාරිභෝගික අතිරික්තය පහත ඉල්ලුම් සහ සැපයුම් දත්ත ඇසුරින් ගණනය කරන්න:\n- මිල රු. 50 දී: Qd = 700, Qs = -50\n- මිල රු. 100 දී: Qd = 600, Qs = 0",
        ta: "நுகர்வோரைப் பாதுகாப்பதற்காக அரசாங்கம் அரிசி ஒரு கிலோவிற்கு ரூ. 200 உச்ச விலை வரம்பை விதிக்கிறது என்று வைத்துக்கொள்வோம். உச்ச விலை விதிக்கப்படுவதற்கு முன்னரான நுகர்வோர் உபரியை பின்வரும் தேவை மற்றும் வழங்கல் விபரங்களின்படி கணக்கிடுக:\n- விலை ரூ. 50 இல்: Qd = 700, Qs = -50\n- விலை ரூ. 100 இல்: Qd = 600, Qs = 0",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "What is indicated by the ISO 27001 standard achieved by a business?",
        si: "ව්‍යාපාරයක් විසින් ISO 27001 සහතිකය ලබා ගැනීමෙන් පෙන්නුම් කරන්නේ කුමක්ද?",
        ta: "ஒரு வணிகத்தால் பெறப்பட்ட ISO 27001 தரநிலை எதைக் குறிக்கிறது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "According to LKAS 08 (Accounting Policies, Changes in Accounting Estimates and Errors) standard, which of the following statements regarding the selection and application of accounting policies is true?\nA. It is necessary for a business to apply selected accounting policies consistently.\nB. An accounting policy can be changed only if the change is required by an accounting standard or results in the financial statements providing reliable and more relevant information about the financial position, financial performance, and cash flows of the business.\nC. Disclosure of accounting policies used by a business is not mandatory.\nD. In the absence of an accounting standard that specifically applies to a transaction, the management of the entity must use its judgment in developing and applying an accounting policy.",
        si: "LKAS 08 – ගිණුම්කරණ ප්‍රතිපත්ති, ගිණුම්කරණ ඇස්තමේන්තු වල වෙනස්කම් සහ දෝෂ යන ගිණුම්කරණ ප්‍රමිතියට අනුව, ගිණුම්කරණ ප්‍රතිපත්ති තෝරාගැනීම සහ යෙදවීම සම්බන්ධයෙන් පහත සඳහන් ප්‍රකාශ අතරින් නිවැරදි ප්‍රකාශය/ි ප්‍රකාශ කුමක්ද?\nA. ආයතනයක් විසින් තෝරාගත් ගිණුම්කරණ ප්‍රතිපත්ති ඒකාකාරීව (අඛණ්ඩව) යෙදීම අවශ්‍ය වේ.\nB. ගිණුම්කරණ ප්‍රතිපත්තියක් වෙනස් කළ හැක්කේ එම වෙනස ගිණුම්කරණ ප්‍රමිතියක අවශ්‍යතාවයක් මත සිදු වන්නේ නම් හෝ ආයතනයේ මූල්‍ය තත්ත්වය, මූල්‍ය කාර්යසාධනය සහ මුදල් ප්‍රවාහයන් පිළිබඳ විශ්වසනීය හා වඩාත් අදාළ තොරතුරු මූල්‍ය ප්‍රකාශන මගින් ලබාදීමට හේතු වන්නේ නම් පමණි.\nC. ආයතනයක් විසින් භාවිත කරන ලද ගිණුම්කරණ ප්‍රතිපත්ති හෙළිදරව් කිරීම අනිවාර්ය නොවේ.\nD. ගනුදෙනුවකට හෝ සිදුවීමකට අදාළ වන නිශ්චිත ගිණුම්කරණ ප්‍රමිතියක් නොමැති අවස්ථාවක, ගිණුම්කරණ ප්‍රතිපත්තියක් සකස් කිරීම හා යෙදවීම සඳහා ආයතනයේ කළමනාකාරීත්වය තම විනිශ්චය භාවිත කළ යුතුය.",
        ta: "LKAS 08 (கணக்கியல் கொள்கைகள், கணக்கியல் மதிப்பீடுகளில் மாற்றங்கள் மற்றும் தவறுகள்) தரநிலையின்படி, கணக்கியல் கொள்கைகளைத் தேர்ந்தெடுப்பது மற்றும் பயன்படுத்துவது தொடர்பான பின்வரும் கூற்றுகளில் எது உண்மையானது?\nA. ஒரு வணிகம் தேர்ந்தெடுத்த கணக்கியல் கொள்கைகளை சீராகப் பயன்படுத்துவது அவசியமாகும்.\nB. ஒரு கணக்கியல் கொள்கையை கணக்கியல் தரநிலையின் தேவையின் பேரில் அல்லது வணிகத்தின் நிதி நிலைமை, நிதிச் செயல்பாடு மற்றும் பணப்பாய்வு பற்றிய நம்பகமான மற்றும் மிகவும் பொருத்தமான தகவல்களை வழங்கக்கூடிய சந்தர்ப்பங்களில் மட்டுமே மாற்ற முடியும்.\nC. ஒரு வணிகத்தால் பயன்படுத்தப்படும் கணக்கியல் கொள்கைகளை வெளிப்படுத்துவது கட்டாயமில்லை.\nD. ஒரு பரிவர்த்தனைக்கு பொருத்தமான கணக்கியல் தரநிலை இல்லாத சந்தர்ப்பத்தில், நிறுவனத்தின் நிர்வாகம் தனது தீர்ப்பைப் பயன்படுத்தி கணக்கியல் கொள்கைகளைத் தேர்ந்தெடுக்க வேண்டும்.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Sveriges Riksbank is The world's oldest surviving central bank, founded in 1668 and predating the Bank of England by 26 years. Where is it located?",
        si: "1668 වර්ෂයේදී පිහිටුවන ලද ස්වෙරිජස් රික්ස්බෑන්ක් , එංගලන්ත බැංකුවට වඩා වසර 26කින් පැරණි සහ ලොව දැනට පවතින පැරණිතම මධ්‍යම බැංකුව වේ. මෙය පිහිටා ඇත්තේ කුමන රටේද​?",
        ta: "ஸ்வெரிஜஸ் ரிக்ஸ்பாங்க் (Sveriges Riksbank) என்பது உலகின் மிக பழமையான மத்திய வங்கியாகும். இது 1668-இல் நிறுவப்பட்டது, மேலும் இங்கிலாந்து வங்கியை (Bank of England) விட 26 ஆண்டுகள் பழமையானது.",
      },
    },
    // Row — Super Hard
    {
      subject: "Economics",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Assume a hypothetical economy consisting of three industries:\n1. Industry A produces its final output by using imported intermediate inputs worth Rs. 50 million and sells its output worth Rs. 200 million to Industry B.\n2. Industry B does not use any imported inputs and sells intermediate goods worth Rs. 300 million to Industry C.\n3. Industry C sells goods worth Rs. 40 million to a foreign country and sells its final output worth Rs. 600 million to final consumers.\nWhat is the Gross Domestic Product (GDP) of this economy?",
        si: "කර්මාන්ත තුනකින් සමන්විත උපකල්පිත ආර්ථිකයක් සලකන්න. එහි නිෂ්පාදන ක්‍රියාවලිය පහත පරිදි වේ.\nA කර්මාන්තය රුපියල් මිලියන 50ක් වටිනා ආනයනික අතරමැදි යෙදවුම් භාවිතා කර නිෂ්පාදනය සිදු කරයි. එම කර්මාන්තය විසින් නිෂ්පාදනය කරන ලද රුපියල් මිලියන 200ක් වටිනා නිමැවුම B කර්මාන්තයට අතරමැදි භාණ්ඩයක් ලෙස අලෙවි කරයි. \nB කර්මාන්තය කිසිදු ආනයනික යෙදවුමක් භාවිතා නොකරන අතර, A කර්මාන්තයෙන් ලබාගත් යෙදවුම් භාවිතා කර රුපියල් මිලියන 300ක් වටිනා අතරමැදි භාණ්ඩ C කර්මාන්තයට අලෙවි කරයි. \nC කර්මාන්තය B කර්මාන්තයෙන් ලබාගත් අතරමැදි භාණ්ඩ භාවිතා කර නිෂ්පාදනය කරන අතර, එහි නිමැවුමෙන් රුපියල් මිලියන 40ක් වටිනා භාණ්ඩ විදේශ රටකට අපනයනය කරයි. තවද, රුපියල් මිලියන 600ක් වටිනා අවසන් නිමැවුම අවසන් පාරිභෝගිකයින්ට අලෙවි කරයි. \nමෙම ආර්ථිකයේ දළ දේශීය නිෂ්පාදිතය (GDP) ගණනය කරන්න.",
        ta: "மூன்று தொழில்துறைகளைக் கொண்ட ஒரு கற்பனையான பொருளாதாரத்தைக் கருதுக:\n1. தொழில்துறை A ரூ. 50 மில்லியன் மதிப்புள்ள இறக்குமதி செய்யப்பட்ட இடைநிலை உள்ளீடுகளைப் பயன்படுத்தி தனது இறுதி வெளியீட்டை உற்பத்தி செய்து, ரூ. 200 மில்லியன் மதிப்புள்ள தனது வெளியீட்டை தொழில்துறை B க்கு விற்கிறது.\n2. தொழில்துறை B எந்தவொரு இறக்குமதி செய்யப்பட்ட உள்ளீடுகளையும் பயன்படுத்தாமல், ரூ. 300 மில்லியன் மதிப்புள்ள இடைநிலை பண்டங்களை தொழில்துறை C க்கு விற்கிறது.\n3. தொழில்துறை C ரூ. 40 மில்லியன் மதிப்புள்ள பொருட்களை வெளிநாட்டிற்கு விற்கிறது மற்றும் ரூ. 600 மில்லியன் மதிப்புள்ள தனது இறுதி வெளியீட்டை இறுதி நுகர்வோருக்கு விற்கிறது.\nஇப்பொருளாதாரத்தின் மொத்த உள்நாட்டு உற்பத்தி (GDP) எவ்வளவு?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Following are the data of input and output of a production firm,\n* Raw materials - 3000 units\n* Labour hours - 2000\n* Machine hours - 1000\n* Output - 12000units\n* Calculate total productivity and the labour productivity of the above institute",
        si: "නිෂ්පාදන ආයතනයක යෙදවුම් හා නිමැවුම් සම්බන්ධ පහත දත්ත ලබා දී ඇත.\nඅමුද්‍රව්‍ය -ඒකක 3,000 \nශ්‍රම පැය - පැය 2,000 \nයන්ත්‍ර පැය - පැය 1,000\nආයතනයේ  මුළු ඵලදායිතාවය හා ශ්‍රම ඵලදායිතාවය ගණනය කරන්න",
        ta: "ஒரு உற்பத்தி நிறுவனத்தின் (Production Firm) உள்ளீடுகள் (Inputs) மற்றும் வெளியீடுகள் (Output) தொடர்பான தரவுகள் பின்வருமாறு வழங்கப்பட்டுள்ளன:\nமூலப்பொருட்கள் (Raw Materials) – 3,000 அலகுகள்\nதொழிலாளர் மணிநேரங்கள் (Labour Hours) – 2,000\nஇயந்திர மணிநேரங்கள் (Machine Hours) – 1,000\nவெளியீடு (Output) – 12,000 அலகுகள்\nமேற்கண்ட நிறுவனத்தின்,\nமொத்த உற்பத்தித்திறனை (Total Productivity)\nதொழிலாளர் உற்பத்தித்திறனை (Labour Productivity)\nகணக்கிடுக.",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "A certain business prepared its income statement for the year ended 31/03/20xx during an inflationary period. The gross profit fell unexpectedly, and the net profit of the business was also significantly reduced. Since it was necessary to issue financial statements to investors for decision-making, the accountant, under the influence of senior management, recalculates the cost of sales using another inventory valuation method and prepares the income statement again (assuming all other factors remain constant). The recalculated gross profit was higher than the previously calculated gross profit. State the inventory valuation methods used previously and subsequently.",
        si: "එක්තරා ව්‍යාපාරයක් උද්ධමනකාරී අවස්ථාවක 20xx/03/31 දිනෙන් අවසන් වූ වර්ෂය සඳහා ආදායම් ප්‍රකාශය පිළියෙල කරන ලදී. එහි දළ ලාභය අනපේක්ෂිත ලෙස පහළ ගිය අතර, ව්‍යාපාරයේ ශුද්ධ ලාභයද සැලකිය යුතු ලෙස අඩු විය.\nආයෝජකයින්ගේ තීරණ ගැනීමේ කාර්යය සඳහා මූල්‍ය ප්‍රකාශන නිකුත් කිරීම අවශ්‍ය වූ බැවින්, ඉහළ කළමනාකාරීත්වයේ බලපෑම මත ගණකාධිකාරීවරයා වෙනත් තොග තක්සේරු ක්‍රමයක් භාවිත කරමින් වෙළඳ තොගයේ පිරිවැය නැවත ගණනය කර ආදායම් ප්‍රකාශය නැවත පිළියෙල කරන ලදී. (අනෙකුත් සියලු සාධක ස්ථාවරව පවතින බව සලකන්න.)\nනැවත ගණනය කරන ලද දළ ලාභය, පෙර ගණනය කරන ලද දළ ලාභයට වඩා ඉහළ අගයක් ගන්නා ලදී.\nමෙම අවස්ථාවේදී පෙර හා පසුව භාවිත කරන ලද තොග තක්සේරු ක්‍රම පිළිවෙළින් සඳහන් කරන්න.",
        ta: "ஒரு குறிப்பிட்ட வணிகம் பணவீக்கக் காலத்தில் 31/03/20xx உடன் முடிவடைந்த ஆண்டிற்கான வருமானக் கூற்றைத் தயாரித்தது. மொத்த இலாபம் எதிர்பாராத விதமாக வீழ்ச்சியடைந்ததுடன் வணிகத்தின் நிகர இலாபமும் கணிசமாகக் குறைந்தது. முடிவெடுப்பதற்காக முதலீட்டாளர்களுக்கு நிதி அறிக்கைகளை வெளியிட வேண்டியிருந்ததால், கணக்காளர், மூத்த நிர்வாகத்தின் செல்வாக்கின் கீழ், மற்றொரு இருப்பு மதிப்பீட்டு முறையைப் பயன்படுத்தி விற்பனைக் கிரயத்தை மறுமதிப்பீடு செய்து வருமானக் கூற்றை மீண்டும் தயாரித்தார் (மற்ற அனைத்து காரணிகளும் மாறாமல் இருப்பதாகக் கருதி). மறுமதிப்பீடு செய்யப்பட்ட மொத்த இலாபம் முன்னர் கணக்கிடப்பட்ட மொத்த இலாபத்தை விட அதிகமாக இருந்தது. முன்னர் மற்றும் பின்னர் பயன்படுத்தப்பட்ட இருப்பு மதிப்பீட்டு முறைகளை முறையே குறிப்பிடுக.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "What is the current rank of Sri Lanka in the Human Development Index?",
        si: "මානව සංවර්ධන දර්ශකයෙහි ශ්‍රී ලංකාවේ වත්මන් ශ්‍රේණිගත කිරීම කුමක්ද?",
        ta: "மனித மேம்பாட்டுச் சுட்டெண்ணில் இலங்கையின் தற்போதைய தரவரிசை என்ன?",
      },
    },
  ],
};

const GRID_2: QuizGrid = {
  id: 2,
  label: 'Grid 02',
  available: true,
  boxes: [
    // Row — Easy
    {
      subject: "Economics",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "In a simple economy, the consumption function is given as C = 30 + 0.7Y . If the equilibrium income level of this economy is Rs. 300 million, what is the level of investment?",
        si: "සරල ආර්ථිකයක පරිභෝජන ශ්‍රිතය C = 30 + 0.7Y ලෙස දී ඇත. මෙම ආර්ථිකයේ සමතුලිත ආදායම් මට්ටම රු. මිලියන 300ක් නම්, ආයෝජන මට්ටම ගණනය කරන්න.",
        ta: "ஒரு எளிய பொருளாதாரத்தில், நுகர்வுச் சார்பு C = 30 + 0.7Y எனக் கொடுக்கப்பட்டுள்ளது. இப்பொருளாதாரத்தின் சமநிலை வருமான மட்டம் ரூ. 300 மில்லியன் எனின், முதலீட்டு மட்டம் என்ன?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "The act that can be made regarding the activities of partnership if there is no partnership deed or if that is not mentioned in a partnership deed is,",
        si: "හවුල් ව්‍යාපාරයක ක්‍රියාකාරකම් සම්බන්ධයෙන් හවුල් ගිවිසුමක් නොමැති නම්, හෝ එම කරුණ හවුල් ගිවිසුමේ සඳහන් වී නොමැති නම්, එවැනි අවස්ථාවක අදාළ කරගත හැකි පනත වන්නේ,",
        ta: "கூட்டாண்மை ஒப்பந்தம் (Partnership Deed) இல்லாதபோதோ அல்லது கூட்டாண்மை ஒப்பந்தத்தில் குறிப்பிடப்படாத விடயங்கள் தொடர்பாகவோ, கூட்டாண்மை வணிகத்தின் செயற்பாடுகளை ஒழுங்குபடுத்துவதற்குப் பயன்படுத்தப்படும் சட்டம் எது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "What is the statutory institution that is responsible for the preparation of Sri Lanka Accounting Standards under the Sri Lanka Accounting and Auditing Standards Act No. 15 of 1995?",
        si: "1995 අංක 15 දරන ශ්‍රී ලංකා ගිණුම්කරණ සහ විගණන ප්‍රමිතීන් පනත යටතේ ශ්‍රී ලංකා ගිණුම්කරණ ප්‍රමිතීන් සකස් කිරීම සහ සම්මත කිරීම සඳහා වගකියනු ලබන ව්‍යවස්ථාපිත ආයතනය කුමක්ද?",
        ta: "1995 ஆம் ஆண்டின் இல. 15 ஆம் இலங்கை கணக்கியல் மற்றும் தணிக்கைத் தரநிலைகள் சட்டத்தின் (Sri Lanka Accounting and Auditing Standards Act No. 15 of 1995) கீழ், இலங்கை கணக்கியல் தரநிலைகளை (Sri Lanka Accounting Standards) தயாரிப்பதற்குப் பொறுப்பான சட்டபூர்வ நிறுவனம் (Statutory Institution) எது?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "Which economic concept describes a situation where a small number of firms dominate a market, each aware that its pricing decisions directly affect competitors' behavior?",
        si: "කුඩා සමාගම් සංඛ්‍යාවක් වෙළඳපොළක් පාලනය කරන අවස්ථාවක, එක් එක් සමාගමට තමන් ගන්නා මිල තීරණ අනෙකුත් තරඟකරුවන්ගේ හැසිරීමට සෘජුවම බලපාන බව හඳුනාගෙන ක්‍රියා කරන ආර්ථික තත්ත්වය හඳුන්වන්නේ කුමන සංකල්පයෙන්ද?",
        ta: "ஒரு சில நிறுவனங்கள் மட்டுமே சந்தையை ஆதிக்கம் செலுத்தும் மற்றும் தங்களின் விலை முடிவுகள் போட்டியாளர்களின் நடத்தையை நேரடியாகப் பாதிக்கும் என்பதை ஒவ்வொரு நிறுவனமும் அறிந்திருக்கும் நிலையை விவரிக்கும் பொருளாதாரக் கருத்து எது?",
      },
    },
    // Row — Medium
    {
      subject: "Economics",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "In a certain economy, the marginal propensity to consume (MPC) is 0.82. Along with the consumption function showing the linear relationship between disposable income and consumption expenditure in this economy, at point A the disposable income is Rs. 100,000 and the corresponding consumption expenditure is Rs. 90,000. On the same consumption function, at point B the disposable income is Rs. 50,000. Calculate the level of consumption expenditure at point B.",
        si: "එකතරා අර්ථිකයක ආන්තික පරිභෝජන ප්‍රවණතාව (MPC) 0.82ක් වන අතර, එම අර්ථිකයේ වැය කළ හැකි ආදායම හා පරිභෝජන වියදම අතර පවතින රේඛීය සම්බන්ධතාවය දක්වන පරිභෝජන ශ්‍රිතයක A ලක්ෂ්‍යයේ දී වැය කළ හැකි ආදායම රු. 100,000ක් වන අතර, ඊට අදාළ පරිභෝජන වියදම රු. 90,000ක් වේ. එම පරිභෝජන ශ්‍රිතයේම B ලක්ෂ්‍යයේ දී වැය කළ හැකි ආදායම රු. 50,000ක් නම්, B ලක්ෂ්‍යයට අදාළ පරිභෝජන වියදම් මට්ටම කොපමණද යන්න ගණනය කරන්න.",
        ta: "நுகர்வு எல்லைப் போக்கு (MPC) 0.82 ஆக இருக்கும்போது, நுகர்வுச் சார்பு வரைபடத்தில் புள்ளி B க்கு (செலவிடத்தக்க வருமானம் ரூ. 50,000 ஆகும் போது; புள்ளி A இல் செலவிடத்தக்க வருமானம் ரூ. 100,000 மற்றும் நுகர்வு ரூ. 90,000 ஆகும்) ஒத்த நுகர்வுச் செலவு மட்டம் என்ன?",
      },
      image: "/bs360-q/se2-eco-medium.png",
    },
    {
      subject: "Business Studies",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "Arrange the following steps in the correct order of the warehousing process:\nA - Issuing / Dispatching\nB - Inspecting / Checking\nC - Receiving and identifying stock\nD - Ensuring quality\nE - Verifying accuracy",
        si: "පහත පියවර ගබඩාකරණ ක්‍රියාවලියේ නිවැරදි අනුපිළිවෙළට සකස් කරන්න: \nA - නිකුත් කිරීම / පිටත් කිරීම\nB - පරීක්ෂා කිරීම\nC - තොග ලැබීම සහ හඳුනා ගැනීම\nD - ගුණාත්මකභාවය සහතික කිරීම\nE - නිරවද්‍යතාවය සත්‍යාපනය කිරීම",
        ta: "பின்வரும் விருப்பங்களில் கிடங்கு நடவடிக்கைகளின் சரியான வரிசையைக் கொண்டிருப்பது எது?\nA - வழங்குதல் / அனுப்புதல்\nB - ஆய்வு செய்தல் / சரிபார்த்தல்\nC - இருப்பைப் பெறுதல் மற்றும் அடையாளம் காணுதல்\nD - தரத்தை உறுதி செய்தல்\nE - துல்லியத்தன்மையை சரிபார்த்தல்",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "According to LKAS 7 - \"Statement of Cash Flows,\" which of the following statements is correct?\nA - Interest received can be classified as an investing cash flow.\n B - Interest paid can be classified as an operating cash flow.\n C - Dividends received can be classified as an operating cash flow.\n D - Dividends paid can be classified as a financing cash flow.",
        si: "LKAS 7 - \"මුදල් ප්‍රවාහ ප්‍රකාශනය\" ප්‍රමිතියට අනුව, පහත සඳහන් ප්‍රකාශවලින් නිවැරදි වන්නේ කුමක්ද?\nA - ලද පොලිය, ආයෝජන මුදල් ප්‍රවාහයක් ලෙස වර්ගීකරණය කළ හැකි ය.\n B - ගෙවූ පොලිය, මෙහෙයුම් මුදල් ප්‍රවාහයක් ලෙස වර්ගීකරණය කළ හැකි ය.\n C - ලද ලාභාංශ, මෙහෙයුම් මුදල් ප්‍රවාහයක් ලෙස වර්ගීකරණය කළ හැකි ය.\n D - ගෙවූ ලාභාංශ, මූල්‍ය මුදල් ප්‍රවාහයක් ලෙස වර්ගීකරණය කළ හැකි ය.",
        ta: "LKAS 7 – \"பணப்பாய்ச்சல் அறிக்கை (Statement of Cash Flows)\" தரநிலைக்கு அமைவாக, பின்வரும் கூற்றுகளில் சரியானது எது?\nA. பெறப்பட்ட வட்டி முதலீட்டு நடவடிக்கைகளிலிருந்து (Investing Activities) உருவாகும் பணப்பாய்ச்சலாக வகைப்படுத்தப்படலாம்.\nB. செலுத்தப்பட்ட வட்டி இயக்க நடவடிக்கைகளிலிருந்து (Operating Activities) உருவாகும் பணப்பாய்ச்சலாக வகைப்படுத்தப்படலாம்.\nC. பெறப்பட்ட ஈவுத்தொகை இயக்க நடவடிக்கைகளிலிருந்து (Operating Activities) உருவாகும் பணப்பாய்ச்சலாக வகைப்படுத்தப்படலாம்.\nD. செலுத்தப்பட்ட ஈவுத்தொகை நிதியளிப்பு நடவடிக்கைகளிலிருந்து (Financing Activities) உருவாகும் பணப்பாய்ச்சலாக வகைப்படுத்தப்படலாம்.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "Only one person has won Nobel Prizes in two different scientific fields. Who was this scientist?",
        si: "වර්තමානය වන විට, විවිධ විද්‍යාත්මක ක්ෂේත්‍ර දෙකක නොබෙල් ත්‍යාගය දිනා ඇති එකම විද්‍යාඥයා කවුරුන්ද?",
        ta: "இரண்டு வெவ்வேறு அறிவியல் துறைகளில் நோபல் பரிசுகளை வென்ற ஒரே நபர் யார்? அந்த விஞ்ஞானி யார்?",
      },
    },
    // Row — Hard
    {
      subject: "Economics",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "A firm operating in a perfectly competitive market has the following short-run cost data at 6 units of output: Total Fixed Cost = Rs. 300, Total Variable Cost = Rs. 540. The market price is Rs. 80 per unit. Determine whether the firm should continue production or shut down in the short run with the reason.",
        si: "පූර්ණ තරඟකාරී වෙළඳපොළක ක්‍රියාත්මක වන ආයතනයක්, ඒකක 6ක නිෂ්පාදන මට්ටමකදී පහත සඳහන් කෙටිකාලීන පිරිවැය දත්ත දරයි:\nමුළු ස්ථාවර පිරිවැය = රු. 300\nමුළු විචල්‍ය පිරිවැය (Total Variable Cost) = රු. 540\nවෙළඳපොළ මිල (Market Price) ඒකකයකට රු. 80කි.\nආයතනය කෙටිකාලීනව නිෂ්පාදනය කරගෙන යා යුතුද, එසේත් නැතහොත් නිෂ්පාදනය නවත්වා දැමිය යුතුද (Shut down) යන්න, හේතු දක්වා තීරණය කරන්න.",
        ta: "முற்றுமுழுதான போட்டிச் சந்தையில் இயங்கும் ஒரு நிறுவனம் 6 அலகு வெளியீட்டில் பின்வரும் குறுகிய காலச் செலவுத் தரவைக் கொண்டுள்ளது: மொத்த நிலையான செலவு = ரூ. 300, மொத்த மாறும் செலவு = ரூ. 540. சந்தை விலை ஒரு அலகிற்கு ரூ. 80 ஆகும். இந்நிறுவனம் குறுகிய காலத்தில் உற்பத்தியைத் தொடர வேண்டுமா அல்லது நிறுத்த வேண்டுமா என்பதை காரணத்துடன் தீர்மானிக்கவும்.",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Following are some steps of import trade,\n* Receiving the details of foreign suppliers\n* Sending a price request\n* Receiving a price quotation\n* Obtaining an import license\n* ………………………………\nThe next step of this process is,",
        si: "ආනයන වෙළඳාමේ පියවර කිහිපයක් පහත දැක්වේ\n* විදේශීය සැපයුම්කරුවන්ගේ තොරතුරු ලබා ගැනීම\n* මිල ගණන් ඉල්ලීමක් යැවීම\n* මිල ගණන් ඉදිරිපත් කිරීමක් ලබා ගැනීම\n* ආනයන බලපත්‍රයක් ලබා ගැනීම\n*...........................................\nඊළඟ පියවර ?",
        ta: "இறக்குமதி வாணிபத்தின் (Import Trade) சில படிநிலைகள் பின்வருமாறு:\nவெளிநாட்டு வழங்குநர்களின் (Foreign Suppliers) விவரங்களைப் பெற்றுக்கொள்ளல்.\nவிலை கோரிக்கையை (Price Request) அனுப்புதல்.\nவிலைக் குறிப்பை (Price Quotation) பெற்றுக்கொள்ளல்.\nஇறக்குமதி அனுமதிப்பத்திரத்தை (Import License) பெற்றுக்கொள்ளல்.\n………………………………\nஇந்தச் செயன்முறையின் அடுத்த படிநிலை எது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "The following information is provided for a manufacturing company:\n- Absorbed overhead cost: Rs. 240,000\n- Actual overhead cost: Rs. 225,000\n- Budgeted machine hours: 1,000\n- Actual machine hours: 1,200\nIf overhead costs are absorbed on a machine-hour basis, what is the budgeted overhead cost?",
        si: "නිෂ්පාදන සමාගමකට අදාළව පහත තොරතුරු සපයා ඇත:\n\n- අවශෝෂණය කරන ලද පොදු කාර්ය පිරිවැය: රු. 240,000\n- සත්‍ය පොදු කාර්ය පිරිවැය: රු. 225,000\n- අයවැයගත යන්ත්‍ර පැය: 1,000\n- සත්‍ය යන්ත්‍ර පැය: 1,200\nපොදු කාර්ය පිරිවැය යන්ත්‍ර පැය පදනම මත අන්තර්ග්‍රහණය කරයිනම් අයවැයගත පොදු කාර්ය පිරිවැය කොපමණද?",
        ta: "ஒரு உற்பத்தி நிறுவனம் தொடர்பாக பின்வரும் தகவல்கள் வழங்கப்பட்டுள்ளன:\n- உல்வாங்கப்பட்ட பொதுச் செலவு (Overhead): ரூ. 240,000\n- உண்மைப் பொதுச் செலவு (Overhead): ரூ. 225,000\n- திட்டமிடப்பட்ட இயந்திர மணித்தியாலங்கள்: 1,000\n- உண்மை இயந்திர மணித்தியாலங்கள்: 1,200\nபொதுச் செலவு இயந்திர மணித்தியாலங்கள் அடிப்படையில் உள்வாங்கப்பட்டால், திட்டமிடப்பட்ட பொதுச் செலவு எவ்வளவு?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "What is the world’s oldest stock exchange?",
        si: "ලෝකයේ පැරණිතම කොටස් වෙළඳපොළ කුමක්ද?",
        ta: "உலகின் மிக பழமையான பங்குச்சந்தை எது?",
      },
    },
    // Row — Super Hard
    {
      subject: "Economics",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "The following table presents data on total output, total revenue, and total cost for a certain business firm:\nBased on the information given in the table above, identify what type of market this business firm operates in, giving reasons for your answer.",
        si: "ව්‍යාපාරික ආයතනයක මුළු නිෂ්පාදිතය, මුළු ආදායම හා මුළු වියදම සම්බන්ධ දත්ත පහත වගුවේ දක්වේ. \n\nඉහත වගුවේ දක්වා ඇති තොරතුරු පදනම් කරගෙන, මෙම ව්‍යාපාරික ආයතනය ක්‍රියාත්මක වන වෙළඳපොළ වර්ගය හඳුනාගෙන, ඔබේ පිළිතුරට හේතු දක්වන්න..",
        ta: "மேலே உள்ள அட்டவணையில் கொடுக்கப்பட்டுள்ள தகவல்களின் அடிப்படையில், இந்த வணிக நிறுவனம் எந்த வகையான சந்தையில் இயங்குகிறது என்பதை காரணங்களுடன் அடையாளம் காணவும்.",
      },
      image: "/bs360-q/se2-eco-superhard.jpg",
    },
    {
      subject: "Business Studies",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Nimal and Kamal run a partnership business but they do not have a written partnership agreement. During the last year, they received a 5% interest on the capital they invested, as well as on the additional loan capital provided. Furthermore, Nimal admitted his friend Abdul into the partnership solely based on his own consent. Kamal, acting as the Chief Executive Officer, stated that his current salary is insufficient and requested an increase.\nAccording to the above scenario, how many conditions has this partnership violated under the provisions of the Partnership Act?",
        si: "නිමල් සහ කමල් හවුල් ව්‍යාපාරයක් පවත්වාගෙන යන නමුත් ඔවුන්ට ලිඛිත හවුල් ගිවිසුමක් නොමැත. පසුගිය වසර තුළ ඔවුන් ආයෝජනය කළ ප්‍රාග්ධනය මෙන්ම ලබාදුන් අතිරේක ණය ප්‍රාග්ධනය සඳහාද 5%ක පොලියක් ලබා ගත්හ. තවද, නිමල් තම මිතුරා වන අබ්දුල්ව ඔහුගේම කැමැත්ත මත පමණක් හවුල් ව්‍යාපාරයට ඇතුළත් කර ගත්තේය. ප්‍රධාන විධායක නිලධාරියා ලෙස කමල් තම වත්මන් වැටුප ප්‍රමාණවත් නොවන බව පවසා වැටුප් වැඩිවීමක් ඉල්ලා සිටියේය.\nඉහත අවස්ථාවට අනුව, හවුල් ව්‍යාපාර පනතේ විධිවිධාන යටතේ මෙම හවුල්කාරිත්වය කොන්දේසි කීයක් උල්ලංඝනය කර තිබේද?",
        ta: "நிமல் மற்றும் கமல் ஒரு கூட்டு வணிகத்தை நடத்துகிறார்கள் ஆனால் அவர்களிடம் எழுதப்பட்ட கூட்டு ஒப்பந்தம் இல்லை. கடந்த ஆண்டில், அவர்கள் முதலீடு செய்த மூலதனத்திற்கும், வழங்கப்பட்ட கூடுதல் கடன் மூலதனத்திற்கும் 5% வட்டியைப் பெற்றனர். மேலும், நிமல் தனது சொந்த ஒப்புதலின் அடிப்படையில் மட்டுமே தனது நண்பர் அப்துலை கூட்டாண்மையில் சேர்த்துக் கொண்டார். தலைமை நிர்வாக அதிகாரியாகச் செயல்படும் கமல், தனது தற்போதைய சம்பளம் போதாது என்று கூறி உயர்வை கோரினார்.\nமேற்கண்ட சூழ்நிலையின்படி, கூட்டாண்மைச் சட்டத்தின் விதிகளின் கீழ் இக்கூட்டாண்மை எத்தனை நிபந்தனைகளை மீறியுள்ளது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Saha PLC is a company that manufactures a special type of flower pot. The variable cost of producing a flower pot is Rs. 5,000, which consists of 60% prime cost, 30% production overhead cost, and 10% non-production overhead cost. At the activity level of 500 units of flower pots, the company's total fixed cost is Rs. 800,000, which consists of 70% production overhead cost and 30% non-production overhead cost. The selling price of a flower pot is determined with a gross profit margin of 10% on the production cost of a flower pot.\nWhat is the selling price of a flower pot?",
        si: "සීමිත සහා පොදු සමාගම විශේෂ වර්ගයක මල් පෝච්චි නිෂ්පාදනය කරන සමාගමකි. සමාගම නිෂ්පාදනය කරන මල් පෝච්චියක විචල්‍ය පිරිවැය රු. 5,000 ක් වන අතර එම විචල්‍ය පිරිවැයෙන් 60% ප්‍රාථමික පිරිවැයෙන්ද, 30% නිෂ්පාදන පොදු කාර්ය පිරිවැයෙන්ද, 10% නිෂ්පාදන නොවන පොදු කාර්ය පිරිවැයෙන්ද සමන්විත වේ. සමාගමේ මල් පෝච්චි ඒකක 500 ක්‍රියාකාරී මට්ටමේදී මුළු ස්ථාවර පිරිවැය රු. 800,000ක් වන අතර එයින් 70% නිෂ්පාදන පොදු කාර්ය පිරිවැයෙන්ද, 30% නිෂ්පාදන නොවන පොදු කාර්ය පිරිවැයෙන්ද සමන්විත වේ. මල් පෝච්චියක නිෂ්පාදන පිරිවැය මත 10% ක දළ ලාභාන්තිකයක් සහිතව මල් පෝච්චියක විකුණුම් මිල තීරණය කරයි.\nමල් පෝච්චියක විකුණුම් මිල කොපමණද?",
        ta: "சஹா பொது நிறுவனம் ஒரு விசேட வகை மலர்ச் சட்டிகளை தயாரிக்கும் நிறுவனமாகும். ஒரு மலர்ச் சட்டியை தயாரிப்பதற்கான மாறும் செலவு ரூ. 5,000 ஆகும், இது 60% முதன்மைச் செலவு, 30% உற்பத்திப் பொதுச் செலவு மற்றும் 10% உற்பத்தியற்ற பொதுச் செலவு ஆகியவற்றைக் கொண்டுள்ளது. 500 அலகுகள் மலர்ச் சட்டிகள் உற்பத்தி செய்யப்படும் செயற்பாட்டு மட்டத்தில், நிறுவனத்தின் மொத்த நிலையான செலவு ரூ. 800,000 ஆகும், இது 70% உற்பத்திப் பொதுச் செலவு மற்றும் 30% உற்பத்தியற்ற பொதுச் செலவு ஆகியவற்றைக் கொண்டுள்ளது. ஒரு மலர்ச் சட்டியின் விற்பனை விலை அதன் உற்பத்திச் செலவு மீது 10% மொத்த இலாப வரம்புடன் தீர்மானிக்கப்படுகிறது.\nஒரு மலர்ச் சட்டியின் விற்பனை விலை மற்றும் 500 அலகுகள் கொண்ட செயற்பாட்டு மட்டத்தில் மொத்தக் காலச் செலவு (period cost) எவ்வளவு?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Who is the current reigning Formula One World Champion?",
        si: "වත්මන් ෆෝමියුලා වන් (Formula 1) ලෝක ශූරයා කවුද?",
        ta: "தற்போதைய ஃபார்முலா ஒன் (Formula 1) உலக சாம்பியன் யார்?",
      },
    },
  ],
};

const GRID_3: QuizGrid = {
  id: 3,
  label: 'Grid 03',
  available: true,
  boxes: [
    // Row — Easy
    {
      subject: "Economics",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "If the income effect of a price change is negative, but the substitution effect dominates, then the good is __________.",
        si: "මිල වෙනසක ආදායම් ප්‍රතිවිපාකය සෘණාත්මක වුවද, ආදේශන ප්‍රතිවිපාකය එයට වඩා ප්‍රබලව ක්‍රියා කරයි නම්, එම භාණ්ඩය __________ වේ.",
        ta: "விலை மாற்றத்தின் வருமான விளைவு எதிர்மறையாக இருந்து, ஆனால் பதிலீட்டு விளைவு ஆதிக்கம் செலுத்தினால், அந்தப் பண்டம் __________ ஆகும்.",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "Vishmi purchased 10 pairs of trousers from Sumanasiri,and sold to Dileepa and Janidu three each in the festival season,Accordingly, the whole seller and the retail seller are,",
        si: "විශ්මි උත්සව සමයේ සුමනසිරිගෙන් කලිසම් යුගල 10ක් මිලදී ගෙන, දිලීපට සහ ජනිඳුට තුන බැගින් විකුණුවාය. ඒ අනුව, තොග වෙළෙන්දා සහ සිල්ලර වෙළෙන්දා වන්නේ,",
        ta: "விஷ்மி பண்டிகைக் காலத்தில் சுமனசிறியிடம் இருந்து 10 காற்சட்டைகளை (trousers) வாங்கி, திலீப மற்றும் ஜனிது ஆகிய இருவருக்கும் தலா மூன்று வீதம் விற்றார். இதற்கமைய, மொத்த வியாபாரி மற்றும் சில்லறை வியாபாரி ஆவோர்,",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "The accounting concept related to dividing a long-lasting business into separate years/periods for the preparation of financial statements known as,",
        si: "දිගු කාලයක් පවතින ව්‍යාපාරය එක් එක් වර්ෂ වලට බෙදා මුල්‍ය ප්‍රකාශන පිළියෙල කිරීමට අදාල ගිණුම්කරණ සංකල්පය වන්නේ,",
        ta: "நீண்ட காலம் தொடரும் ஒரு வணிகத்தை, நிதி அறிக்கைகளைத் தயாரிப்பதற்காக தனித்தனி ஆண்டுகள் அல்லது காலங்களாகப் பிரிப்பதுடன் தொடர்புடைய கணக்கியல் கோட்பாடு (Accounting Concept) எது?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "The chemical symbols used in the periodic table are often derived from Latin names rather than English. Which element is represented by the symbol Au?",
        si: "ආවර්තිතා වගුවේ භාවිතා වන රසායනික සංකේත බොහෝ විට ඉංග්‍රීසි වෙනුවට ලතින් නම් වලින් ව්‍යුත්පන්න වී ඇත. Au සංකේතයෙන් දැක්වෙන්නේ කුමන මූලද්‍රව්‍යයද?",
        ta: "தனிம வரிசை அட்டவணையில் பயன்படுத்தப்படும் வேதியியல் குறியீடுகள் பெரும்பாலும் ஆங்கிலப் பெயர்களுக்குப் பதிலாக லத்தீன் பெயர்களிலிருந்து பெறப்படுகின்றன. Au என்ற குறியீட்டால் குறிக்கப்படும் தனிமம் எது?",
      },
    },
    // Row — Medium
    {
      subject: "Economics",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "Suppose the demand and supply curves for a product sold in a competitive market are represented by the following equations.\nDemand: Qd = 720 – 4P\nSupply: Qs = -120 + 2P\nSuppose now the government has decided to grant a subsidy of Rs. 15 per unit for the producers of this product. What is the price paid by the buyer after the subsidy? And what is the price received by the supplier after the subsidy?",
        si: "තරඟකාරී වෙළඳපොළක අලෙවි වන නිෂ්පාදනයක් සඳහා ඉල්ලුම් හා සැපයුම් වක්‍ර පහත සමීකරණවලින් නිරූපණය වේ යැයි උපකල්පනය කරන්න:\nඉල්ලුම: Qd = 720 – 4P\n සැපයුම: Qs = -120 + 2P\nරජය මෙම නිෂ්පාදනයේ නිෂ්පාදකයින් සඳහා ඒකකයකට රු. 15ක සහනාධාරයක් ලබා දීමට තීරණය කරයි යැයි උපකල්පනය කරන්න. සහනාධාරය ලබා දීමෙන් පසුව ගැනුම්කරු ගෙවන මිල, හා සැපයුම්කරුට ලැබෙන  මිල කුමක්ද?",
        ta: "போட்டிச் சந்தையில் விற்கப்படும் ஒரு தயாரிப்புக்கான தேவை மற்றும் வழங்கல் வளைவுகள் பின்வரும் சமன்பாடுகளால் குறிக்கப்படுகின்றன என்று வைத்துக்கொள்வோம்.\nதேவை: Qd = 720 - 4P\nவழங்கல்: Qs = -120 + 2P\nஇப்போது அரசாங்கம் தயாரிப்பாளர்களுக்கு ஒரு அலகிற்கு ரூ. 15 மானியம் வழங்க முடிவு செய்துள்ளது. மானியத்திற்குப் பிறகு வாங்குபவர் செலுத்தும் விலை என்ன? மானியத்திற்குப் பிறகு வழங்குபவர் பெறும் விலை என்ன?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "The Document issued by an accepted Commerce Board Certifying that the goods have been produced by the exporting Country itself is known as,",
        si: "අපනයනය කරනු ලබන භාණ්ඩ අදාළ අපනයන රටෙහිම නිෂ්පාදනය කරන ලද බවට සහතික කරමින් පිළිගත් වාණිජ මණ්ඩලයක් විසින් නිකුත් කරනු ලබන ලේඛනය හඳුන්වන්නේ,",
        ta: "ஏற்றுமதி செய்யப்படும் பொருட்கள் ஏற்றுமதி செய்யும் நாட்டிலேயே உற்பத்தி செய்யப்பட்டன என்பதை சான்றளித்து அங்கீகரிக்கப்பட்ட வர்த்தக சபையினால் வழங்கப்படும் ஆவணம் எவ்வாறு அழைக்கப்படுகிறது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "During the year ended 31.03.2024, the following transactions took place in Nisira Public Limited Company.\nA machine costing Rs. 2,000,000 was purchased for cash.\nOffice equipment with a carrying value of Rs. 3,600,000 was sold for cash at a profit of Rs. 600,000.\nThe right to use a motor vehicle for a period of 5 years was obtained under a lease agreement. The cost of the right-of-use asset is Rs. 4,500,000. This cost includes an initial payment of Rs. 1,000,000.\nCalculate the net cash inflow/(outflow) from investing activities (Rs. '000) for the year ended 31.03.2024, in accordance with LKAS 7 – Statement of Cash Flows.",
        si: "2024.03.31 දිනෙන් අවසන් වර්ෂය තුළදී සීමිත නිසිර පොදු සමාගමේ පහත ගනුදෙනු සිදු වී ඇත.\nරු. 2 000 000 කට යන්ත්‍රයක් අත්පිට මුදලට මිල දී ගෙන ඇත.\nධාරණ වටිනාකම රු. 3 600 000 ක් වූ කාර්යාල උපකරණයක් රු. 600 000 ක ලාභයක් සහිතව අතපිට මුදලට විකුණා ඇත.\nකල්බදු ගිවිසුමක් යටතේ වසර 5 ක කාලයක් සඳහා මෝටර් රථයක භාවිත අයිතිය ලබාගෙන ඇත. මෙම භාවිත අයිතිය සහිත වත්කමේ පිරිවැය රු. 4 500 000 කි. මෙම පිරිවැය තුළ රු. 1 000 000 ක් වූ මූලික ගෙවීමක් ඇතුළත් වේ.\n'LKAS 7 - මුදල් ප්‍රවාහ ප්‍රකාශනය' ප්‍රමිතයට අනුව 2024.03.31 දිනෙන් අවසන් වර්ෂය සඳහා ආයෝජන ක්‍රියාකාරකම්වලින් ඇති වූ ශුද්ධ මුදල් ගැලීම/(ගැලීයෑම) (රු. '000):",
        ta: "31.03.2024 அன்று முடிவடைந்த ஆண்டில், நிசிரா பொது வரையறுக்கப்பட்ட நிறுவனத்தில் பின்வரும் கொடுக்கல் வாங்கல்கள் இடம்பெற்றன:\nரூ. 2,000,000 பெறுமதியான இயந்திரமொன்று பணத்திற்கு கொள்வனவு செய்யப்பட்டது.\nரூ. 3,600,000 ஏட்டுப் பெறுமதியைக் கொண்ட அலுவலக உபகரணங்கள், ரூ. 600,000 இலாபத்துடன் பணத்திற்கு விற்பனை செய்யப்பட்டன.\nகுத்தகை உடன்படிக்கையின் கீழ், மோட்டார் வாகனமொன்றைப் 5 ஆண்டுகளுக்கு பயன்படுத்தும் உரிமை பெறப்பட்டது. பயன்பாட்டு உரிமைச் சொத்தின் (Right-of-use Asset) செலவு ரூ. 4,500,000 ஆகும். இச்செலவில் ரூ. 1,000,000 ஆரம்பக் கொடுப்பனவு உள்ளடங்கியுள்ளது.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "In 2025, which company became the first publicly traded company to surpass a market valuation of US$4 trillion?",
        si: "2025 වසරේදී, ඇමෙරිකානු ඩොලර් ට්‍රිලියන 4ක වෙළඳපල අගය ඉක්මවා ගිය පළමු ප්‍රසිද්ධියේ වෙළඳාම් වන සමාගම බවට පත්වූයේ කුමන සමාගමද?",
        ta: "2025 இல், சந்தை மதிப்பில் 4 டிரில்லியன் அமெரிக்க டாலர்களைத் தாண்டிய முதல் பொது வர்த்தக நிறுவனம் எது?",
      },
    },
    // Row — Hard
    {
      subject: "Economics",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Assume that the equilibrium of the tea market lies at point X. When the price of coffee increases, the demand for tea rises. Under this situation, at which point could the new equilibrium of the tea market be?",
        si: "තේ වෙළඳපොලේ සමතුලිතතාවය X ලක්ෂ්‍යයේ පිහිටා ඇතැයි උපකල්පනය කරන්න. කෝපි මිල ඉහළ යාමේදී, තේ සඳහා ඇති ඉල්ලුම වැඩි වේ. මෙම තත්ත්වය යටතේ, තේ වෙළඳපොලේ නව සමතුලිතතාවය පිහිටිය හැක්කේ කුමන ලක්ෂ්‍යයේදීද?",
        ta: "தேயிலை சந்தையின் சமநிலை புள்ளி X இல் (வழங்கல் வளைவு S0 மற்றும் தேவை வளைவு D1 இன் வெட்டுப்புள்ளி) உள்ளது என்று வைத்துக்கொள்வோம். காப்பியின் விலை அதிகரிக்கும் போது, தேயிலைக்கான தேவை அதிகரித்து தேவை வளைவை D2 ஆக மாற்றுகிறது. S0 வளைவானது D2 ஐ புள்ளி B இல் வெட்டுகிறது. இந்த சூழ்நிலையில், தேயிலை சந்தையின் புதிய சமநிலை எந்த புள்ளியில் இருக்கும்?",
      },
      image: "/bs360-q/se3-eco-hard.png",
    },
    {
      subject: "Business Studies",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Write Three examples for financial infrastructure facilities.(Write the full name of the facility)",
        si: "මූල්‍ය යටිතල පහසුකම් සඳහා උදාහරණ 3ක් ලියන්න. (පහසුකමෙහි සම්පූර්ණ නම ලියන්න)",
        ta: "நிதி உட்கட்டமைப்பு வசதிகளுக்கு (Financial Infrastructure Facilities) மூன்று எடுத்துக்காட்டுகளை எழுதுக. (ஒவ்வொரு வசதியினதும் முழுப் பெயரையும் எழுதுக.)",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "The following table and details relate to the appropriation of profit of a partnership business carried on by Sangeetha and Nadya for the year ended 31/03/2026:\n- Sangeetha: Interest on Capital = Rs. 90,000, Partner Salary = Rs. 180,000, Share of Profit = Rs. 60,000\n- Nadya: Interest on Capital = Rs. 60,000, Partner Salary = Rs. 0, Share of Profit = Rs. 30,000\nPartners are entitled to 10% annual interest on capital balances. As of 04/01/2025, Sangeetha's current account balance was Rs. 120,000 (Cr) and Nadya's current account balance was Rs. 105,000 (Cr). There were no drawings by partners during the year ended 31/03/2026. Sangeetha has provided a loan of Rs. 270,000 to the partnership on 01/04/2025, and it has been agreed to pay interest of 10% on this loan, but it has not yet been paid or recorded in the accounts.\nCalculate the total equity of the partnership as of 31/03/2026.",
        si: "සංගීතා හා නාට්‍ය විසින් පවත්වාගෙන යනු ලබන හවුල් ව්‍යාපාරයේ 2026/03/31 දිනට ලාභ විසර්ජනයට අදාළ තොරතුරු පහත දැක්වේ:\n- සංගීතා: ප්‍රාග්ධන පොලී (රු. '000) = 90, හවුල් වේතන (රු. '000) = 180, ලාභ කොටස් (රු. '000) = 60\n- නාට්‍යා: ප්‍රාග්ධන පොලී (රු. '000) = 60, හවුල් වේතන (රු. '000) = -, ලාභ කොටස් (රු. '000) = 30\nහවුල්කරුවන්ට ප්‍රාග්ධන ශේෂ මත වාර්ෂිකව 10% පොලියක් හිමිවේ. 2025/04/01 දිනට සංගීතාගේ ජංගම ගිණුමේ ශේෂය රු. 120,000ක් වූ අතර නාට්‍යාගේ ජංගම ගිණුමේ ශේෂය රු. 105,000ක් විය. 2026/03/31න් අවසන් වසර තුළදී හවුල්කරුවන් ගැනිලි සිදුකර නොමැති අතර සංගීතා 2025/04/01 දින හවුල් ව්‍යාපාරයට යෙදවූ රු. 270,000ක ණය මුදල සඳහා පොලිය 10%ක් ලෙස එකඟ වී ඇතත් එය ගෙවා හෝ ගිණුම්ගත කර නොමැත.\n2026/03/31 දිනට හවුල් ව්‍යාපාරයේ මුළු හිමිකම ගණනය කරන්න.",
        ta: "சங்கீதா மற்றும் நாட்டியா ஆகியோரால் நடத்தப்படும் கூட்டு வணிகத்தின் 31/03/2026 திகதிக்கான இலாபப் பகிர்வு தொடர்பான தகவல்கள் கீழே தரப்பட்டுள்ளன:\n- சங்கீதா: மூலதன வட்டி (ரூ. '000) = 90, கூட்டாளர் சம்பளம் (ரூ. '000) = 180, இலாபப் பங்கு (ரூ. '000) = 60\n- நாட்டியா: மூலதன வட்டி (ரூ. '000) = 60, கூட்டாளர் சம்பளம் (ரூ. '000) = -, இலாபப் பங்கு (ரூ. '000) = 30\nகூட்டாளர்களுக்கு மூலதனச் மீதி மீது ஆண்டிற்கு 10% வட்டிக்கு உரிமையுண்டு. 01/04/2025 திகதியில் சங்கீதாவின் நடைமுறைக் கணக்கு மீதி ரூ. 120,000 ஆகவும், நாட்டியாவின் நடைமுறைக் கணக்கு மீதி ரூ. 105,000 ஆகவும் இருந்தது. 31/03/2026 உடன் முடிவடைந்த ஆண்டில் கூட்டாளர்களால் எவ்வித எடுப்புகளும் மேற்கொள்ளப்படவில்லை. சங்கீதா 01/04/2025 அன்று கூட்டு வணிகத்திற்கு ரூ. 270,000 கடன் வழங்கியுள்ளார், இக்கடனிற்கு 10% வட்டி வழங்க ஒப்புக்கொள்ளப்பட்டுள்ளது, ஆனால் அது இன்னும் செலுத்தப்படவோ கணக்கில் பதியப்படவோ இல்லை.\n31/03/2026 திகதியில் கூட்டு வணிகத்தின் மொத்த உரிமையை கணிக்கவும்.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Which Colombo Stock Exchange-listed conglomerate was placed on the CSE Watchlist in 2026 due to auditor \"going concern\" warnings, and has since been raising equity through a restructuring plan involving asset disposals?",
        si: "ගණන් පරීක්ෂකගේ \"වැඩිදුර පැවැත්ම\" (going concern) පිළිබඳ අනතුරු ඇඟවීම් හේතුවෙන් 2026 දී කොළඹ කොටස් වෙළඳපොලේ නිරීක්ෂණ ලැයිස්තුවට (Watchlist) ඇතුළත් කරන ලද සහ වත්කම් බැහැර කිරීම් ඇතුළත් ප්‍රතිව්‍යුහගත කිරීමේ සැලැස්මක් හරහා එතැන් සිට කොටස් ප්‍රාග්ධනය රැස් කරමින් සිටින සමූහ ව්‍යාපාරය කුමක්ද?",
        ta: "தணிக்கையாளரின் \"தொடர் நிறுவனம்\" (going concern) எச்சரிக்கைகள் காரணமாக 2026 இல் கொழும்பு பங்குச் சந்தை கண்காணிப்புப் பட்டியலில் (CSE Watchlist) சேர்க்கப்பட்ட மற்றும் சொத்துக்களை விற்பனை செய்யும் மறுசீரமைப்புத் திட்டத்தின் மூலம் பங்குகளைத் திரட்டி வரும் கொழும்பு பங்குச் சந்தையில் பட்டியலிடப்பட்ட கூட்டு நிறுவனம் எது?",
      },
    },
    // Row — Super Hard
    {
      subject: "Economics",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Suppose that last year's Real Gross Domestic Product of a country was Rs. 18,000 billion, this year's Nominal GDP is Rs. 15,000 billion, and the GDP Deflator for this year is 75. What is the growth rate of the Real GDP of this country?",
        si: "රටක පසුගිය වසරේ මූර්ත​ දළ දේශීය නිශ්පාදිතය රු. බිලියන 18,000ක් වන අතර, මෙම වසරේ නාමික දළ දේශීය නිශ්පාදිතය රු. බිලියන 15,000ක් ලෙසත්, මෙම වසරේ දළ දේශීය නිශ්පාදන අවධමනකය 75ක් ලෙසත් උපකල්පනය කරන්න. මෙම රටේ මූර්ත​ දළ දේශීය නිශ්පාදිතයේ වර්ධන අනුපාතය කොපමණ ද?",
        ta: "ஒரு நாட்டின் கடந்த ஆண்டின் மெய் மொத்த உள்நாட்டு உற்பத்தி ரூ. 18,000 பில்லியன் என்றும், இந்த ஆண்டின் பெயரளவு GDP ரூ. 15,000 பில்லியன் என்றும், இந்த ஆண்டிற்கான GDP விலைக்குறைப்பி 75 என்றும் வைத்துக்கொள்வோம். இந்நாட்டின் மெய் GDP இன் வளர்ச்சி விகிதம் என்ன?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "While the cargo is being loaded on to the ship, the document issued by the captain stating that the goods are in good and proper condition is",
        si: "නැවට භාණ්ඩ පටවන අතරතුර, එම භාණ්ඩ හොඳ හා නිසි තත්ත්වයේ පවතින බව සඳහන් කරමින් නැවේ කපිතාන්වරයා විසින් නිකුත් කරන ලේඛනය",
        ta: "சரக்குகள் கப்பலில் ஏற்றப்படும் போது, அவை நல்ல மற்றும் முறையான நிலையில் இருப்பதாகக் கப்பலின் தலைவரால் (Captain) வழங்கப்படும் ஆவணம் எது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Green PLC purchased a building on 01/04/2023. Its useful life is 30 years with no residual value. This building was revalued for the first time on 31/03/2024 with a deficit, and on that date, the remaining useful life of the building was estimated to be 20 years and the residual value was estimated to be Rs. 100,000.\nAs of 31/03/2026, the balance of the accumulated depreciation account of the building was Rs. 200,000, and on 31/03/2026, the building was revalued for the second time with a deficit of Rs. 300,000. The company owns only this building, and it is depreciated on a straight-line basis.\nAccording to 'LKAS 16 - Property, Plant and Equipment', what is the revalued amount of the building on the second revaluation on 31/03/2026?",
        si: "සීමිත Green සමාගම විසින් 2023/04/01 දින ගොඩනැගිල්ලක් මිල දී ගන්නා ලදී. එහි ඵලදායී ජීව කාලය වසර 30ක් වන අතර සුන්බුන් අගයක් නොමැත. මෙම ගොඩනැගිල්ල 2024/03/31 දින ඌනතාවයක් සහිතව ප්‍රථම වරට ප්‍රත්‍යාගණනය කරන ලද අතර, එදින ගොඩනැගිල්ලේ ඉතිරි ඵලදායී ජීව කාලය වසර 20ක් ලෙසත්, සුන්බුන් අගය රු. 100,000ක් ලෙසත් ඇස්තමේන්තු කරන ලදී.\n2026/03/31 දිනට ගොඩනැගිල්ලේ සමුච්චිත ක්ෂයවීම් ගිණුමේ ශේෂය රු. 200,000ක් ලෙස පැවතුණු අතර, 2026/03/31 දින රු. 300,000ක ඌනතාවයක් සහිතව ගොඩනැගිල්ල දෙවන වර ප්‍රත්‍යාගණනය කරන ලදී. සමාගම සතුව මෙම ගොඩනැගිල්ල පමණක් පවතින අතර, එය සරල රේඛීය ක්‍රමයට ක්ෂය කරනු ලබයි.\n'LKAS 16 - දේපළ, පිරියත සහ උපකරණ' ප්‍රමිතියට අනුව, 2026/03/31 දින ගොඩනැගිල්ලේ දෙවන වර ප්‍රත්‍යාගණන අගය කුමක් ද?",
        ta: "கிரிண் பொது நிறுவனம் 01/04/2023 அன்று கட்டிடம் ஒன்றை வாங்கியது. அதன் பயனுள்ள ஆயுட்காலம் 30 ஆண்டுகள் ஆகும் மற்றும் மீதி மதிப்பு இல்லை. இக்கட்டிடம் 31/03/2024 அன்று முதன்முறையாக பற்றாக்குறையுடன் மறுமதிப்பீடு செய்யப்பட்டது, அன்றைய திகதியில் கட்டிடத்தின் எஞ்சிய பயனுள்ள ஆயுட்காலம் 20 ஆண்டுகள் எனவும் மீதி மதிப்பு ரூ. 100,000 எனவும் மதிப்பிடப்பட்டது.\n31/03/2026 திகதியில் கட்டிடத்தின் திரட்டப்பட்ட தேய்மானக் கணக்கின் மீதி ரூ. 200,000 ஆக இருந்ததுடன், 31/03/2026 அன்று இக்கட்டிடம் ரூ. 300,000 பற்றாக்குறையுடன் இரண்டாவது முறையாக மறுமதிப்பீடு செய்யப்பட்டது. நிறுவனம் இக்கட்டிடத்தை மட்டுமே கொண்டுள்ளதோடு, இது நேர்கோட்டு முறையில் தேய்மானம் செய்யப்படுகிறது.\n'LKAS 16 - சொத்து, பொறி மற்றும் உபகரணங்கள்' தரநிலையின்படி, 31/03/2026 அன்று இக்கட்டிடத்தின் இரண்டாவது மறுமதிப்பீட்டு மதிப்பு என்ன?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Which country has the largest exclusive economic zone (EEZ) in the world?",
        si: "ලෝකයේ විශාලතම අනන්‍ය ආර්ථික කලාපය (EEZ) හිමි රට කුමක්ද?",
        ta: "உலகின் மிகப்பெரிய பிரத்தியேக பொருளாதார வலயத்தை (EEZ) கொண்ட நாடு எது?",
      },
    },
  ],
};

const GRID_4: QuizGrid = {
  id: 4,
  label: 'Grid 04',
  available: true,
  boxes: [
    // Row — Easy
    {
      subject: "Economics",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "Suppose the market demand function for a certain consumer good is represented by QD = 400 - 2P. What is the arc price elasticity of the demand of this good over the price range of Rs. 20 to Rs. 30?",
        si: "යම් පාරිභෝගික භාණ්ඩයක් සඳහා වෙළඳපල ඉල්ලුම් ශ්‍රිතය QD = 400 - 2P ලෙස දැක්වේ. රු. 20 සිට රු. 30 දක්වා මිල පරාසය තුළ මෙම භාණ්ඩයේ ඉල්ලුමේ චාප මිල නම්‍යතාවය කොපමණද?",
        ta: "ஒரு குறிப்பிட்ட நுகர்வோர் பண்டத்திற்கான சந்தைத் தேவைச் சார்பு QD = 400 - 2P எனக் குறிக்கப்படுகிறது. ரூ. 20 முதல் ரூ. 30 வரையிலான விலை வரம்பில் இப்பண்டத்திற்கான தேவையின் வில் விலை நெகிழ்ச்சி என்ன?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "What is the First step in entrepreneurship ?",
        si: "ව්‍යවසායකත්වයේ පළමු පියවර කුමක්ද?",
        ta: "தொழில்முனைவுச் செயன்முறையின் (Entrepreneurship Process) முதல் படிநிலை எது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "During the month of May 2026, the business paid petty cash expenses amounting to Rs. 30,000, and as at 31.05.2026, Rs. 5,000 remained in hand. The petty cash imprest was reimbursed on 31.05.2026. What is the value of the petty cash imprest (float)?",
        si: "2026 මැයි මාසය තුළදී ව්‍යාපාරයෙන් රු. 30,000ක සුළු මුදල් වියදම් ගෙවා ඇති අතර, 2026.05.31 දිනට රු. 5,000ක් ඉතිරිව ඇත. 2026.05.31 දින සුළු මුදල් අග්‍රිමය ප්‍රතිපූරණය කර ඇත. සුළු මුදල් අග්‍රිමයේ වටිනාකම කොපමණ ද?",
        ta: "2026 ஆம் ஆண்டு மே மாதத்தில், ஒரு வணிகம் ரூ. 30,000 பெறுமதியான சிறுசெலவுகளை (Petty Cash Expenses) செலுத்தியது. 31.05.2026 அன்று, கையிருப்பில் ரூ. 5,000 மீதமிருந்தது. அதே நாளில், சிறுசெலவுப் பணம் இம்பிரெஸ்ட் முறையின் (Imprest System) கீழ் மீள்நிரப்பப்பட்டது (Reimbursed).\nசிறுசெலவுப் பண இம்பிரெஸ்டின் (Petty Cash Imprest / Float) பெறுமதி எவ்வளவு?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "What is Sri Lanka's current standard Value Added Tax (VAT) rate as of 2026?",
        si: "2026 වන විට ශ්‍රී ලංකාවේ වත්මන් සම්මත එකතු කළ අගය මත බද්ද (VAT) අනුපාතය කොපමණද?",
        ta: "2026 ஆம் ஆண்டின் படி, இலங்கையின் தற்போதைய நிலையான பெறுமதி சேர்க்கப்பட்ட வரி (VAT) விகிதம் எவ்வளவு?",
      },
    },
    // Row — Medium
    {
      subject: "Economics",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "How would the following events affect Gross Domestic Product? (State whether they increase, decrease, or do not affect Gross Domestic Product)\n(i) Firms increase their inventories.\n(ii) A retired worker gets an increase of Rs.1000 in pension allowance.\n(iii) Members of parliament vote for a decrease in their salaries with immediate effect.",
        si: "පහත සඳහන් සිදුවීම් දළ දේශීය නිෂ්පාදිතයට (GDP) බලපාන්නේ කෙසේද? (ඒවා දළ දේශීය නිෂ්පාදිතය වැඩි කරයිද, අඩු කරයිද, නැතහොත් බලපෑමක් නොකරයිද යන්න දක්වන්න.)\n(i) ආයතන තම තොග වැඩි කරයි.\n(ii) විශ්‍රාමික සේවකයෙකුට රු. 1000ක විශ්‍රාම වැටුප් දීමනාවක් වැඩි වේ.\n(iii) පාර්ලිමේන්තු මන්ත්‍රීවරුන් තම වැටුප් වහාම ක්‍රියාත්මක වන පරිදි අඩු කිරීමට ඡන්දය දෙයි.",
        ta: "பின்வரும் நிகழ்வுகள் மொத்த உள்நாட்டு உற்பத்தியை (GDP) எவ்வாறு பாதிக்கும்? (அவை மொத்த உள்நாட்டு உற்பத்தியை அதிகரிக்கிறதா, குறைக்கிறதா அல்லது பாதிக்கவில்லையா என்று குறிப்பிடுக)\n(i) நிறுவனங்கள் தங்களது விவரப்பட்டியல்களை (inventories) அதிகரிக்கின்றன.\n(ii) ஓய்வு பெற்ற ஊழியர் ஒருவர் ஓய்வூதிய கொடுப்பனவில் ரூ. 1000 உயர்வைப் பெறுகிறார்.\n(iii) நாடாளுமன்ற உறுப்பினர்கள் தங்களது சம்பளத்தை உடனடியாகக் குறைப்பதற்கு வாக்களிக்கின்றனர்.",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "Following are some actions taken by the businessmen in the business world.\n* Stealing patent rights\n* Advertisements that mislead the consumers\n* Production of goods with defects\n* Neglecting the paying back to deposit holders\nThese businessmen have violated\n—-----------------.",
        si: "ව්‍යාපාර ලෝකයේ ව්‍යාපාර විසින් සිදු කරන පහත සඳහන් ක්‍රියා කිහිපයකි\n\nපේටන්ට් අයිතිවාසිකම් සොරකම් කිරීම.\nපාරිභෝගිකයන් නොමඟ යවන දැන්වීම් ප්‍රචාරය කිරීම.\nදෝෂ සහිත භාණ්ඩ නිෂ්පාදනය කිරීම.\nතැන්පතුකරුවන්ට ආපසු ගෙවිය යුතු මුදල් ගෙවීම නොසලකා හැරීම",
        ta: "வணிக உலகில் சில வணிகர்கள் மேற்கொள்ளும் பின்வரும் செயல்களைக் கவனிக்கவும்:\nகாப்புரிமைகளை (Patent Rights) திருடுதல்.\nநுகர்வோரை தவறாக வழிநடத்தும் விளம்பரங்களை வெளியிடுதல்.\nகுறைபாடுள்ள பொருட்களை உற்பத்தி செய்தல்.\nவைப்பாளர்களுக்குச் செலுத்த வேண்டிய பணத்தைத் திருப்பிச் செலுத்துவதைப் புறக்கணித்தல்.\nமேற்கண்ட வணிகர்கள் எதனை மீறியுள்ளனர்?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "Question",
        si: "Choose the correct statement(s) from among the following, according to LKAS 1 – Presentation of Financial Statements.\nA. This standard provides the basis for the preparation of general purpose financial statements.\nB. Financial statements present the results related to the stewardship of resources entrusted to the management by the owners of the business.\nC. The operating cycle is the process from the purchase of raw materials to the point of realizing cash from their sale.\nD. Expenses recognized in determining profit or loss of an entity may be classified based on either their nature or their function.",
        ta: "LKAS 1 – මූල්‍ය ප්‍රකාශන ඉදිරිපත් කිරීම අනුව, පහත සඳහන් ප්‍රකාශ අතරින් නිවැරදි ප්‍රකාශය/ප්‍රකාශ තෝරන්න.\nA. මෙම ප්‍රමිතිය මඟින් සාමාන්‍ය අරමුණු සඳහා සකස් කරන මූල්‍ය ප්‍රකාශන සකස් කිරීම සඳහා පදනම සපයයි.\nB. මූල්‍ය ප්‍රකාශන මඟින් ව්‍යාපාරයේ හිමිකරුවන් විසින් කළමනාකරණයට භාර දී ඇති සම්පත් භාරකාරත්වය පිළිබඳ ප්‍රතිඵල ඉදිරිපත් කරයි.\nC. මෙහෙයුම් චක්‍රය යනු අමුද්‍රව්‍ය මිලදී ගැනීමේ සිට එම භාණ්ඩ විකිණීමෙන් මුදල් ලැබෙන අවස්ථාව දක්වා සිදුවන ක්‍රියාවලියයි.\nD. ආයතනයක ලාභය හෝ අලාභය තීරණය කිරීමේදී හඳුනාගන්නා වියදම්, ඒවායේ ස්වභාවය හෝ ඒවායේ කාර්යය මත පදනම්ව වර්ග කළ හැකිය.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "In 2026, which major central bank became the first among developed economies to raise interest rates, citing inflationary pressure from the Middle East conflict?",
        si: "2026 වර්ෂයේදී, මැද පෙරදිග ගැටුමෙන් ඇති වූ උද්ධමනකාරී පීඩනය හේතුවෙන් පොලී අනුපාත ඉහළ නැංවූ පළමු සංවර්ධිත ආර්ථිකයේ මධ්‍යම බැංකුව වූයේ කුමන බැංකුව ද?",
        ta: "2026 இல், மத்திய கிழக்கு மோதலின் பணவீக்க அழுத்தத்தை சுட்டிக்காட்டி, வளர்ந்த பொருளாதாரங்களில் வட்டி விகிதங்களை உயர்த்திய முதல் முக்கிய மத்திய வங்கி எது?",
      },
    },
    // Row — Hard
    {
      subject: "Economics",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "The Total Variable Cost of production at different output levels is given below:\nOutput: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10\nTotal Variable Cost (Rs.): 0, 100, 180, 220, 300, 390, 500, 640, 800, 1000, 1250\nNote: Total cost of producing the first unit = Rs. 600\nAccording to the above data, if a perfectly competitive firm is in equilibrium producing 9 units, what is the price of one unit?",
        si: "විවිධ නිමැවුම් මට්ටම් වලදී නිෂ්පාදනයේ මුළු විචල්‍ය පිරිවැය පහත දැක්වේ:\nනිමැවුම: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10\nමුළු විචල්‍ය පිරිවැය (රු.): 0, 100, 180, 220, 300, 390, 500, 640, 800, 1000, 1250\nසටහන: පළමු ඒකකය නිෂ්පාදනය කිරීමේ මුළු පිරිවැය = රු. 600\nඉහත දත්ත වලට අනුව, පූර්ණ තරඟකාරී ආයතනයක් ඒකක 9ක් නිෂ්පාදනය කරමින් සමතුලිතතාවයේ පවතී නම්, එක් ඒකකයක මිල කොපමණද?",
        ta: "வெவ்வேறு வெளியீட்டு மட்டங்களில் உற்பத்தியின் மொத்த மாறும் செலவு கீழே கொடுக்கப்பட்டுள்ளது:\nவெளியீடு: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10\nமொத்த மாறும் செலவு (ரூ.): 0, 100, 180, 220, 300, 390, 500, 640, 800, 1000, 1250\nகுறிப்பு: முதல் அலகை உற்பத்தி செய்வதற்கான மொத்த செலவு = ரூ. 600\nமேற்கண்ட தரவுகளின்படி, ஒரு முற்றுமுழுதான போட்டி நிறுவனம் 9 அலகுகளை உற்பத்தி செய்து சமநிலையில் இருந்தால், ஒரு அலகின் விலை என்ன?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Mr. Suresh is a manager who decides on the organizational strategies, policies and the future direction of the entire company. \nMr. Sudesh is a manager in that organization who implements those planning strategies, policies and is responsible for the actions of the employees under him.\nThe management level of Suresh and Sudesh is",
        si: "සුරේෂ් මහතා යනු මුළු සමාගමේම සංවිධානාත්මක උපාය මාර්ග, ප්‍රතිපත්ති සහ අනාගත දිශානතිය පිළිබඳව තීරණය කරනු ලබන කළමනාකරුවෙකි.\nසුදේශ් මහතා යනු එම සංවිධානයේ අදාළ සැලසුම්ගත උපාය මාර්ග සහ ප්‍රතිපත්ති ක්‍රියාත්මක කරමින්, තමා යටතේ සිටින සේවකයින්ගේ ක්‍රියාකාරකම් සඳහා වගකියනු ලබන කළමනාකරුවෙකි.\nසුරේෂ් සහ සුදේශ්ගේ කළමනාකරණ මට්ටම් මොනවාද?",
        ta: "திரு. சுரேஷ் என்பவர், நிறுவனத்தின் ஒட்டுமொத்த உத்திகள் (Strategies), கொள்கைகள் (Policies) மற்றும் எதிர்கால திசையைத் தீர்மானிக்கும் முகாமையாளராக உள்ளார்.\nதிரு. சுதேஷ் என்பவர், அந்த நிறுவனத்தில் மேற்கூறிய திட்டங்கள் மற்றும் கொள்கைகளை நடைமுறைப்படுத்துவதுடன், தன்னின் கீழ் பணிபுரியும் ஊழியர்களின் செயற்பாடுகளுக்குப் பொறுப்பான முகாமையாளராக உள்ளார்.\nசுரேஷ் மற்றும் சுதேஷ் ஆகியோரின் முகாமைத்துவ மட்டங்கள் (Management Levels) யாவை?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "VAT unregistered Rhythm PLC purchased a motor vehicle on 01/04/2025. The details are as follows:\n- Purchased a vehicle worth Rs. 2,000,000, inclusive of Rs. 400,000 VAT.\n- Spent Rs. 250,000 to transport the vehicle from that place to the business.\n- The vehicle was brought into use on 01/10/2025, and Rs. 150,000 was spent to bring it to a usable condition.\n- For driving this vehicle, a license was obtained on 30/09/2025 by paying Rs. 100,000.\n- The vehicle was depreciated over a useful life of 7 years, after which the estimated residual value is Rs. 300,000.\nWhat is the impact of this on the net profit for the year ended 31/03/2026?",
        si: "VAT ලියාපදිංචි නොවූ රිද්ම පොදු සමාගම 2025/04/01 මෝටර් රථයක් මිලට ගත් අතර ඊට අදාළ තොරතුරු පහත පරිදි වේ:\n- රු. 400,000ක VAT සහිතව රු. 2,000,000ක් වටිනා රථය මිලට ගත් අතර එම ස්ථානයේ සිට ව්‍යාපාරය වෙත ගෙන ඒම සඳහා රු. 250,000ක් වැය විය.\n- මෙලෙස ව්‍යාපාරයට ගෙන ආ රථය 2025/10/01 දින භාවිතයට ගත් අතර, මිලදීගත් රථය මෙලෙස භාවිත කිරීමට හැකි තත්ත්වයට ගෙන ඒමට රු. 150,000ක් වැය විය.\n- මෙම ධාවනය කිරීම සඳහා 2025/09/30 දින රු. 100,000 ක් වැය කරමින් බලපත්‍ර ලබා ගන්නා ලදී.\n- රථය වසර 7ක් භාවිතා කිරීමෙන් පසුව ඇස්තමේන්තුගත සුන්බුන් අගය, රු. 300,000කි.\n2026/03/31 න් අවසන් වසරේදී ශුද්ධ ලාභයට වන බලපෑම කොපමණද?",
        ta: "VAT இற்கு பதிவு செய்யப்படாத ரித்ம பொது நிறுவனம் 01/04/2025 அன்று ஒரு மோட்டார் வாகனத்தை வாங்கியது. அது தொடர்பான தகவல்கள் பின்வருமாறு:\n- ரூ. 400,000 VAT உட்பட ரூ. 2,000,000 மதிப்புள்ள வாகனத்தை வாங்கியது.\n- அவ்வாகனத்தை அங்கிருந்து வணிக இடத்திற்கு கொண்டு வருவதற்கு ரூ. 250,000 செலவிடப்பட்டது.\n- வாகனம் 01/10/2025 அன்று பயன்பாட்டிற்கு கொண்டு வரப்பட்டதுடன், அதைப் பயன்படுத்தக்கூடிய நிலைக்குக் கொண்டு வர ரூ. 150,000 செலவிடப்பட்டது.\n- இவ்வாகனத்தை ஓட்டுவதற்காக, 30/09/2025 அன்று ரூ. 100,000 செலுத்தி உரிமம் பெறப்பட்டது.\n- வாகனம் 7 ஆண்டுகள் பயனுள்ள ஆயுட்காலத்தைக் கொண்டுள்ளதோடு, அதன் பின் மதிப்பிடப்பட்ட மீதி மதிப்பு ரூ. 300,000 ஆகும்.\n31/03/2026 உடன் முடிவடைந்த ஆண்டில் நிகர இலாபத்தின் மீதான தாக்கம் என்ன?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Sri Lanka's real GDP grew by approximately what percentage year-on-year in 2025, according to the IMF's April 2026 review?",
        si: "IMF හි 2026 අප්‍රේල් සමාලෝචනයට අනුව, 2025 වසරේදී ශ්‍රී ලංකාවේ මූර්ත​ දළ දේශීය නිෂ්පාදිතය (real GDP) පෙර වසරට සාපේක්ෂව දළ වශයෙන් කුමන ප්‍රතිශතයකින් වර්ධනය වීද?",
        ta: "IMF இன் ஏப்ரல் 2026 மதிப்பாய்வின்படி, 2025 இல் இலங்கையின் மெய் மொத்த உள்நாட்டு உற்பத்தி (real GDP) ஆண்டுக்கு ஆண்டு தோராயமாக எத்தனை சதவீதம் வளர்ந்தது?",
      },
    },
    // Row — Super Hard
    {
      subject: "Economics",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "The following table shows the marginal cost of producing good A in the short run:\n\nIf the average fixed cost at output level 2 is 20, at what level of output will the average total cost be minimized in the short run?",
        si: "භාණ්ඩ A නිෂ්පාදනය කිරීමේ කෙටිකාලීන ආන්තික පිරිවැය (Marginal Cost) පහත වගුවේ දැක්වේ: \n- නිමැවුම් මට්ටම: 1, 2, 3, 4, 5, 6, 7, 8\n- ආන්තික  පිරිවැය (රු.): 20, 15, 8, 12, 20, 25, 35, 40\nනිමැවුම මට්ටම 2 දී සාමාන්‍ය ස්ථාවර පිරිවැය රු. 20ක් නම්, කෙටිකාලීනව සාමාන්‍ය මුළු පිරිවැය (Average Total Cost) අවම වන්නේ කුමන නිමැවුම මට්ටමකදී ද?",
        ta: "வரிக்கு பிந்தைய அரசாங்கத்தின் வரி வருவாயைக் கணக்கிடுக:\n- விலை (ரூ.): 20, 19, 18, 17, 16, 15, 14\n- Qd: அனைத்திற்கும் 380\n- வரிக்கு முன் Qs: 440, 430, 410, 380, 340, 290, 230\n- வரிக்கு பின் Qs: 380, 340, 290, 230, 160, 80, 0",
      },
      image: "/bs360-q/se4-eco-superhard.jpg",
    },
    {
      subject: "Business Studies",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "A vehicle valued at Rs. 20 Lakhs is insured with three insurance companies A, B, and C for Rs. 8 Lakhs, Rs. 5 Lakhs, and Rs. 7 Lakhs respectively. If the vehicle sustains a loss of Rs. 8 Lakhs, how much should each company contribute towards the compensation?",
        si: "රු. ලක්ෂ 20ක් වටිනා වාහනයක් A, B, සහ C යන රක්ෂණ සමාගම් තුනකින් පිළිවෙළින් රු. ලක්ෂ 8ක්, රු. ලක්ෂ 5ක්, සහ රු. ලක්ෂ 7ක් සඳහා රක්ෂණය කර ඇත. මෙම වාහනයට රු. ලක්ෂ 8ක හානියක් සිදු වුවහොත්, එක් එක් සමාගම විසින් වන්දි ගෙවීමට දායක විය යුත්තේ කොපමණ ප්‍රමාණයක් ද?",
        ta: "20 இலட்சம் மதிப்புள்ள வாகனம் ஒன்று A, B, C ஆகிய மூன்று காப்பீட்டு நிறுவனங்களில் முறையே 8 இலட்சம், 5 இலட்சம், 7 இலட்சத்திற்கு காப்பீடு செய்யப்பட்டுள்ளது. அவ்வாகனம் 8 இலட்சம் நஷ்டத்தை சந்தித்தால், ஒவ்வொரு நிறுவனமும் இழப்பீட்டிற்கு எவ்வாறு பங்களிக்க வேண்டும் என்பதைக் குறிக்கும் சரியான விடை எது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Sandun PLC, which started operations on 01/04/2025, had the following assets and liabilities as of 31/03/2026:\n- Trade payables: Rs. 100,000\n- Trade receivables: Rs. 150,000\n- Inventory: Rs. 200,000\n- Machinery & Equipment (acquired on 01/10/2025): Rs. 1,000,000\n- Tax payable: Rs. 10,000\nInformation for the year ended 31/03/2026:\n- The useful life of machinery & equipment is 10 years.\n- Tax expense for the year is Rs. 40,000.\n- Net cash flow generated from operating activities is Rs. 700,000.\nWhat is the profit for the year ended 31/03/2026?",
        si: "2025/04/01 ආරම්භ කල සීමිත සඳුන් සමාගමේ 2026/03/31 දිනට පහත වත්කම් හා වගකීම් පැවතුණි:\n- වෙළඳ ගෙවිය යුතු දෑ: රු. 100,000\n- වෙළඳ ලැබිය යුතු දෑ: රු. 150,000\n- තොගය: රු. 200,000\n- යන්ත්‍ර උපකරණ (2025/10/01 දින ගත්): රු. 1,000,000\n- ගෙවිය යුතු බදු: රු. 10,000\n2026/03/31 දිනෙන් අවසන් වසරේ තොරතුරු:\n- 2026/03/31 දිනෙන් අවසන් වසරේ යන්ත්‍ර උපකරණවල ඵලදායී ජීව කාලය වසර 10කි.\n- 2026/03/31 දිනෙන් අවසන් වසරේ බදු වියදම රු. 40,000කි.\n- 2026/03/31 දිනෙන් අවසන් වසරේ මෙහෙයුම් කටයුතු වලින් ජනනය වූ ශුද්ධ මුදල් ප්‍රවාහය රු. 700,000කි.\n2026/03/31 දිනෙන් අවසන් වසරේ ලාභය කොපමණද?",
        ta: "01/04/2025 அன்று ஆரம்பிக்கப்பட்ட சந்தூன் பொது நிறுவனத்தின் 31/03/2026 திகதிக்கான பின்வரும் சொத்துக்களும் பொறுப்புக்களும் காணப்பட்டன:\n- வர்த்தகக் கொடுப்பனவுகள்: ரூ. 100,000\n- வர்த்தகப் பெறவுகள்: ரூ. 150,000\n- இருப்பு: ரூ. 200,000\n- இயந்திர உபகரணங்கள் (01/10/2025 அன்று வாங்கப்பட்டது): ரூ. 1,000,000\n- செலுத்த வேண்டிய வரி: ரூ. 10,000\n31/03/2026 உடன் முடிவடைந்த ஆண்டிற்கான தகவல்கள்:\n- 31/03/2026 உடன் முடிவடைந்த ஆண்டில் இயந்திர உபகரணங்களின் பயனுள்ள ஆயுட்காலம் 10 ஆண்டுகள் ஆகும்.\n- 31/03/2026 உடன் முடிவடைந்த ஆண்டிற்கான வரிச் செலவு ரூ. 40,000 ஆகும்.\n- 31/03/2026 உடன் முடிவடைந்த ஆண்டில் மெய்படுத்தல் (මෙහෙයුම්) நடவடிக்கைகளிலிருந்து ஜெனரேட் செய்யப்பட்ட நிகர பணப்பாய்வு ரூ. 700,000 ஆகும்.\n31/03/2026 உடன் முடிவடைந்த ஆண்டிற்கான இலாபம் எவ்வளவு?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Sri Lanka's first attempt at economic liberalization — often called the \"open economy\" policy was introduced under President J.R. Jayewardene's government in which year?",
        si: "ජනාධිපති ජේ.ආර්. ජයවර්ධන මැතිතුමාගේ රජය යටතේ, \"විවෘත ආර්ථිකය\" ලෙස හැඳින්වෙන ශ්‍රී ලංකාවේ ප්‍රථම ආර්ථික ලිහිල්කරණ (liberalization) වැඩපිළිවෙළ හඳුන්වා දෙනු ලැබුවේ කුමන වසරේ ද?",
        ta: "பெரும்பாலும் \"திறந்த பொருளாதாரம்\" என்று அழைக்கப்படும் இலங்கையின் பொருளாதார தாராளமயமாக்கலுக்கான முதல் முயற்சி ஜனாதிபதி ஜே.ஆர். ஜெயவர்தனவின் அரசாங்கத்தின் கீழ் எந்த ஆண்டில் அறிமுகப்படுத்தப்பட்டது?",
      },
    },
  ],
};

const GRID_5: QuizGrid = {
  id: 5,
  label: 'Grid 05',
  available: true,
  boxes: [
    // Row — Easy
    {
      subject: "Economics",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "During the expansion phase of the business cycle, what happens to real Gross Domestic Product (GDP) and unemployment? (State whether the real Gross Domestic Product and Unemployment increase, decrease or have no effect)",
        si: "ව්‍යාපාර චක්‍රයේ ප්‍රසාරණ අවධියේදී, මූර්ත දළ දේශීය නිෂ්පාදිතයට (GDP) සහ විරැකියාවට කුමක් සිදුවේද? (මූර්ත දළ දේශීය නිෂ්පාදිතය සහ විරැකියාව වැඩි වේද, අඩු වේද නැතහොත් බලපෑමක් නැතිද යන්න දක්වන්න)",
        ta: "வணிகச் சுழற்சியின் விரிவாக்கக் கட்டத்தில், மெய் மொத்த உள்நாட்டு உற்பத்தி (GDP) மற்றும் வேலையின்மைக்கு என்ன நடக்கும்? (மெய் மொத்த உள்நாட்டு உற்பத்தி மற்றும் வேலையின்மை அதிகரிக்கிறதா, குறைகிறதா அல்லது எந்த விளைவும் இல்லையா என்று குறிப்பிடுக)\n(i) மெய் மொத்த உள்நாட்டு உற்பத்தி (GDP)\n(ii) வேலையின்மை",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "Who is the founding governor of CBSL?",
        si: "ශ්‍රී ලංකා මහ බැංකුවේ (CBSL) නිර්මාතෘ අධිපතිවරයා කවුද?",
        ta: "CBSL இன் ஸ்தாபக ஆளுநர் யார்?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "Which of the following statements is correct?\nA. Production supervisor's salary is a period cost.\n B. Direct labour cost is always a variable cost.\n C. Abnormal loss is a controllable cost.\n D. A sunk cost is an irrelevant cost",
        si: "පහත ප්‍රකාශ අතරින් නිවැරදි ප්‍රකාශය කුමක්ද?\nA. නිෂ්පාදන සුපරීක්ෂකගේ වැටුප කාලඡේද පිරිවැයකි.\n B. සෘජු ශ්‍රම පිරිවැය සෑම විටම විචල්‍ය පිරිවැයකි.\n C. අසාමාන්‍ය අපතය පාලනය කළ හැකි පිරිවැයකි.\n D. ගිලුණු පිරිවැය අදාළ නොවන පිරිවැයකි.",
        ta: "பின்வரும் கூற்றுகளில் சரியானது எது?\nA. உற்பத்தி மேற்பார்வையாளரின் (Production Supervisor) சம்பளம் ஒரு காலச் செலவு (Period Cost) ஆகும்.\nB. நேரடித் தொழிலாளர் செலவு (Direct Labour Cost) எப்போதும் மாறுபடு செலவு (Variable Cost) ஆகும்.\nC. இயல்பற்ற இழப்பு (Abnormal Loss) ஒரு கட்டுப்படுத்தக்கூடிய செலவு (Controllable Cost) ஆகும்.\nD. மீளப் பெற முடியாத செலவு (Sunk Cost) ஒரு தொடர்பற்ற செலவு (Irrelevant Cost) ஆகும்.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "What is the 2nd Highest Mountain in the world?",
        si: "ලෝකයේ දෙවෙනියට උසම කන්ද කුමක්ද?",
        ta: "உலகின் இரண்டாவது உயரமான மலை எது?",
      },
    },
    // Row — Medium
    {
      subject: "Economics",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "Consider an economy where the marginal propensity to consume is 0.8. How much will the total output in this economy increase, if government transfers are increased by Rs. 400 billion?",
        si: "ආන්තික පරිභෝජන නැඹුරුව (MPC) 0.8ක් වන ආර්ථිකයක් සලකා බලන්න. රජය විසින් හුවමාරු ගෙවීම් (transfer payments) රු. බිලියන 400කින් වැඩි කළහොත්, මෙම ආර්ථිකයේ මුළු නිෂ්පාදිතය කොපමණකින් වැඩි වේ ද?",
        ta: "நுகர்வு எல்லைப் போக்கு 0.8 ஆக இருக்கும் ஒரு பொருளாதாரத்தைக் கருதுக. அரசாங்க மாற்றல்கள் ரூ. 400 பில்லியன் அதிகரித்தால், இப்பொருளாதாரத்தின் மொத்த வெளியீடு எவ்வளவு அதிகரிக்கும்?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "What is the Document issued to the exporter by customs confirming that the goods were received by them?",
        si: "භාණ්ඩ තමන් වෙත ලැබුණු බව තහවුරු කරමින් රේගුව විසින් අපනයනකරු වෙත නිකුත් කරනු ලබන ලේඛනය කුමක්ද?",
        ta: "பொருட்கள் தங்களால் பெறப்பட்டன என்பதை உறுதிப்படுத்தி சுங்கத்துறையினரால் ஏற்றுமதியாளருக்கு வழங்கப்படும் ஆவணம் எது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "State whether each of the following transactions increases, decreases, or has no effect on a company's Inventory Turnover Ratio.\nA. Selling inventory for cash.\nB. Purchasing inventory on credit.\nC. Incurring selling expenses.\nD. Returning goods purchased on credit to the supplier.",
        si: "පහත එක් එක් ගනුදෙනුව සමාගමක තොග පිරිවැටුම් අනුපාතයට (Inventory Turnover Ratio) කරනු ලබන බලපෑම වැඩිවේද, අඩුවේද, නැතහොත් වෙනස් නොවේද යන්න සඳහන් කරන්න.\nA. අතපිට තොගය විකිණීම\nB. ණයට ගැනීම්\nC. විකුණුම් වියදම් දැරීම\nD. ණය පදනම මත ලබාගත් භාණ්ඩ ආපසු යැවීම",
        ta: "பின்வரும் ஒவ்வொரு பரிவர்த்தனையும், ஒரு நிறுவனத்தின் சரக்குச் சுழற்சி விகிதத்தை (Inventory Turnover Ratio) அதிகரிக்கிறதா, குறைக்கிறதா அல்லது எந்த விளைவையும் ஏற்படுத்தாதா என்பதை குறிப்பிடுக.\nA. சரக்குகளை பணத்திற்கு விற்பனை செய்தல்.\nB. சரக்குகளை கடனுக்கு கொள்வனவு செய்தல்.\nC. விற்பனைச் செலவுகள் (Selling Expenses) ஏற்படுதல்.\nD. கடனுக்கு கொள்வனவு செய்யப்பட்ட சரக்குகளை வழங்குநரிடம் (Supplier) திருப்பி அனுப்புதல்.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "The Event Horizon Telescope collaboration made history in 2019 by capturing the first-ever image of what?",
        si: "Event Horizon දුරේක්‍ෂය​ 2019 දී ඉතිහාසයට එක් වූයේ කුමන දෙයක පළමු රූපය ග්‍රහණය කර ගැනීමෙන්ද?",
        ta: "ஈவென்ட் ஹொரைசன் தொலைநோக்கி (Event Horizon Telescope) கூட்டமைப்பு 2019 இல் எதன் முதல் படத்தைப் பிடித்ததன் மூலம் வரலாறு படைத்தது?",
      },
    },
    // Row — Hard
    {
      subject: "Economics",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "In a country, if real gross domestic product (real GDP) increases, what will be the effect on net exports (NX)?",
        si: "රටක, මූර්ත දළ දේශීය නිෂ්පාදිතය (real GDP) ඉහළ ගියහොත්, ශුද්ධ අපනයන (NX) කෙරෙහි ඇති වන බලපෑම කුමක්ද?",
        ta: "ஒரு நாட்டில், மெய் மொத்த உள்நாட்டு உற்பத்தி (real GDP) அதிகரித்தால், நிகர ஏற்றுமதி (NX) மீதான விளைவு என்னவாக இருக்கும்?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Below are a few documents that have to be submitted when registering a business.\nA - Application of the registration\nB - Articles of Association\nC - Two copies of the proposed by-laws\nD - The minute of the general meeting at which the resolution to register the society was passed.\nE – Feasibility report pertaining to the economic activities\nF - Statutory Declaration\n\nAmong the above, the documents that should be submitted  for the registration of a co-operative society are",
        si: "පහත දැක්වෙන්නේ ව්‍යාපාරයක් ලියාපදිංචි කිරීමේදී ඉදිරිපත් කළ යුතු ලේඛන කිහිපයකි.\nA - ලියාපදිංචි කිරීමේ අයදුම්පත\nB - සංස්ථාපිත නීති මාලාව (Articles of Association)\nC - යෝජිත අනුනීතිවල පිටපත් දෙකක්\nD - සමිතිය ලියාපදිංචි කිරීමේ යෝජනාව සම්මත වූ මහ සභා රැස්වීමේ වාර්තාව (මිනිත්තු වාර්තාව)\nE - ආර්ථික කටයුතුවලට අදාළ ශක්‍යතා වාර්තාව\nF - ව්‍යවස්ථාපිත ප්‍රකාශනය\nඉහත දැක්වෙන ලේඛන අතුරින්, සහකාර සමිතියක් (සහකර සමිතියක්) ලියාපදිංචි කිරීම සඳහා ඉදිරිපත් කළ යුතු ලේඛන වන්නේ:",
        ta: "ஒரு வணிகத்தைப் பதிவு செய்யும் போது சமர்ப்பிக்கப்பட வேண்டிய சில ஆவணங்கள் பின்வருமாறு:\nA. பதிவுக்கான விண்ணப்பம் (Application for Registration)\nB. நிறுவன விதிகள் (Articles of Association)\nC. முன்மொழியப்பட்ட உபவிதிகளின் (By-laws) இரண்டு பிரதிகள்\nD. கூட்டுறவுச் சங்கத்தைப் பதிவு செய்வதற்கான தீர்மானம் நிறைவேற்றப்பட்ட பொதுக் கூட்டத்தின் கூட்ட அறிக்கை (Minutes of the General Meeting)\nE. பொருளாதார நடவடிக்கைகள் தொடர்பான சாத்தியப்பாட்டு அறிக்கை (Feasibility Report)\nF. சட்டப்பூர்வ உறுதிமொழி (Statutory Declaration)\nமேற்கண்டவற்றில், ஒரு கூட்டுறவுச் சங்கத்தை (Co-operative Society) பதிவு செய்வதற்காக சமர்ப்பிக்கப்பட வேண்டிய ஆவணங்கள் எவை?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Sandaruwan PLC expects to launch a new product to the market. For its manufacturing, a machine was imported on credit through an agent on 23/01/2026. The following costs were incurred:\n- Purchase price of the machine: Rs. 8,700,000\n- Site preparation costs required for installing the machine: Rs. 180,000\n- Annual fire insurance premium (for protecting the machine): Rs. 80,000\n- Import duties: Rs. 2,000,000\n- Demurrage charges: Rs. 100,000\n- Penalty charges incurred during transportation: Rs. 250,000\nAccording to the agreement between the seller and buyer, if the total payment is made before 28/01/2026, a 10% discount on the purchase price is received. The buyer paid the purchase price of the machine in cash before that date.\nAccording to 'LKAS 16 - Property, Plant and Equipment', what is the cost of this machine on initial recognition?",
        si: "සීමිත සදරුවන් පොදු සමාගම විසින් නවතම නිෂ්පාදනයක් වෙළඳපොළට නිකුත් කිරීමට අපේක්ෂා කරයි එය නිපදවීමට අවශ්‍ය යන්ත්‍රයක් 2026/01/23 ණය පදනම මත නියෝජිතයකු හරහා ආනයනය කර ලද අතර එයට පහත පිරිවැය දරන ලදී:\n- යන්ත්‍රයේ ගැනුම් මිල: රු. 8,700,000\n- යන්ත්‍රය සවිකිරීමට අවශ්‍ය වැඩබිම සැකසීම: රු. 180,000\n- ගිනි රක්ෂණ වාර්ෂික වාරිකය (යන්ත්‍රයේ ආරක්ෂාව පිණිස): රු. 80,000\n- ආනයන ගාස්තු: රු. 2,000,000\n- නැව් ප්‍රමාද ගාස්තු: රු. 100,000\n- ප්‍රවාහනයේදී අය කළ දඩ ගාස්තු: රු. 250,000\nයන්ත්‍රය මිලදී ගැනීමේදී විකුණුම්කරු සහ ගැනුම්කරු අතර ඇති කරගත් එකඟතාවය පරිදි 2026.01.28 දිනට පෙර මුළු මුදල ගෙවන්නේ නම් 10% ක වට්ටමක් හිමිවේ. ගැනුම්කරු විසින් යන්ත්‍රයේ ගැනුම් මිල මුදලින් පියවන ලදී.\n'LKAS 16- දේපළ පිරික් හා උපකරණ' ප්‍රමිතියට අනුව මුල්වරට හඳුනා ගැනීමේදී මෙම යන්ත්‍රයේ පිරිවැය කොපමණද?",
        ta: "சந்தருவன் பொது நிறுவனம் ஒரு புதிய தயாரிப்பை சந்தைக்கு அறிமுகப்படுத்த எதிர்பார்க்கிறது. அதை தயாரிப்பதற்கு தேவையான இயந்திரம் ஒன்று 23/01/2026 அன்று முகவர் ஒருவரின் மூலம் கடன் அடிப்படையில் இறக்கமதி செய்யப்பட்டதுடன், அதற்கு பின்வரும் செலவுகள் செய்யப்பட்டன:\n- இயந்திரத்தின் கொள்வனவு விலை: ரூ. 8,700,000\n- இயந்திரத்தை நிறுவுவதற்கு தேவையான தள தயாரிப்பு செலவு: ரூ. 180,000\n- ஆண்டு தீக்காப்பீட்டு முற்பணம் (இயந்திரத்தின் பாதுகாப்பிற்காக): ரூ. 80,000\n- இறக்கமதி வரிகள்: ரூ. 2,000,000\n- கப்பல் தாமதக் கட்டணம் (Demurrage): ரூ. 100,000\n- போக்குவரத்தின் போது விதிக்கப்பட்ட அபராதக் கட்டணம்: ரூ. 250,000\nவிற்பனையாளருக்கும் வாங்குபவருக்கும் இடையிலான உடன்படிக்கையின்படி, 28/01/2026 திகதிக்கு முன்னர் முழுத் தொகையும் செலுத்தப்பட்டால், கொள்வனவு விலையில் 10% தள்ளுபடி கிடைக்கும். வாங்குபவர் இயந்திரத்தின் கொள்வனவு விலையை அத்திகதிக்கு முன்னர் பணமாகச் செலுத்தினார்.\n'LKAS 16 - சொத்து, பொறி மற்றும் உபகரணங்கள்' தரநிலையின்படி, ஆரம்ப அங்கீகாரத்தின் போது இவ்வியந்திரத்தின் கிரயம் எவ்வளவு?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "Sri Lanka's Employees' Provident Fund (EPF), one of the oldest social security schemes in Asia, was established in which year?",
        si: "ආසියාවේ පැරණිතම සමාජ ආරක්ෂණ ක්‍රමවලින් එකක් වන ශ්‍රී ලංකාවේ සේවක අර්ථසාධක අරමුදල (EPF) පිහිටුවන ලද්දේ කුමන වසරේද?",
        ta: "ஆசியாவின் பழமையான சமூகப் பாதுகாப்புத் திட்டங்களில் ஒன்றான இலங்கையின் ஊழியர் சேமலாப நிதி (EPF) எந்த ஆண்டில் நிறுவப்பட்டது?",
      },
    },
    // Row — Super Hard
    {
      subject: "Economics",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "For a certain commodity, the quantity demanded, the quantity supplied before the tax, and the quantity supplied after the tax are given in the table below. Calculate the government's tax revenue after the tax implemation:\n- Price (Rs.): 20, 19, 18, 17, 16, 15, 14\n- Qd: 380 for all\n- Qs before tax: 440, 430, 410, 380, 340, 290, 230\n- Qs after tax: 380, 340, 290, 230, 160, 80, 0",
        si: "යම් භාණ්ඩයක් සඳහා ඉල්ලුම් ප්‍රමාණය, බද්දට පෙර සැපයුම් ප්‍රමාණය සහ බද්දට පසු සැපයුම් ප්‍රමාණය පහත වගුවේ දක්වා ඇත. බද්දෙන් පසු රජයේ බදු ආදායම ගණනය කරන්න:\n- මිල (රු.): 20, 19, 18, 17, 16, 15, 14\n- Qd: සියල්ලටම 380\n- බද්දට පෙර Qs: 440, 430, 410, 380, 340, 290, 230\n- බද්දට පසු Qs: 380, 340, 290, 230, 160, 80, 0",
        ta: "ஒரு குறிப்பிட்ட பண்டத்திற்கான தேவை அளவு, வரிக்கு முன்னரான வழங்கல் அளவு மற்றும் வரிக்கு பின்னரான வழங்கல் அளவு கீழே உள்ள அட்டவணையில் கொடுக்கப்பட்டுள்ளன. வரிக்கு பிந்தைய அரசாங்கத்தின் வரி வருவாயைக் கணக்கிடுக:\n- விலை (ரூ.): 20, 19, 18, 17, 16, 15, 14\n- Qd: அனைத்திற்கும் 380\n- வரிக்கு முன் Qs: 440, 430, 410, 380, 340, 290, 230\n- வரிக்கு பின் Qs: 380, 340, 290, 230, 160, 80, 0",
      },
      image: "/bs360-q/se5-eco-superhard.png",
    },
    {
      subject: "Business Studies",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "The institutes of whose main function is to recover the loans being provided to customers by trade institutions are known as,",
        si: "වෙළඳ ආයතන විසින් පාරිභෝගිකයින්ට ලබා දෙන ණය අයකර ගැනීම ප්‍රධාන කාර්යය වන ආයතන හඳුන්වනු ලබන්නේ,",
        ta: "வர்த்தக நிறுவனங்களால் வாடிக்கையாளர்களுக்கு வழங்கப்படும் கடன்களை மீட்டெடுப்பதை முதன்மைச் செயல்பாடாகக் கொண்ட நிறுவனங்கள் எவ்வாறு அழைக்கப்படுகின்றன?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "The directors of Amila PLC approved the issuance of financial statements for the year ended 31/03/2026 on 15/06/2026.\n- The cost of inventory on 31/03/2026 was Rs. 100,000. This closing inventory was destroyed due to a flood that occurred on 05/04/2026, and no adjustment has been made in the financial statements regarding this.\n- A debtor of Rs. 30,000 as of 31/03/2026 became bankrupt on 01/05/2026, and the business was informed of this on the same day.\n- Due to a lawsuit filed against the company on 01/01/2026, the judgment was announced on 12/05/2026, and the court ordered that a compensation of Rs. 20,000 be paid to the employee.\n- Current assets and current liabilities calculated as of 31/03/2026 were Rs. 200,000 and Rs. 150,000 respectively.\nAccording to 'LKAS 10 - Events After the Reporting Period', after adjusting the above transactions and events in the financial statements, the correct values of current assets and current liabilities are:",
        si: "සීමිත අමිල පොදු සමාගමෙහි 2026/03/31 දිනෙන් අවසන් වසර සඳහා මූල්‍ය ප්‍රකාශ නිකුත් කිරීම සඳහා 2026/06/15 වන දින අධ්‍යක්ෂවරුන් විසින් අනුමැතිය ලබා දී ඇත.\n- 2026/03/31 දින ඇති තොගවල පිරිවැය රු. 100,000කි. අවසන් තොගය 2026/04/05 වන දින ඇති වූ ගංවතුර තත්ත්වයක් හේතුවෙන් විනාශ වූ අතර ඒ පිළිබඳ මූල්‍ය ප්‍රකාශ තුළ කිසිදු ගැලපීමක් තබා නොමැත.\n- 2026/03/31 දිනට සිටි රු. 30,000 ක ණයගැතියෙකු 2026/05/01 දින බංකොලොත් වූ බව එදිනම ව්‍යාපාරයට දැනුම් දෙන ලදී.\n- 2026/01/01 දින සමාගමට විරුද්ධව පැවරූ නඩුවක් හේතුවෙන් ඊට අදාළ තීන්දුව 2026/05/12 වන දින ප්‍රකාශයට පත් කළ අතර එම සේවකයා සඳහා රු. 20,000ක වන්දියක් ගෙවිය යුතු බවට අධිකරණය විසින් දැනුම් දෙන ලදී.\n- 2026/03/31 දිනට ගණනය කර ඇති ජංගම වත්කම් හා ජංගම වගකීම් පිළිවෙලින් රු. 200,000 ක් හා රු. 150,000 ක් විය.\n‘LKAS 10 - කාලච්ඡේදයට පසු සිදුවීම්’ ප්‍රමිතියට අනුව ඉහත ගනුදෙනු හා සිදුවීම් මූල්‍ය ප්‍රකාශ තුළ ගැලපූ පසු ජංගම වත්කම් හා ජංගම වගකීම් වල නිවැරදි වටිනාකම වනුයේ,",
        ta: "அமில பொது நிறுவனம் 31/03/2026 உடன் முடிவடைந்த ஆண்டிற்கான நிதி அறிக்கைகளை வெளியிடுவதற்கு 15/06/2026 அன்று இயக்குநர்களால் அங்கீகாரம் வழங்கப்பட்டது.\n- 31/03/2026 அன்று இருந்த இருப்பின் கிரயம் ரூ. 100,000 ஆகும். இவ்விறுதி இருப்பு 05/04/2026 அன்று ஏற்பட்ட வெள்ளப்பெருக்கு காரணமாக அழிவடைந்ததுடன், அது தொடர்பாக நிதி அறிக்கைகளில் எந்தவொரு செம்மையாக்கலும் செய்யப்படவில்லை.\n- 31/03/2026 அன்று காணப்பட்ட ரூ. 30,000 கடனாளி ஒருவர் 01/05/2026 அன்று திவாலானதாக அன்றைய தினமே வணிகத்திற்கு அறிவிக்கப்பட்டது.\n- 01/01/2026 அன்று நிறுவனத்திற்கு எதிராக தொடரப்பட்ட வழக்கு ஒன்றின் காரணமாக, அதன் தீர்ப்பு 12/05/2026 அன்று அறிவிக்கப்பட்டதுடன், அந்த ஊழியருக்கு ரூ. 20,000 இழப்பீடு வழங்க வேண்டும் என்று நீதிமன்றம் அறிவித்தது.\n- 31/03/2026 திகதியில் கணிக்கப்பட்ட நடப்புச் சொத்துக்களும் நடப்புப் பொறுப்புக்களும் முறையே ரூ. 200,000 மற்றும் ரூ. 150,000 ஆக இருந்தன.\n'LKAS 10 - அறிக்கைப்படுத்தும் காலப்பகுதிக்கு பின்னரான நிகழ்வுகள்' தரநிலையின்படி, மேற்கூறிய கொடுக்கல்வாங்கல்கள் மற்றும் நிகழ்வுகளை நிதி அறிக்கைகளில் செம்மையாக்கிய பின்னர், நடப்புச் சொத்துக்கள் மற்றும் நடப்புப் பொறுப்புக்களின் சரியான மதிப்புகள் யாவை?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "What is the trading name of ‘The Elephant House” Brand at the Colombo Stock Exchange?",
        si: "කොළඹ ව්‍යාපාරික වස්තු හුවමාරුවේ (Colombo Stock Exchange) 'එලිෆන්ට් හවුස්' (Elephant House) සන්නාමය ලියාපදිංචි වී ඇති වෙළඳ නාමය/සමාගම් නාමය?",
        ta: "கொழும்பு பங்குச் சந்தையில் 'Elephant House' பிராண்டின் வர்த்தகப் பெயர் என்ன?",
      },
    },
  ],
};

const GRID_6: QuizGrid = {
  id: 6,
  label: 'Grid 06',
  available: true,
  boxes: [
    // Row — Easy
    {
      subject: "Economics",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "Which economic system can be identified as a market-based economic system where government intervention is used to promote social justice and ensure social welfare?",
        si: "සමාජ සාධාරණත්වය ප්‍රවර්ධනය කිරීමට සහ සමාජ සුභසාධනය සහතික කිරීමට රජයේ මැදිහත්වීම භාවිතා කරන වෙළඳපල පදනම් කරගත් ආර්ථික ක්‍රමයක් ලෙස හඳුනාගත හැක්කේ කුමන ආර්ථික ක්‍රමයද?",
        ta: "சமூக நீதியை மேம்படுத்துவதற்கும் சமூக நலனை உறுதி செய்வதற்கும் அரசாங்கத்தின் தலையீடு பயன்படுத்தப்படும் சந்தை சார்ந்த பொருளாதார முறையாக அடையாளம் காணக்கூடிய பொருளாதார முறை எது?",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "Janithmi Traders manufacture softdrink bottles and set a maximum retail price Rs. 30/- per bottle. Suranimala, who organises a religious festival in his area, buys 500 bottles to serve to participants of the festival. The trade \"Janithmi Traders\" did is,",
        si: "ජනිත්මි ට්‍රේඩර්ස්  බීම බෝතල් නිෂ්පාදනය කර බෝතලයක උපරිම සිල්ලර මිල රු. 30/- ක් ලෙස නියම කරයි. තම ප්‍රදේශයේ ආගමික උත්සවයක් සංවිධානය කරන සුරනිමල, උත්සවයට පැමිණෙන පිරිසට සංග්‍රහ කිරීම සඳහා බෝතල් 500ක් මිලදී ගනී. \"ජනිත්මි ට්‍රේඩර්ස්\" සිදු කළ වෙළඳාම වන්නේ,",
        ta: "ஜனித்மி டிரேடர்ஸ் குளிர்பான பாட்டில்களை தயாரித்து ஒரு பாட்டிலுக்கு அதிகபட்ச சில்லறை விலை ரூ. 30/- என நிர்ணயிக்கிறது. தன் பகுதியில் ஒரு மத விழாவை ஏற்பாடு செய்யும் சுரனிமல, விழாவில் பங்கேற்பாளர்களுக்கு வழங்குவதற்காக 500 பாட்டில்களை வாங்குகிறார். \"ஜனித்மி டிரேடர்ஸ்\" செய்த வர்த்தகம்:",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "A business had an inventory cost of Rs. 800,000 and a Net Realisable Value (NRV) of Rs. 750,000 as at 31.03.2026.\nThe relevant concepts applied, respectively, for adjusting the inventory cost of Rs. 800,000 against purchases and recognising the Net Realisable Value of Rs. 750,000 under current assets are,",
        si: "ව්‍යාපාරයක 2026.03.31 දිනට තොගයේ පිරිවැය රු. 800 000 ක් හා ශුද්ධ උපලබ්ධි අගය රු. 750 000 ක් විය. තොගයේ පිරිවැය වූ රු. 800 000 ගැණුම්වලට එරෙහිව ගැලපීමටත් එහි ශුද්ධ උපලබ්ධි අගය රු. 750 000 ජංගම වත්කම් යටතේ හඳුනා ගැනීමටත් අදාළ සංකල්ප අනුපිළිවෙළින් දක්වනුයේ,",
        ta: "31.03.2026 அன்று, ஒரு வணிகத்தின் சரக்கின் (Inventory) அடக்க விலை (Cost) ரூ. 800,000 ஆகவும், நிகர ஈட்டத்தக்க பெறுமதி (Net Realisable Value – NRV) ரூ. 750,000 ஆகவும் இருந்தது.\nரூ. 800,000 பெறுமதியான சரக்கின் அடக்க விலையை கொள்வனவுகளுக்கு (Purchases) எதிராகச் சரிசெய்வதற்கும், ரூ. 750,000 நிகர ஈட்டத்தக்க பெறுமதியை நடப்புச் சொத்துகளின் (Current Assets) கீழ் அங்கீகரிப்பதற்கும் முறையே பயன்படுத்தப்பட்டுள்ள கணக்கியல் கோட்பாடுகள் (Accounting Concepts) யாவை?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Easy",
      points: POINTS_BY_DIFFICULTY[0],
      question: {
        en: "Who won the Best Actor award at the 98th Academy Awards (Oscars) held in March 2026?",
        si: "2026 ඇකඩමි සම්මාන උළෙලේ (ඔස්කාර්) හොඳම නළුවා සම්මානය දිනාගත්තේ කවුද?",
        ta: "2026 ஆம் ஆண்டு அகாடமி விருதுகளில் (ஆஸ்கார்) சிறந்த நடிகருக்கான விருதை வென்றவர் யார்?",
      },
    },
    // Row — Medium
    {
      subject: "Economics",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "In a given year, the nominal GDP of an economy is Rs. 6,000 billion and the real GDP is Rs. 8,000 billion. Calculate the GDP deflator.",
        si: "නිශ්චිත වසරකදී, ආර්ථිකයක නාමික GDP රු. බිලියන 6,000 ක් වන අතර   මූර්ත GDP රු. බිලියන 8,000 කි. GDP අවධමනකය ගණනය කරන්න.",
        ta: "ஒரு குறிப்பிட்ட ஆண்டில், ஒரு பொருளாதாரத்தின் பெயரளவு GDP ரூ. 6,000 பில்லியன் மற்றும் மெய் GDP ரூ. 8,000 பில்லியன் ஆகும். GDP விலைக்குறைப்பியைக் கணக்கிடுக.",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "What term is used to define a person who buys or sells goods of the principal to a buyer under his own name on behalf of the principal?",
        si: "හිමිකරුවා (ප්‍රධානියා) වෙනුවෙන් තමාගේම නමින් භාණ්ඩ මිලදී ගන්නා හෝ විකුණන තැනැත්තා හඳුන්වන පදය කුමක්ද?",
        ta: "முதலாளியின் (Principal) சார்பில் தனது சொந்தப் பெயரில் பொருட்களை வாங்கும் அல்லது விற்கும் நபரை வரையறுக்கப் பயன்படும் சொல் எது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "The inventory of Wickramasinghe Business as at 31.03.2026 could not be physically counted, and it was physically counted on 26.04.2026 at a value of Rs. 150,000.\nThe following transactions occurred during the period from 01.04.2026 to 20.04.2026.\nThe business sells goods by maintaining a profit margin of 25% on cost.\nThe correct inventory value as at 31.03.2026 is",
        si: "වික්‍රමසිංහ ව්‍යාපාරයේ 2026.03.31 දිනට තොගය ගණනය කිරීමට නොහැකි වී ඇති අතර, එය 2026.04.26 දින භෞතිකව ගණනය කිරීමේදී රු. 150,000ක් ලෙස හඳුනාගෙන ඇත.\n2026.04.01 සහ 2026.04.20 අතර කාලය තුළ සිදු වූ ගනුදෙනු පහත දැක්වේ.\nව්‍යාපාරය පිරිවැය මත 25%ක ලාභ ප්‍රතිශතයක් තබා ගනිමින් විකුණුම් සිදු කරයි.\n2026.03.31 දිනට නිවැරදි තොග වටිනාකම වනුයේ",
        ta: "விக்கிரமசிங்க வணிகத்தின் 31.03.2026 அன்றைய சரக்கிருப்பை நேரடியாக எண்ணிக்கையிட முடியவில்லை. 26.04.2026 அன்று மேற்கொள்ளப்பட்ட பௌதிக சரக்கெடுப்பின்படி, சரக்கிருப்பின் பெறுமதி ரூ. 150,000 ஆக இருந்தது.\n01.04.2026 முதல் 20.04.2026 வரையான காலப்பகுதியில் பின்வரும் பரிவர்த்தனைகள் இடம்பெற்றன:\nபரிவர்த்தனை\tரூ.\nபணக் கொள்வனவு\t35,000\nபண விற்பனை\t140,000\nகொள்வனவுத் திருப்பம்\t4,000\nவழியிலுள்ள கொள்வனவுச் சரக்கு\t5,000\nவணிகம், அடக்க விலையின் மீது 25% இலாப எல்லையை பேணிப் பொருட்களை விற்பனை செய்கிறது.\n31.03.2026 அன்றைய சரியான சரக்கிருப்பின் பெறுமதி எவ்வளவு?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Medium",
      points: POINTS_BY_DIFFICULTY[1],
      question: {
        en: "The gold standard, which linked currency value directly to a fixed quantity of gold, was largely abandoned by major economies following which global event?",
        si: "මුදල්වල වටිනාකම රන් ස්ථාවර ප්‍රමාණයකට සෘජුවම සම්බන්ධ කළ රන් ප්‍රමිතිය, ප්‍රධාන ආර්ථිකයන් විසින් අත්හැර දමන ලද්දේ කුමන ගෝලීය සිදුවීමෙන් පසුවද?",
        ta: "நாணய மதிப்பை ஒரு குறிப்பிட்ட அளவு தங்கத்துடன் நேரடியாக இணைத்த தங்கத் தரநிலை, எந்த உலகளாவிய நிகழ்வைத் தொடர்ந்து முக்கிய பொருளாதாரங்களால் பெருமளவில் கைவிடப்பட்டது?",
      },
    },
    // Row — Hard
    {
      subject: "Economics",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "In a simple economy, due to a decrease in marginal propensity to save (MPS), what will be the effect on the following components? (State whether increase, decrease, or remains unchanged)\n1. Marginal propensity to consume (MPC)\n2. Expenditure multiplier\n3. Autonomous expenditure\n4. Household income",
        si: "සරල ආර්ථිකයක, අන්තික ඉතිරුම් නැඹුරුව (MPS) අඩුවීම හේතුවෙන්, පහත සඳහන් සංරචක කෙරෙහි ඇති වන බලපෑම කුමක්ද? (වැඩි වේද, අඩු වේද, නැතහොත් වෙනස් නොවී පවතීද යන්න දක්වන්න)\n1. අන්තික පරිභෝජන නැඹුරුව (MPC)\n2. වියදම් ගුණකය\n3. ස්වාධීන වියදම්\n4. ගෘහස්ථ ආදායම",
        ta: "ஒரு எளிய பொருளாதாரத்தில், சேமிப்பு எல்லைப் போக்கு (MPS) குறைவதன் காரணமாக, பின்வரும் கூறுகள் மீதான விளைவு என்னவாக இருக்கும்? (அதிகரிக்கிறதா, குறைகிறதா அல்லது மாற்றமின்றி இருக்கிறதா என்று குறிப்பிடுக)\n1. நுகர்வு எல்லைப் போக்கு (MPC)\n2. செலவுப் பெருக்கி\n3. தன்னாதிக்கச் செலவு\n4. குடும்ப வருமானம்",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "What is the type of deposit that only Licensed commercial banks can accept?",
        si: "බලපත්‍රලාභී වාණිජ බැංකුවලට පමණක් භාරගත හැකි තැන්පතු වර්ගය කුමක්ද?",
        ta: "உரிமம் பெற்ற வணிக வங்கிகள் மட்டுமே ஏற்றுக்கொள்ளக்கூடிய வைப்பு வகை எது?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "The accumulated fund of the Freedom Sports Club as of 01/04/2025 was Rs. 500,000 and total liabilities on that date were Rs. 1,250,000. During the year ended 31/03/2026, a special fund named \"Stadium Modernization Fund\" was established, and donations received for this fund during the year amounted to Rs. 500,000.\nModernization activities of the stadium started on 28/01/2026, and by 31/03/2026, Rs. 500,000 had been spent from the fund for modernization. During the year, the increase in assets was Rs. 1,500,000.\nAs of 31/03/2026, liabilities were Rs. 800,000. Calculate the surplus/deficit earned by the sports club for the year ended 31/03/2026.",
        si: "නිදහස් ක්‍රීඩා සමාජයේ 2025/04/01 දිනට සමුච්චිත අරමුදල රු. 500,000 ක් විය එදිනට පැවති මුළු වගකීම් රු. 1,250,000 කි. 2026/03/31න් අවසන් වසර තුළදී 'ක්‍රීඩාංගණ නවීකරණ අරමුදල' නමින් විශේෂ අරමුදලක් ආරම්භ කරන ලද අතර, වසර තුළ එම අරමුදලට ලද පරිත්‍යාග රු. 500,000 කි.\n2026/01/28 දින ක්‍රීඩාංගණ නවීකරණ කටයුතු ආරම්භ කළ අතර 2026/03/31 වන විට අරමුදලෙන් රු. 500,000 වැය කරමින් නවීකරණ කටයුතු සිදු කර ඇත. වසර තුළදී වත්කම්වල වැඩිවීම රු. 1,500,000 ක් විය.\n2026/03/31 දිනට වගකීම් රු. 800,000 කි. 2026/03/31 න් අවසන් වසර සඳහා ක්‍රීඩා සමාජය උපයන ලද අතිරික්තය / ඌණතාවය ගණනය කරන්න.",
        ta: "சுதந்திர விளையாட்டுச் சங்கத்தின் 01/04/2025 திகதிக்கான திரட்டப்பட்ட நிதி ரூ. 500,000 ஆகவும், அன்றைய தினத்தில் காணப்பட்ட மொத்தப் பொறுப்புக்கள் ரூ. 1,250,000 ஆகவும் இருந்தன. 31/03/2026 உடன் முடிவடைந்த ஆண்டில் 'விளையாட்டரங்கு நவீனமயமாக்கல் நிதி' என்ற பெயரில் ஒரு விசேட நிதி ஆரம்பிக்கப்பட்டதுடன், அவ்வாண்டில் அந்நிதிக்குக் கிடைத்த நன்கொடை ரூ. 500,000 ஆகும்.\n28/01/2026 அன்று விளையாட்டரங்கு நவீனமயமாக்கல் பணிகள் ஆரம்பிக்கப்பட்டதுடன் 31/03/2026 திகதியளவில் அந்நிதியிலிருந்து ரூ. 500,000 செலவிடப்பட்டு நவீனமயமாக்கல் பணிகள் மேற்கொள்ளப்பட்டுள்ளன. அவ்வாண்டில் சொத்துக்களின் அதிகரிப்பு ரூ. 1,500,000 ஆகும்.\n31/03/2026 திகதியில் பொறுப்புக்கள் ரூ. 800,000 ஆகும். 31/03/2026 உடன் முடிவடைந்த ஆண்டிற்கான விளையாட்டுச் சங்கம் ஈட்டிய உபரி / பற்றாக்குறையைக் கணிக்கவும்.",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Hard",
      points: POINTS_BY_DIFFICULTY[2],
      question: {
        en: "The ratio approximately equal to 1.618, frequently found in art, architecture, and nature, is known as:",
        si: "කලාව, ගෘහ නිර්මාණ ශිල්පය සහ ස්වභාවධර්මය තුළ නිතර දක්නට ලැබෙන, දළ වශයෙන් 1.618 ට සමාන අනුපාතය හඳුන්වනු ලබන්නේ:",
        ta: "கலை, கட்டிடக்கலை மற்றும் இயற்கையில் அடிக்கடி காணப்படும், தோராயமாக 1.618 க்கு சமமான விகிதம் எவ்வாறு அழைக்கப்படுகிறது?",
      },
    },
    // Row — Super Hard
    {
      subject: "Economics",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "An economy reports:\n- Real GDP in 2025 = Rs. 5,000 billion\n- Nominal GDP growth rate from 2024 to 2025 = 15%\n- GDP deflator increases by 8% from 2024 to 2025\n(i) Calculate the real GDP growth rate from 2024 to 2025\n(ii) If nominal GDP in 2025 is Rs. 6,000 billion, calculate the nominal GDP in 2024",
        si: "ආර්ථිකයක් වාර්තා කරයි:\n- 2025 මූර්ත GDP = රු. බිලියන 5,000\n- 2024 සිට 2025 දක්වා නාමික GDP වර්ධන අනුපාතය = 15%\n- 2024 සිට 2025 දක්වා GDP අවධමනකය 8% කින් වැඩි වේ\n(i) 2024 සිට 2025 දක්වා මූර්ත GDP වර්ධන අනුපාතය ගණනය කරන්න\n(ii) 2025 වසරේ නාමික GDP රු. බිලියන 6,000 ක් නම්, 2024 වසරේ නාමික GDP ගණනය කරන්න",
        ta: "ஒரு பொருளாதாரம் பின்வருமாறு தெரிவிக்கிறது:\n- 2025 இல் மெய் GDP = ரூ. 5,000 பில்லியன்\n- 2024 முதல் 2025 வரையிலான பெயரளவு GDP வளர்ச்சி விகிதம் = 15%\n- 2024 முதல் 2025 வரை GDP விலைக்குறைப்பி 8% ஆல் அதிகரிக்கிறது\n(i) 2024 முதல் 2025 வரையிலான மெய் GDP வளர்ச்சி விகிதத்தைக் கணக்கிடுக\n(ii) 2025 இல் பெயரளவு GDP ரூ. 6,000 பில்லியன் எனின், 2024 இல் பெயரளவு GDP ஐக் கணக்கிடுக",
      },
    },
    {
      subject: "Business Studies",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "Sathis has obtained life insurance for his wife Amandini. It was revealed that she has had high blood pressure for some time. What are the insurance principles that are relevant to the above case?",
        si: "සතිස් තම බිරිඳ වන අමන්දිනී වෙනුවෙන් ජීවිත රක්ෂණයක් ලබාගෙන ඇත. ඇයට කලක සිට අධික රුධිර පීඩනය තිබූ බව පසුව හෙළි විය. ඉහත අවස්ථාවට අදාළ වන රක්ෂණ මූලධර්ම මොනවාද?",
        ta: "சதீஷ் தனது மனைவி அமந்தினிக்கு ஆயுள் காப்பீடு எடுத்துள்ளார். அவருக்கு சில காலமாக உயர் இரத்த அழுத்தம் இருந்தது பின்னர் தெரியவந்தது. மேற்கண்ட வழக்கிற்கு பொருத்தமான காப்பீட்டுக் கோட்பாடுகள் யாவை?",
      },
    },
    {
      subject: "Accounting",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "The following information is provided for a sports association for the year ended 31/12/2025:\n- As of 01/01/2025, there are 40 members in the association, of which 10 are life members.\n- Life members have paid Rs. 500,000 in cash as 5-year membership fees, which should be recognized as income over a period of 5 years.\n- The monthly membership fee per member is Rs. 500.\n- As of 31/12/2025 and 01/01/2025, the outstanding (arrears) and prepaid (received in advance) membership fees are as follows:\n  - 31/12/2025: Arrears = Rs. 24,000, Received in advance = Rs. 35,000\n  - 01/01/2025: Arrears = Rs. 30,000, Received in advance = Rs. 20,000\n- On 01/07/2025, 10 new members were admitted to the association, and they have paid their membership fees for the period as required.\nWhat is the membership fee income for the year ended 31/12/2025?",
        si: "ක්‍රීඩා සංගමයේ 2025/12/31 දිනෙන් අවසන් වසරට අදාළ පහත තොරතුරු ඔබට සපයා ඇත:\n- 2025/01/01 දිනට සංගමයේ සාමාජිකයන් 40ක් සිටින අතර ඉන් 10 දෙනෙකු යාවජීව සාමාජිකයන් වේ.\n- යාවජීව සාමාජිකයන් විසින් වසර 5ක සාමාජික මුදල් ලෙස රු. 500,000ක් මුදලින් ලබා දී ඇති අතර එය වසර 5 ක් පුරාවට ආදායම් ලෙස හඳුනාගත යුතුය.\n- සාමාජිකයෙකුගේ මාසික සාමාජික ගාස්තුව රු. 500කි.\n- 2025.12.31 දිනට සහ 2025/01/01 දිනට හිඟ සහ කලින් ලද සාමාජික මුදල් පහත පරිදි වේ:\n  - 2025/12/31: හිඟ සාමාජික මුදල් රු. 24,000, කලින් ලද සාමාජික මුදල් රු. 35,000\n  - 2025/01/01: හිඟ සාමාජික මුදල් රු. 30,000, කලින් ලද සාමාජික මුදල් රු. 20,000\n- 2025/07/01 දින නව සාමාජිකයන් 10 දෙනෙකු සංගමයට බඳවා ගත් අතර ඔවුන් විසින් කාලච්ඡේදයට අදාළ සාමාජික මුදල් නියමිත පරිදි ගෙවා ඇත.\n2025/12/31 දිනෙන් අවසන් වසර සඳහා සාමාජික මුදල් ආදායම කොපමණද?",
        ta: "விளையாட்டுச் சங்கம் ஒன்றின் 31/12/2025 உடன் முடிவடைந்த ஆண்டிற்கான பின்வரும் தகவல்கள் உங்களுக்கு வழங்கப்பட்டுள்ளன:\n- 01/01/2025 அன்று சங்கத்தில் 40 உறுப்பினர்கள் இருந்ததுடன், அவர்களில் 10 பேர் ஆயுட்கால உறுப்பினர்கள் ஆவர்.\n- ஆயுட்கால உறுப்பினர்கள் 5 ஆண்டுகளுக்கான உறுப்பினர் கட்டணமாக ரூ. 500,000 பணமாகச் செலுத்தியுள்ளனர், இது 5 ஆண்டுகள் முழுவதும் வருமானமாக அங்கீகரிக்கப்பட வேண்டும்.\n- ஒரு உறுப்பினரின் மாதாந்திர உறுப்பினர் கட்டணம் ரூ. 500 ஆகும்.\n- 31/12/2025 மற்றும் 01/01/2025 திகதிகளில் நிலுவையில் உள்ள மற்றும் முன்கூட்டியே பெறப்பட்ட உறுப்பினர் கட்டணங்கள் பின்வருமாறு:\n  - 31/12/2025: நிலுவை உறுப்பினர் கட்டணம் ரூ. 24,000, முன்கூட்டியே பெறப்பட்ட உறுப்பினர் கட்டணம் ரூ. 35,000\n  - 01/01/2025: நிலுவை உறுப்பினர் கட்டணம் ரூ. 30,000, முன்கூட்டியே பெறப்பட்ட உறுப்பினர் கட்டணம் ரூ. 20,000\n- 01/07/2025 அன்று 10 புதிய உறுப்பினர்கள் சங்கத்தில் சேர்த்துக்கொள்ளப்பட்டதுடன், அவர்களால் அக்காலப்பகுதிக்குரிய உறுப்பினர் கட்டணம் முறையாகச் செலுத்தப்பட்டுள்ளது.\n31/12/2025 உடன் முடிவடைந்த ஆண்டிற்கான உறுப்பினர் கட்டண வருமானம் எவ்வளவு?",
      },
    },
    {
      subject: "General Knowledge",
      difficulty: "Super Hard",
      points: POINTS_BY_DIFFICULTY[3],
      question: {
        en: "The system used to modernize Sri Lanka's Department of Inland Revenue, mentioned in the 2026 Budget Speech is?",
        si: "2026 අයවැය කතාවේ සඳහන් කර ඇති, ශ්‍රී ලංකාවේ දේශීය ආදායම් දෙපාර්තමේන්තුව නවීකරණය කිරීමට භාවිතා කරන පද්ධතිය හඳුන්වනු ලබන්නේ:",
        ta: "2026 வரவுசெலவுத் திட்ட உரையில் குறிப்பிடப்பட்டுள்ள, இலங்கையின் உள்நாட்டு இறைவரித் திணைக்களத்தை நவீனமயமாக்கப் பயன்படுத்தப்படும் முறைமை எவ்வாறு அழைக்கப்படுகிறது?",
      },
    },
  ],
};
export const BS360_GRIDS: QuizGrid[] = [
  DEMO_GRID,
  GRID_1,
  GRID_2,
  GRID_3,
  GRID_4,
  GRID_5,
  GRID_6,
];

export function getGrid(gridId: number): QuizGrid | undefined {
  return BS360_GRIDS.find((g) => g.id === gridId);
}

export const CLASSROOMS = Array.from({ length: 8 }, (_, i) => i + 1);
