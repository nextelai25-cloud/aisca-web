/**
 * BS360 Quiz Grid — question bank.
 *
 * Each grid = 16 boxes arranged as a 4x4 board:
 *   rows    = difficulty (Easy, Medium, Hard, Super Hard)
 *   columns = subject    (Economics, Business Studies, Accounting, General Knowledge)
 *
 * box_index = difficultyIndex * 4 + subjectIndex   (0-15, row-major)
 * This index is the same number stored in Supabase (bs360_reveals.box_index),
 * so it MUST stay in this order for every grid.
 *
 * To add Grid 02-06: copy the GRID_1 block below, replace the questions,
 * and set `available: true` + swap it into BS360_GRIDS in the matching slot.
 * Every classroom automatically gets the new grid — no other changes needed.
 */

export type QuizLang = 'en' | 'si' | 'ta';

export const SUBJECTS = [
  'Economics',
  'Business Studies',
  'Accounting',
  'General Knowledge',
] as const;

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Super Hard'] as const;

export const POINTS_BY_DIFFICULTY = [100, 200, 300, 400] as const;

export type Subject = (typeof SUBJECTS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface QuizBox {
  subject: Subject;
  difficulty: Difficulty;
  points: number;
  question: Record<QuizLang, string>;
  /** true = no question written yet for this box; shown as "coming soon" and not clickable */
  pending?: boolean;
}

export interface QuizGrid {
  id: number;
  label: string;
  /** false = this whole grid hasn't been uploaded yet */
  available: boolean;
  boxes: QuizBox[]; // always length 16, ordered per the comment above
}

function q(
  subject: Subject,
  difficulty: Difficulty,
  en: string,
  si: string,
  ta: string
): QuizBox {
  const points = POINTS_BY_DIFFICULTY[DIFFICULTIES.indexOf(difficulty)];
  return { subject, difficulty, points, question: { en, si, ta } };
}

function pendingBox(subject: Subject, difficulty: Difficulty): QuizBox {
  const points = POINTS_BY_DIFFICULTY[DIFFICULTIES.indexOf(difficulty)];
  return {
    subject,
    difficulty,
    points,
    pending: true,
    question: {
      en: 'This question has not been added yet.',
      si: 'මෙම ප්‍රශ්නය තවම එකතු කර නොමැත.',
      ta: 'இந்தக் கேள்வி இன்னும் சேர்க்கப்படவில்லை.',
    },
  };
}

function pendingGrid(id: number): QuizGrid {
  return {
    id,
    label: `Grid 0${id}`,
    available: false,
    boxes: DIFFICULTIES.flatMap((d) => SUBJECTS.map((s) => pendingBox(s, d))),
  };
}

// ────────────────────────────────────────────────────────────
// GRID 1 — reconstructed from "Set 1.pdf" (Question Set 1)
// ────────────────────────────────────────────────────────────
const GRID_1: QuizGrid = {
  id: 1,
  label: 'Grid 01',
  available: true,
  boxes: [
    // Row 1 — Easy
    q(
      'Economics',
      'Easy',
      'If a firm wants to increase its revenue and the price elasticity of demand for its product is equal to -1.5, what should it do — increase or decrease the price?',
      'ආයතනයකට තම ආදායම වැඩි කර ගැනීමට අවශ්‍ය නම් සහ එහි නිෂ්පාදනය සඳහා වන ඉල්ලුම් මිල නම්‍යතාවය -1.5 ට සමාන නම්, එය කළ යුත්තේ කුමක්ද - මිල වැඩි කිරීමද නැත්නම් අඩු කිරීමද?',
      'ஒரு நிறுவனம் தனது வருவாயை அதிகரிக்க விரும்புகிறது மற்றும் அதன் தயாரிப்புக்கான தேவையின் விலை நெகிழ்ச்சி -1.5 க்கு சமமாக இருந்தால், அது என்ன செய்ய வேண்டும் - விலையை அதிகரிக்க வேண்டுமா அல்லது குறைக்க வேண்டுமா?'
    ),
    q(
      'Business Studies',
      'Easy',
      'Which of the following is not a characteristic of a business objective?',
      'පහත සඳහන් දෑ අතරින් ව්‍යාපාරික අරමුණකට ලක්ෂණයක් නොවන්නේ කුමක්ද?',
      'பின்வருவனவற்றில் எது வணிக நோக்கத்தின் சிறப்பியல்பு அல்ல?'
    ),
    pendingBox('Accounting', 'Easy'),
    q(
      'General Knowledge',
      'Easy',
      'The "double-entry bookkeeping" system, fundamental to modern accounting, was first formally documented in a 1494 treatise by which figure, often called the "Father of Accounting"?',
      'නවීන ගිණුම්කරණයට මූලික වන "ද්විත්ව සටහන් පොත් තැබීමේ" ක්‍රමය, 1494 නිබන්ධනයක මුලින්ම නිල වශයෙන් ලේඛනගත කරන ලද, බොහෝ විට "ගිණුම්කරණයේ පියා" ලෙස හැඳින්වෙන පුද්ගලයා කවුද?',
      'நவீன கணக்கியலுக்கு அடிப்படையான "இரட்டைப் பதிவு கணக்குவைப்பு" முறை, 1494 ஆம் ஆண்டு ஆய்வுக் கட்டுரையில் முதன்முதலில் முறையாக ஆவணப்படுத்திய, பெரும்பாலும் "கணக்கியலின் தந்தை" என்று அழைக்கப்படும் நபர் யார்?'
    ),

    // Row 2 — Medium
    q(
      'Economics',
      'Medium',
      'You are given the following macroeconomic data for a hypothetical economy: Savings (S) = Rs. 800 billion; Budget deficit (BD) = Rs. 200 billion; Net exports (NX) = Rs. -50 billion. According to this information, what must be the level of investment (I) for this economy?',
      'උපකල්පිත ආර්ථිකයක් සඳහා පහත සඳහන් සාර්ව ආර්ථික දත්ත ලබා දී ඇත: ඉතිරිකිරීම් (S) = රු. බිලියන 800; අයවැය හිඟය (BD) = රු. බිලියන 200; ශුද්ධ අපනයන (NX) = රු. -බිලියන 50. මෙම තොරතුරු වලට අනුව, මෙම ආර්ථිකයේ ආයෝජන මට්ටම (I) විය යුත්තේ කුමක්ද?',
      'ஒரு கற்பனையான பொருளாதாரத்திற்கான பின்வரும் மேக்ரோ பொருளாதார தரவுகள் உங்களுக்கு வழங்கப்பட்டுள்ளன: சேமிப்பு (S) = ரூ. 800 பில்லியன்; வரவுசெலவுத்திட்டப் பற்றாக்குறை (BD) = ரூ. 200 பில்லியன்; நிகர ஏற்றுமதி (NX) = ரூ. -50 பில்லியன். இத்தகவல்களின்படி, இப்பொருளாதாரத்திற்கான முதலீட்டு மட்டம் (I) என்னவாக இருக்க வேண்டும்?'
    ),
    q(
      'Business Studies',
      'Medium',
      'Which of the following is the most appropriate measure that the government can take to exert a direct influence on businesses in order to protect the public from business malpractices?',
      'ජනතාව ව්‍යාපාරික අක්‍රමිකතාවලින් ආරක්ෂා කිරීම සඳහා ව්‍යාපාර මත සෘජු බලපෑමක් ඇති කිරීමට රජයට ගත හැකි වඩාත් සුදුසු පියවර පහත සඳහන් කවරේද?',
      'அரசாங்கம் பாதுகாப்பதற்காக வணிகங்கள் மீது நேரடித்தாக்கத்தை ஏற்படுத்த எடுக்கக்கூடிய மிகவும் பொருத்தமான நடவடிக்கை எது?'
    ),
    pendingBox('Accounting', 'Medium'),
    q(
      'General Knowledge',
      'Medium',
      "What is the primary reform condition attached to the IMF's approval of Sri Lanka's combined Fifth and Sixth EFF reviews in 2026?",
      '2026 වසරේ ශ්‍රී ලංකාවේ ඒකාබද්ධ පස්වන සහ හයවන EFF සමාලෝචන සඳහා IMF අනුමැතියට අමුණා ඇති ප්‍රධාන ප්‍රතිසංස්කරණ කොන්දේසිය කුමක්ද?',
      '2026 ஆம் ஆண்டில் இலங்கையின் ஒருங்கிணைந்த ஐந்தாவது மற்றும் ஆறாவது EFF மதிப்பாய்வுகளுக்கான IMF இன் ஒப்புதலுடன் இணைக்கப்பட்டுள்ள முதன்மை சீர்திருத்த நிபந்தனை எது?'
    ),

    // Row 3 — Hard
    q(
      'Economics',
      'Hard',
      'Assume that the government imposes a price ceiling of Rs. 200 per kilogram of rice to protect consumers. Calculate the consumer surplus before the price ceiling is imposed using the following demand and supply schedules: At Price Rs. 50: Qd = 700, Qs = -50. At Price Rs. 100: Qd = 600, Qs = 0.',
      'පාරිභෝගිකයින් ආරක්ෂා කිරීම සඳහා රජය සහල් කිලෝග්‍රෑමයකට රු. 200 ක උපරිම මිලක් පනවන බව උපකල්පනය කරන්න. උපරිම මිල පැනවීමට පෙර පාරිභෝගික අතිරික්තය පහත ඉල්ලුම් සහ සැපයුම් දත්ත ඇසුරින් ගණනය කරන්න: මිල රු. 50 දී: Qd = 700, Qs = -50. මිල රු. 100 දී: Qd = 600, Qs = 0.',
      'நுகர்வோரைப் பாதுகாப்பதற்காக அரசாங்கம் அரிசி ஒரு கிலோவிற்கு ரூ. 200 உச்ச விலை வரம்பை விதிக்கிறது என்று வைத்துக்கொள்வோம். உச்ச விலை விதிக்கப்படுவதற்கு முன்னரான நுகர்வோர் உபரியை பின்வரும் தேவை மற்றும் வழங்கல் விபரங்களின்படி கணக்கிடுக: விலை ரூ. 50 இல்: Qd = 700, Qs = -50. விலை ரூ. 100 இல்: Qd = 600, Qs = 0.'
    ),
    q(
      'Business Studies',
      'Hard',
      'What is indicated by the ISO 27001 standard achieved by a business?',
      'ව්‍යාපාරයක් විසින් ලබාගත් ISO 27001 ප්‍රමිතියෙන් පෙන්නුම් කරන්නේ කුමක්ද?',
      'ஒரு வணிகத்தால் பெறப்பட்ட ISO 27001 தரநிலை எதைக் குறிக்கிறது?'
    ),
    q(
      'Accounting',
      'Hard',
      'According to LKAS 08 (Accounting Policies, Changes in Accounting Estimates and Errors) standard, which of the following statements regarding the selection and application of accounting policies is true? A. It is necessary for a business to apply selected accounting policies consistently. B. An accounting policy can be changed only if the change is required by an accounting standard or results in the financial statements providing reliable and more relevant information about the financial position, financial performance, and cash flows of the business. C. Disclosure of accounting policies used by a business is not mandatory. D. In the absence of an accounting standard that specifically applies to a transaction, the management of the entity must use its judgment in developing and applying an accounting policy.',
      'LKAS 08 (ගිණුම්කරණ ප්‍රතිපත්ති, ඇස්තමේන්තු හා වැරදි) ප්‍රමිතියට අනුව ගිණුම්කරණ ප්‍රතිපත්ති තෝරාගැනීම හා භාවිතය පිළිබඳ පහත කුමන ප්‍රකාශ සත්‍ය වේද? A. ව්‍යවහාරිකව ව්‍යාපාරයක් විසින් තෝරාගත් ගිණුම්කරණ ප්‍රතිපත්ති ඒකාකාරීව භාවිතා කිරීම අවශ්‍ය වේ. B. ගිණුම්කරණ ප්‍රතිපත්තියක් වෙනස් කළ හැක්කේ ගිණුම්කරණ ප්‍රමිතියක අවශ්‍යතාවයක් මත හෝ ව්‍යාපාරයේ මූල්‍ය තත්ත්වය, මූල්‍ය කාර්යසාධනය හා මුදල් ප්‍රවාහයන් පිළිබඳ විශ්වසනීය හා වඩාත් අදාළ තොරතුරු ලබාදීමට හැකි අවස්ථාවලදීය. C. ව්‍යාපාරයක් විසින් භාවිත කළ ගිණුම්කරණ ප්‍රතිපත්ති හෙළිදරව් කිරීම අනිවාර්ය නොවේ. D. ගනුදෙනුවකට අදාළ ගිණුම්කරණ ප්‍රමිතියක් නොමැති අවස්ථාවක ආයතනයේ කළමනාකාරීත්වය විසින් ඔවුන්ගේ විනිශ්චය භාවිතා කර ගිණුම්කරණ ප්‍රතිපත්ති තෝරාගත යුතුය.',
      'LKAS 08 (கணக்கியல் கொள்கைகள், கணக்கியல் மதிப்பீடுகளில் மாற்றங்கள் மற்றும் தவறுகள்) தரநிலையின்படி, கணக்கியல் கொள்கைகளைத் தேர்ந்தெடுப்பது மற்றும் பயன்படுத்துவது தொடர்பான பின்வரும் கூற்றுகளில் எது உண்மையானது? A. ஒரு வணிகம் தேர்ந்தெடுத்த கணக்கியல் கொள்கைகளை சீராகப் பயன்படுத்துவது அவசியமாகும். B. ஒரு கணக்கியல் கொள்கையை கணக்கியல் தரநிலையின் தேவையின் பேரில் அல்லது வணிகத்தின் நிதி நிலைமை, நிதிச் செயல்பாடு மற்றும் பணப்பாய்வு பற்றிய நம்பகமான மற்றும் மிகவும் பொருத்தமான தகவல்களை வழங்கக்கூடிய சந்தர்ப்பங்களில் மட்டுமே மாற்ற முடியும். C. ஒரு வணிகத்தால் பயன்படுத்தப்படும் கணக்கியல் கொள்கைகளை அனைத்தும் வெளிப்படுத்துவது கட்டாயமில்லை. D. ஒரு பரிவர்த்தனைக்கு பொருத்தமான கணக்கியல் தரநிலை இல்லாத சந்தர்ப்பத்தில், நிறுவனத்தின் நிர்வாகம் தனது தீர்ப்பைப் பயன்படுத்தி கணக்கியல் கொள்கைகளைத் தேர்ந்தெடுக்க வேண்டும்.'
    ),
    q(
      'General Knowledge',
      'Hard',
      'Which country is home to the largest number of active volcanoes in the world?',
      'ලෝකයේ වැඩිම සක්‍රීය ගිනි කඳු සංඛ්‍යාවක් ඇති රට කුමක්ද?',
      'உலகின் அதிக எண்ணிக்கையிலான செயலில் உள்ள எரிமலைகளைக் கொண்ட நாடு எது?'
    ),

    // Row 4 — Super Hard
    q(
      'Economics',
      'Super Hard',
      'Assume a hypothetical economy consisting of three industries: 1. Industry A produces its final output by using imported intermediate inputs worth Rs. 50 million and sells its output worth Rs. 200 million to Industry B. 2. Industry B does not use any imported inputs and sells intermediate goods worth Rs. 300 million to Industry C. 3. Industry C sells goods worth Rs. 40 million to a foreign country and sells its final output worth Rs. 600 million to final consumers. What is the Gross Domestic Product (GDP) of this economy?',
      'කර්මාන්ත තුනකින් සමන්විත උපකල්පිත ආර්ථිකයක් සලකන්න: 1. A කර්මාන්තය රුපියල් මිලියන 50ක් වටිනා ආනයනික අන්තර මාධ්‍ය මෙයදුවම් භාවිතා කර තම අවසන් නිමැවුම නිෂ්පාදනය කරන අතර එහි රුපියල් මිලියන 200ක් වටිනා නිමැවුම B කර්මාන්තයට අලෙවි කරයි. 2. B කර්මාන්තය කිසිදු ආනයනික මෙයදුවමක් භාවිතා නොකරන අතර රුපියල් මිලියන 300ක් වටිනා අන්තර මාධ්‍ය භාණ්ඩ C කර්මාන්තයට අලෙවි කරයි. 3. C කර්මාන්තය රුපියල් මිලියන 40ක් වටිනා භාණ්ඩ විදේශ රටකට අලෙවි කරන අතර රුපියල් මිලියන 600ක් වටිනා අවසන් නිමැවුම අවසන් පාරිභෝගිකයින්ට අලෙවි කරයි. මෙම ආර්ථිකයේ දළ දේශීය නිෂ්පාදිතය (GDP) කොපමණද?',
      'மூன்று தொழில்துறைகளைக் கொண்ட ஒரு கற்பனையான பொருளாதாரத்தைக் கருதுக: 1. தொழில்துறை A ரூ. 50 மில்லியன் மதிப்புள்ள இறக்குமதி செய்யப்பட்ட இடைநிலை உள்ளீடுகளைப் பயன்படுத்தி தனது இறுதி வெளியீட்டை உற்பத்தி செய்து, ரூ. 200 மில்லியன் மதிப்புள்ள தனது வெளியீட்டை தொழில்துறை B க்கு விற்கிறது. 2. தொழில்துறை B எந்தவொரு இறக்குமதி செய்யப்பட்ட உள்ளீடுகளையும் பயன்படுத்தாமல், ரூ. 300 மில்லியன் மதிப்புள்ள இடைநிலை பண்டங்களை தொழில்துறை C க்கு விற்கிறது. 3. தொழில்துறை C ரூ. 40 மில்லியன் மதிப்புள்ள பொருட்களை வெளிநாட்டிற்கு விற்கிறது மற்றும் ரூ. 600 மில்லியன் மதிப்புள்ள தனது இறுதி வெளியீட்டை இறுதி நுகர்வோருக்கு விற்கிறது. இப்பொருளாதாரத்தின் மொத்த உள்நாட்டு உற்பத்தி (GDP) எவ்வளவு?'
    ),
    q(
      'Business Studies',
      'Super Hard',
      "Isira and Vishmi conduct a partnership business. They don't have a partnership deed. Select the correct statement regarding this business.",
      'ඉසිර සහ විශ්මි හවුල් ව්‍යාපාරයක් පවත්වාගෙන යයි, ඔවුන්ට හවුල් ගිවිසුමක් නොමැත. මෙම ව්‍යාපාරය පිළිබඳ නිවැරදි ප්‍රකාශය තෝරන්න.',
      'இசிற மற்றும் விஷ்மி ஒரு கூட்டு வணிகத்தை நடத்துகிறார்கள், அவர்களிடம் கூட்டு ஒப்பந்த பத்திரம் இல்லை. இந்த வணிகம் தொடர்பான சரியான கூற்றைத் தேர்ந்தெடுக்கவும்.'
    ),
    q(
      'Accounting',
      'Super Hard',
      'A certain business prepared its income statement for the year ended 31/03/20xx during an inflationary period. The gross profit fell unexpectedly, and the net profit of the business was also significantly reduced. Since it was necessary to issue financial statements to investors for decision-making, the accountant, under the influence of senior management, recalculates the cost of sales using another inventory valuation method and prepares the income statement again (assuming all other factors remain constant). The recalculated gross profit was higher than the previously calculated gross profit. State the inventory valuation methods used previously and subsequently.',
      'එක්තරා ව්‍යාපාරයක් උද්ධමනකාරී අවස්ථාවක 20xx/03/31 අවසන් වසර සඳහා ආදායම් ප්‍රකාශය සකස් කරන ලදී. දළ ලාභයේ සිදුවූ අනපේක්ෂිත පහළ යාම හේතුවෙන් ව්‍යාපාරයේ ශුද්ධ ලාභය ද විශාල වශයෙන් අඩු විය. ඉහත මූල්‍යප්‍රකාශන ආයෝජකයන්ට තීරණ ගැනීම සඳහා නිකුත් කළ යුතු බැවින් ඉහළ කළමනාකාරිත්වයේ බලපෑම මත ගණකාධිකාරීවරයා වෙනත් තොග තක්සේරුක්‍රමයක් භාවිතයෙන් වෙළඳ තොගයේ ිරිවැය නැවත ගණනය කර නැවතත් ආදායම්ප්‍රකාශය සකස් කරන ලදී (අනෙකුත් සාධක ස්ථාවර බව සලකන්න). එවිට ගණනය කළ දළ ලාභය පෙර ගණනය කළ දළ ලාභයට වඩා ඉහල අගයක් ගන්නා ලදී. පෙරදී භාවිතා කරන ලද තොග තක්සේරු ක්‍රමය හා පසුව භාවිතා කරන ලද තොග තක්සේරුක්‍රමය පිළිවෙලින් සඳහන් කරන්න.',
      'ஒரு குறிப்பிட்ட வணிகம் பணவீக்கக் காலத்தில் 31/03/20xx உடன் முடிவடைந்த ஆண்டிற்கான வருமானக் கூற்றைத் தயாரித்தது. மொத்த இலாபம் எதிர்பாராத விதமாக வீழ்ச்சியடைந்ததுடன் வணிகத்தின் நிகர இலாபமும் கணிசமாகக் குறைந்தது. முடிவெடுப்பதற்காக முதலீட்டாளர்களுக்கு நிதி அறிக்கைகளை வெளியிட வேண்டியிருந்ததால், கணக்காளர், மூத்த நிர்வாகத்தின் செல்வாக்கின் கீழ், மற்றொரு இருப்பு மதிப்பீட்டு முறையைப் பயன்படுத்தி விற்பனைக் கிரயத்தை மறுமதிப்பீடு செய்து வருமானக் கூற்றை மீண்டும் தயாரித்தார் (மற்ற அனைத்து காரணிகளும் மாறாமல் இருப்பதாகக் கருதி). மறுமதிப்பீடு செய்யப்பட்ட மொத்த இலாபம் முன்னர் கணக்கிடப்பட்ட மொத்த இலாபத்தை விட அதிகமாக இருந்தது. முன்னர் மற்றும் பின்னர் பயன்படுத்தப்பட்ட இருப்பு மதிப்பீட்டு முறைகளை முறையே குறிப்பிடுக.'
    ),
    q(
      'General Knowledge',
      'Super Hard',
      "The world's oldest surviving central bank, founded in 1668, and predating the Bank of England by 26 years, is:",
      '1668 දී ස්ථාපිත වන ලද සහ එංගලන්ත බැංකුවට වඩා වසර 26ක් පැරණි, ලෝකයේ පැරණිතම තවමත් පවතින මධ්‍යම බැංකුව වන්නේ:',
      '1668 இல் நிறுவப்பட்டு இங்கிலாந்து வங்கிக்கு 26 ஆண்டுகள் முந்திய, உலகின் மிக பழமையான மத்திய வங்கி எது?'
    ),
  ],
};

export const BS360_GRIDS: QuizGrid[] = [
  GRID_1,
  pendingGrid(2),
  pendingGrid(3),
  pendingGrid(4),
  pendingGrid(5),
  pendingGrid(6),
];

export function getGrid(gridId: number): QuizGrid | undefined {
  return BS360_GRIDS.find((g) => g.id === gridId);
}

export const CLASSROOMS = Array.from({ length: 8 }, (_, i) => i + 1);
