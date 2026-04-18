export interface Question {
  set: number
  number: number
  text: string
  a: string
  b: string
  c: string
}

export const QUESTIONS: Question[] = [
  // ── Set 1: Core Compatibility ───────────────────────────────
  { set: 1, number: 1,  text: 'Do you want children in your future?',                                    a: 'Definitely yes',        b: 'Open to it',               c: 'No' },
  { set: 1, number: 2,  text: 'How important is religion or spirituality in your daily life?',           a: 'Very important',        b: 'Somewhat',                 c: 'Not at all' },
  { set: 1, number: 3,  text: 'How do you feel about your partner having close friendships with exes?',  a: 'Totally fine',          b: 'Depends',                  c: 'Not comfortable' },
  { set: 1, number: 4,  text: 'How politically engaged are you?',                                        a: 'Very engaged',          b: 'Somewhat',                 c: 'Not really' },
  { set: 1, number: 5,  text: 'Do your political views lean conservative, moderate, or progressive?',    a: 'Conservative',          b: 'Moderate',                 c: 'Progressive' },
  { set: 1, number: 6,  text: 'How important is financial stability to you in a partner?',               a: 'Very important',        b: 'Somewhat',                 c: 'Not a priority' },
  { set: 1, number: 7,  text: 'How do you feel about living together before marriage?',                  a: 'Strongly for it',       b: 'Open to it',               c: 'Prefer not to' },
  { set: 1, number: 8,  text: 'How ambitious are you professionally?',                                   a: 'Very ambitious',        b: 'Moderately',               c: 'Lifestyle over career' },
  { set: 1, number: 9,  text: 'Do you want to get married someday?',                                     a: 'Yes',                   b: 'Maybe',                    c: 'No' },
  { set: 1, number: 10, text: 'How do you handle conflict in relationships?',                            a: 'Address it immediately', b: 'Need space first',         c: 'Tend to avoid it' },
  { set: 1, number: 11, text: 'How important is physical affection in a relationship?',                  a: 'Essential',             b: 'Important',                c: 'Not a priority' },
  { set: 1, number: 12, text: "How do you feel about your partner having a very demanding career?",      a: 'Totally supportive',    b: 'It depends',               c: 'Prefer balance' },
  { set: 1, number: 13, text: 'Are you more of a homebody or do you need regular social activity?',     a: 'Total homebody',        b: 'Balance of both',          c: 'Very social' },
  { set: 1, number: 14, text: "How important is it that your partner shares your interests?",            a: 'Very important',        b: 'Nice but not essential',   c: 'Not important' },
  { set: 1, number: 15, text: 'Do you think jealousy is ever healthy in a relationship?',               a: 'Yes, in small doses',   b: 'Rarely',                   c: 'Never' },
  { set: 1, number: 16, text: 'How do you feel about long distance relationships?',                      a: 'Open to it',            b: 'Only short term',          c: 'Not for me' },
  { set: 1, number: 17, text: "How important is it that your partner is physically active?",             a: 'Very important',        b: 'Somewhat',                 c: 'Not important' },
  { set: 1, number: 18, text: 'Do you smoke, or are you comfortable with a partner who does?',          a: 'I smoke',               b: "I don't but it's fine",    c: 'Deal-breaker' },
  { set: 1, number: 19, text: 'How do you feel about recreational drug use?',                           a: 'Fine with it',          b: 'Depends on the drug',      c: 'Not comfortable' },
  { set: 1, number: 20, text: "How important is it that your partner wants to travel?",                  a: 'Essential',             b: 'Nice to have',             c: 'Not important' },
  { set: 1, number: 21, text: 'Do you believe in therapy or personal development work?',                a: 'Actively practice it',  b: 'Open to it',               c: 'Not for me' },
  { set: 1, number: 22, text: 'How do you feel about splitting finances equally?',                       a: 'Always split equally',  b: 'Depends on situation',     c: 'Prefer traditional roles' },
  { set: 1, number: 23, text: 'How important is intellectual conversation to you?',                     a: 'Essential',             b: 'Important',                c: 'Not a priority' },
  { set: 1, number: 24, text: 'Do you prefer to resolve arguments quickly or take space first?',        a: 'Resolve immediately',   b: 'Take space',               c: 'Avoid conflict' },
  { set: 1, number: 25, text: "How honest are you willing to be, even when it's uncomfortable?",        a: 'Radically honest',      b: 'Honest but tactful',       c: 'Keep peace' },

  // ── Set 2: Relationship Style ───────────────────────────────
  { set: 2, number: 1,  text: 'Do you tend toward anxious, secure, or avoidant attachment?',            a: 'Anxious',               b: 'Secure',                   c: 'Avoidant' },
  { set: 2, number: 2,  text: 'How much alone time do you need?',                                        a: 'A lot',                 b: 'Some',                     c: 'Very little' },
  { set: 2, number: 3,  text: 'How do you express love?',                                                a: 'Words and conversation', b: 'Acts and presence',       c: 'Touch and affection' },
  { set: 2, number: 4,  text: 'How do you feel when your partner needs a lot of reassurance?',          a: 'Happy to provide it',   b: 'Depends',                  c: 'Find it draining' },
  { set: 2, number: 5,  text: 'Do you believe people can fundamentally change?',                        a: 'Yes',                   b: 'Sometimes',                c: 'Rarely' },
  { set: 2, number: 6,  text: 'How quickly do you typically fall for someone?',                         a: 'Quickly',               b: 'Gradually',                c: 'Slowly' },
  { set: 2, number: 7,  text: 'Have you stayed in a relationship longer than you should have?',         a: 'Yes',                   b: 'Once',                     c: 'No' },
  { set: 2, number: 8,  text: "How important is it that your partner is your best friend?",              a: 'Essential',             b: 'Important',                c: 'Not necessary' },
  { set: 2, number: 9,  text: 'Do you tend to over or under communicate?',                              a: 'Over-communicate',      b: 'Just right',               c: 'Under-communicate' },
  { set: 2, number: 10, text: 'How do you feel about very independent partners?',                       a: 'Love it',               b: 'Depends',                  c: 'Prefer closeness' },
  { set: 2, number: 11, text: 'How do you handle anger toward someone you love?',                       a: 'Express it directly',   b: 'Take space',               c: 'Go quiet' },
  { set: 2, number: 12, text: 'Do you believe in soulmates?',                                           a: 'Yes',                   b: 'Maybe',                    c: 'No' },
  { set: 2, number: 13, text: 'How do you feel about public displays of affection?',                    a: 'Love them',             b: 'Occasionally',             c: 'Keep it private' },
  { set: 2, number: 14, text: "How much does a partner's past relationship history matter?",             a: 'A lot',                 b: 'Somewhat',                 c: 'Not at all' },
  { set: 2, number: 15, text: 'Do you need your partner to be social with your friends?',               a: 'Very important',        b: 'Sometimes',                c: 'Not necessary' },
  { set: 2, number: 16, text: 'How important is spontaneity vs. routine?',                              a: 'Love spontaneity',      b: 'Balance',                  c: 'Prefer routine' },
  { set: 2, number: 17, text: "Do you tend to prioritize your partner's needs over your own?",           a: 'Often',                 b: 'Sometimes',                c: 'Rarely' },
  { set: 2, number: 18, text: 'How important is emotional availability in a partner?',                  a: 'Essential',             b: 'Very',                     c: 'Somewhat' },
  { set: 2, number: 19, text: 'Do you believe in taking breaks during a relationship?',                 a: 'Yes',                   b: 'Only if needed',           c: 'No' },
  { set: 2, number: 20, text: 'How do you feel about couples who argue frequently?',                    a: 'Normal and healthy',    b: 'Concerning',               c: 'Red flag' },
  { set: 2, number: 21, text: 'How important is independence within a relationship?',                   a: 'Very',                  b: 'Somewhat',                 c: 'Prefer togetherness' },
  { set: 2, number: 22, text: 'Do you tend to idealize partners early on?',                             a: 'Yes',                   b: 'Sometimes',                c: 'No' },
  { set: 2, number: 23, text: 'How do you feel about partners who are very close to their family?',     a: 'Love it',               b: 'Depends',                  c: 'Can be too much' },
  { set: 2, number: 24, text: "How important is it that your partner supports your personal goals?",     a: 'Essential',             b: 'Important',                c: 'Nice but not critical' },
  { set: 2, number: 25, text: 'Is love a feeling, a choice, or both?',                                  a: 'A feeling',             b: 'A choice',                 c: 'Both equally' },

  // ── Set 3: Life & Ambitions ─────────────────────────────────
  { set: 3, number: 1,  text: 'Where do you see yourself living in 5 years?',                           a: 'Same city',             b: 'Different city',           c: 'Different country' },
  { set: 3, number: 2,  text: 'How important is career success to your identity?',                      a: 'Central',               b: 'Important',                c: 'Just a means to an end' },
  { set: 3, number: 3,  text: 'How do you relate to money?',                                            a: 'Save aggressively',     b: 'Balance saving and spending', c: 'Live for today' },
  { set: 3, number: 4,  text: 'Do you own or aspire to own property?',                                  a: 'Already do',            b: 'Aspire to',                c: 'Not a priority' },
  { set: 3, number: 5,  text: 'How important is it that your partner earns similarly?',                 a: 'Very',                  b: 'Somewhat',                 c: 'Not at all' },
  { set: 3, number: 6,  text: 'Where do you want to live long term?',                                   a: 'City',                  b: 'Suburb',                   c: 'Rural' },
  { set: 3, number: 7,  text: 'How important is a close-knit community or friend group?',              a: 'Essential',             b: 'Important',                c: "I'm independent" },
  { set: 3, number: 8,  text: 'Do you have significant debt?',                                          a: 'Yes and it concerns me', b: 'Yes but manageable',      c: 'No' },
  { set: 3, number: 9,  text: 'How important is work-life balance?',                                    a: 'Non-negotiable',        b: 'Very',                     c: "I'm a workaholic" },
  { set: 3, number: 10, text: 'Do you have a clear life vision?',                                       a: 'Very clear',            b: 'Somewhat',                 c: "Still figuring it out" },
  { set: 3, number: 11, text: 'How important is higher education in a partner?',                        a: 'Very',                  b: 'Somewhat',                 c: 'Not at all' },
  { set: 3, number: 12, text: 'Do you want pets?',                                                      a: 'Have them and love them', b: 'Open to it',             c: 'Not for me' },
  { set: 3, number: 13, text: 'How important is giving back — volunteering, charity?',                  a: 'Central to my life',    b: 'Important',                c: 'Not a focus' },
  { set: 3, number: 14, text: 'Do you prioritize experiences or possessions?',                          a: 'Experiences always',    b: 'Balance',                  c: 'Love nice things' },
  { set: 3, number: 15, text: 'How do you feel about a partner who travels extensively for work?',      a: 'Fine with it',          b: 'Depends',                  c: 'Difficult' },
  { set: 3, number: 16, text: 'How important is cultural engagement — music, film, theater?',           a: 'Essential',             b: 'Important',                c: 'Not really my thing' },
  { set: 3, number: 17, text: 'Do you have family obligations that affect your life significantly?',    a: 'Yes',                   b: 'Somewhat',                 c: 'No' },
  { set: 3, number: 18, text: 'How do you feel about very different spending habits in a partner?',     a: 'Dealbreaker',           b: 'Can work through it',      c: 'Fine' },
  { set: 3, number: 19, text: 'How important is having a retirement plan?',                             a: 'Very',                  b: 'Somewhat',                 c: 'Living in the present' },
  { set: 3, number: 20, text: 'Do you want to stay near where you grew up?',                            a: 'Yes',                   b: 'Maybe',                    c: 'No, I want to explore' },
  { set: 3, number: 21, text: 'How entrepreneurial are you?',                                           a: 'Very, I love risk',     b: 'Moderate',                 c: 'I prefer stability' },
  { set: 3, number: 22, text: 'How important is social status or reputation to you?',                   a: 'Very',                  b: 'Somewhat',                 c: 'Not at all' },
  { set: 3, number: 23, text: 'Do you feel your best years are ahead of you?',                          a: 'Definitely',            b: 'Yes but living well now',  c: "I'm in them now" },
  { set: 3, number: 24, text: 'How important is lifestyle compatibility with a partner?',               a: 'Essential',             b: 'Very',                     c: 'Somewhat' },
  { set: 3, number: 25, text: 'What does a good life look like to you?',                                a: 'Adventure and freedom', b: 'Balance and connection',   c: 'Stability and depth' },

  // ── Set 4: Personality & Depth ──────────────────────────────
  { set: 4, number: 1,  text: 'Are you more of a thinker or a feeler?',                                 a: 'Thinker',               b: 'Both',                     c: 'Feeler' },
  { set: 4, number: 2,  text: 'How do you respond to criticism?',                                       a: 'Welcome it',            b: 'Depends on delivery',      c: 'Find it difficult' },
  { set: 4, number: 3,  text: 'Are you drawn to people who challenge or comfort you?',                  a: 'Challenge',             b: 'Both',                     c: 'Comfort' },
  { set: 4, number: 4,  text: 'How important is humor in a relationship?',                              a: 'Essential',             b: 'Very',                     c: 'Nice but not critical' },
  { set: 4, number: 5,  text: 'Do you tend to see the best or worst in people?',                        a: 'Best',                  b: 'Realistic mix',            c: 'Guard up first' },
  { set: 4, number: 6,  text: 'How curious are you about ideas outside your expertise?',                a: 'Very curious',          b: 'Somewhat',                 c: 'Prefer my lane' },
  { set: 4, number: 7,  text: 'Deep conversation one-on-one or lively group discussion?',               a: 'One-on-one',            b: 'Both',                     c: 'Group energy' },
  { set: 4, number: 8,  text: 'How do you feel about silence with someone you\'re dating?',             a: 'Love it',               b: 'Comfortable',              c: 'Need to fill it' },
  { set: 4, number: 9,  text: 'Are you energized by novelty or depth and mastery?',                     a: 'Novelty',               b: 'Both',                     c: 'Depth and mastery' },
  { set: 4, number: 10, text: 'How do you feel about more introverted partners?',                       a: 'Love it',               b: 'Fine',                     c: 'Prefer extroverts' },
  { set: 4, number: 11, text: 'Do you make decisions with your head or your heart?',                    a: 'Head',                  b: 'Both',                     c: 'Heart' },
  { set: 4, number: 12, text: 'How important is creativity or artistic expression to you?',             a: 'Central',               b: 'Important',                c: 'Not really' },
  { set: 4, number: 13, text: 'Do you consider yourself self-aware?',                                   a: 'Very',                  b: 'Somewhat',                 c: 'Working on it' },
  { set: 4, number: 14, text: 'How do you feel about a partner who is more successful than you?',       a: 'Inspiring',             b: 'Fine',                     c: 'Complicated' },
  { set: 4, number: 15, text: 'Are you comfortable with vulnerability early in a relationship?',        a: 'Very',                  b: 'Gradually',                c: 'Takes time' },
  { set: 4, number: 16, text: 'How important is shared taste — music, film, books?',                    a: 'Very',                  b: 'Somewhat',                 c: 'Not at all' },
  { set: 4, number: 17, text: 'Do you tend toward optimism or realism?',                                a: 'Optimist',              b: 'Realistic optimist',       c: 'Realist' },
  { set: 4, number: 18, text: 'How do you feel about a partner from a very different cultural background?', a: 'Exciting',          b: 'Open',                     c: 'Prefer similarity' },
  { set: 4, number: 19, text: 'Are you motivated more by fear of failure or desire for success?',       a: 'Fear of failure',       b: 'Both equally',             c: 'Desire for success' },
  { set: 4, number: 20, text: 'How important is physical attraction vs emotional connection early on?',  a: 'Physical first',        b: 'Both together',            c: 'Emotional first' },
  { set: 4, number: 21, text: 'Do you believe in love at first sight?',                                 a: 'Yes',                   b: 'Maybe',                    c: 'No' },
  { set: 4, number: 22, text: 'How do you feel about a significantly older or younger partner?',        a: 'Fine either way',       b: 'Depends on gap',           c: 'Prefer similar age' },
  { set: 4, number: 23, text: 'Do you need to be understood or to understand?',                         a: 'To be understood',      b: 'Both',                     c: 'To understand' },
  { set: 4, number: 24, text: 'How important is it that your partner has strong opinions?',             a: 'Very',                  b: 'Somewhat',                 c: 'Prefer easygoing' },
  { set: 4, number: 25, text: "What's the one thing you need in a relationship you've never fully had?", a: 'True acceptance',       b: 'Stability',                c: 'Genuine understanding' },
]

export const SET_LABELS: Record<number, string> = {
  1: 'Core Compatibility',
  2: 'Relationship Style',
  3: 'Life & Ambitions',
  4: 'Personality & Depth',
}

export function getSetQuestions(setNumber: number): Question[] {
  return QUESTIONS.filter(q => q.set === setNumber)
}

export function getQuestion(setNumber: number, questionNumber: number): Question | undefined {
  return QUESTIONS.find(q => q.set === setNumber && q.number === questionNumber)
}
