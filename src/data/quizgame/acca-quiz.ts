// ── AISCA QuizGame — quiz bank ──
// Live ACCA Guidance quiz. Every question is single-correct multiple-choice.
// The engine is quiz-agnostic, so new quizzes only need to be added to QUIZZES.

export interface QuizQuestion {
  id: string
  title: string
  description?: string
  image?: string
  options: string[]        // 2–6 options
  correctIndex: number     // 0-based
  timeLimit: number        // seconds
  points: number           // max points (speed scoring earns 50%–100% of this)
  explanation?: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}

const q = (
  id: string,
  title: string,
  options: string[],
  correctIndex: number,
  explanation?: string,
  timeLimit = 15,
  points = 1000,
): QuizQuestion => ({ id, title, options, correctIndex, explanation, timeLimit, points })

export const ACCA_QUIZ: Quiz = {
  id: 'acca-guidance',
  title: 'ACCA Guidance Quiz',
  questions: [
    q('q1', 'What does ACCA stand for?',
      ['Association of Chartered Certified Accountants', 'Accredited Council of Corporate Accountants', 'American Certified Chartered Accountants', 'Association of Commercial & Cost Accountants'], 0,
      'ACCA is the Association of Chartered Certified Accountants, a global professional accounting body.'),
    q('q2', 'How many exams are there in the current ACCA Qualification?',
      ['9', '11', '13', '15'], 2,
      'The current ACCA Qualification has 13 exams across three levels.'),
    q('q3', 'Which is the FIRST level of the ACCA exams?',
      ['Skills', 'Knowledge', 'Strategic Professional', 'Certificate'], 1,
      'The levels are Knowledge → Skills → Strategic Professional.'),
    q('q4', 'Knowledge Level includes Business & Technology, Management Accounting and…',
      ['Financial Accounting', 'Taxation', 'Audit & Assurance', 'Corporate Law'], 0,
      'Knowledge Level = Business & Technology (BT), Management Accounting (MA), Financial Accounting (FA).'),
    q('q5', 'How many months of Practical Experience Requirement (PER) are needed to become an ACCA member?',
      ['12 months', '24 months', '36 months', '48 months'], 2,
      'You need 36 months of relevant practical experience to become an ACCA member.'),
    q('q6', 'What is the early-bird discount given by Lockbird for the ACCA Knowledge level?',
      ['LKR 16,500', 'LKR 10,500', 'LKR 5,000', 'No discount given'], 0,
      'Lockbird offers an early-bird discount of LKR 16,500 for the ACCA Knowledge level.'),
    q('q7', 'The two Essentials exams in Strategic Professional are SBL and…',
      ['SBR', 'AFM', 'APM', 'ATX'], 0,
      'Strategic Professional Essentials are Strategic Business Leader (SBL) and Strategic Business Reporting (SBR).'),
    q('q8', 'How many exams must you choose from the exam “options” at the Professional level?',
      ['1', '2', '3', '4'], 1,
      'You choose 2 of the 4 Options exams (AFM, APM, ATX, AAA).'),
    q('q9', 'What does the exam "AAA" stand for?',
      ['Advanced Accounting Analysis', 'Applied Audit & Assurance', 'Advanced Audit and Assurance', 'Annual Assurance Audit'], 2,
      'AAA is Advanced Audit and Assurance.'),
    q('q10', 'Can you start ACCA before getting your A/L results?',
      ['Yes', 'No', 'Only with special permission', 'Only if you did A/L in the commerce stream'], 0,
      'Yes — you can begin ACCA before receiving your A/L results.'),
    q('q11', 'ACCA is a globally recognised body headquartered in the…',
      ['United States', 'United Kingdom', 'Australia', 'Singapore'], 1,
      'ACCA is headquartered in the United Kingdom (Glasgow and London).'),
    q('q12', 'How many exam sessions are held per year for session-based exams?',
      ['2', '3', '4', '6'], 2,
      'Session exams are held four times a year: March, June, September and December.'),
    q('q13', 'What is the pass mark for ACCA exams?',
      ['40%', '45%', '50%', '60%'], 2,
      'The pass mark for ACCA exams is 50%.'),
    q('q14', 'Exam in the Knowledge level are taken in which format?',
      ['On-demand computer-based exams', 'Paper exams only', 'Oral exams', 'Open-book take-home exams'], 0,
      'Knowledge level exams are on-demand computer-based exams (CBEs) you can sit any time.'),
    q('q15', 'How does Lockbird conduct ACCA lectures?',
      ['Online', 'Online + Physical', 'Only Physical', 'Don’t Know'], 1,
      'Lockbird conducts ACCA lectures both online and physically.'),
  ],
}

export const QUIZZES: Record<string, Quiz> = {
  [ACCA_QUIZ.id]: ACCA_QUIZ,
}

export function getQuiz(id: string): Quiz | undefined {
  return QUIZZES[id]
}
