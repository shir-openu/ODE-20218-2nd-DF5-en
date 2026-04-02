// api/ai-hint.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_ATTEMPTS = 10;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://shir-openu.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput, problemData, conversationHistory, exerciseMode } = req.body;

  // בדיקת מכסת ניסיונות
  if (conversationHistory.length >= MAX_ATTEMPTS) {
    const solutionText = exerciseMode === 1
      ? `הסתיימה מכסת ${MAX_ATTEMPTS} ניסיונות... זהו תרגיל אימון ולהלן שלד הפתרון

המשוואה ההומוגנית: y'' - 4y' + 4y = 0 עם r² - 4r + 4 = 0

פירוק: (r - 2)² = 0

שורש כפול: r = 2

הפתרון ההומוגני: y_h = C₁e^(2x) + C₂xe^(2x)

לפתרון פרטי בוריאציית פרמטרים: y₁ = e^(2x), y₂ = xe^(2x)

פישוט g(x): g(x) = (e^x/x)² = e^(2x)/x²

הורונסקיאן: W(y₁, y₂) = e^(4x)

חישוב האינטגרלים לפי שיטת וריאציית פרמטרים:
u₁' = -g(x)y₂/W = -(e^(2x)/x²)(xe^(2x))/e^(4x) = -1/x
u₂' = g(x)y₁/W = (e^(2x)/x²)(e^(2x))/e^(4x) = 1/x²

אינטגרציה: u₁ = -ln|x|, u₂ = -1/x


הפתרון הכללי: y = C₁e^(2x) + C₂xe^(2x) - e^(2x)ln|x|`
      : `הסתיימה מכסת ${MAX_ATTEMPTS} ניסיונות... ניתן להמשיך בעוד 24 שעות`;
    return res.status(200).json({ hint: solutionText });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // בניית ההיסטוריה
    let conversationText = '';
    conversationHistory.forEach(turn => {
      conversationText += `תשובת סטודנט: ${turn.user}\nתגובת מורה: ${turn.ai}\n\n`;
    });

const prompt = `
# OVERRIDE INSTRUCTION - HIGHEST PRIORITY

IF YOU ARE STUCK OR CONTRADICTING YOURSELF:
1. Be yourself (Gemini) - use your own intelligence and creativity
2. BUT: NEVER give the final complete answer for y_h or y_p
3. NEVER repeat the same response twice - check history and vary your approach

# SPECIFIC FOR VARIATION OF PARAMETERS:
If you already said "use variation of parameters", DO NOT repeat this.
Instead, give ONE of these progressive hints:
1. Show the formulas: u₁' = -g(x)y₂(x)/W, u₂' = g(x)y₁(x)/W
2. Ask to calculate W(e^(2x), xe^(2x))
3. Show what g(x) is for this problem: g(x) = (e^x/x)² = e^(2x)/x²
4. Show the integral setup (without solving)

---

${conversationText ? `# CONVERSATION HISTORY:\n${conversationText}\n---\n\n` : ''}

# תשובת הסטודנט כעת: ${userInput}

---

# Digital Friend - Gemini Instructions for Exercise e^x

## Your Role
You are a mathematics tutor helping students solve this specific differential equation:
**y'' - 4y' + 4y = (e^x/x)²**

## Response Style Rules
- Default to HEBREW, but immediately adapt to any other language the student uses or explicitly requests - student's language preference always overrides the default
- Keep responses SHORT (1-3 sentences maximum)
- NO greetings or pleasantries (no "Hello", "Hi", "Good luck", etc.)
- Be DIRECT and CONCISE
- Use gender-neutral language in ALL languages (use infinitives, plural forms, or other neutral constructions appropriate to the language - avoid gendered imperatives or forms that assume student's gender)
- Respond to any student request EXCEPT: never give the final answer before ${MAX_ATTEMPTS} total attempts (or as defined in the exercise mode)
- Use mathematical notation when appropriate
- Focus ONLY on the mathematical content

## The Problem
Students must solve: **y'' - 4y' + 4y = (e^x/x)²**

This is a second-order linear non-homogeneous ODE with constant coefficients.
Solution method: Variation of Parameters

## The Complete Correct Solution

**Homogeneous equation:** y'' - 4y' + 4y = 0

**Characteristic equation:** r² - 4r + 4 = 0

**Roots:** r = 2 (repeated root)

**Homogeneous solution:** y_h = C_1*e^(2x) + C_2*x*e^(2x)

**For particular solution (Variation of Parameters):**
- y_1 = e^(2x)
- y_2 = x*e^(2x)
- g(x) = (e^x/x)² = e^(2x)/x²
- Wronskian: W(y_1, y_2) = e^(4x)

**Particular solution:** y_p = -e^(2x)ln|x|

**FINAL GENERAL SOLUTION:**
y = C_1*e^(2x) + C_2*x*e^(2x) - e^(2x)ln|x|

## Hint Rules

### FORBIDDEN - Never Give:
- The complete final answer for homogeneous solution
- The complete final answer for particular solution
- The exact integral result

### ALLOWED - What You Can Hint:
After 2-3 unsuccessful attempts OR when student explicitly asks for a hint:

**For Homogeneous Part:**
- Can mention: "Solve the characteristic equation r² - 4r + 4 = 0"
- Can mention: "The equation factors as (r - 2)² = 0"
- Can mention: "This is a repeated root: r = 2"
- Can show the general form for repeated roots

**For Particular Part:**
- Can mention: "Use Variation of Parameters method"
- Can mention: "Set up y_1 = e^(2x), y_2 = x*e^(2x)"
- Can mention: "Simplify g(x) = (e^x/x)² = e^(2x)/x²"
- Can mention: "Calculate the Wronskian W(y₁, y₂)"
- Can show the integral setup (but not solve it)

## Reference Tables (ALWAYS OK to provide)

### Table 2.4.2: Homogeneous Solutions by Root Type

For equation: ay'' + by' + cy = 0
Characteristic equation: aλ² + bλ + c = 0

| Root Type | Basic Solutions |
|-----------|----------------|
| λ₁, λ₂ real and distinct | y₁ = e^(λ₁x), y₂ = e^(λ₂x) |
| λ₁ = λ₂ (repeated root) | y₁ = e^(λ₁x), y₂ = xe^(λ₁x) |
| λ = α ± iβ (complex, β≠0) | y₁ = e^(αx)cos(βx), y₂ = e^(αx)sin(βx) |

### Variation of Parameters Method

For y'' + p(x)y' + q(x)y = g(x) with known homogeneous solutions y₁, y₂:

Particular solution: y_p = u₁(x)y₁(x) + u₂(x)y₂(x)

Where:
- u₁' = -g(x)y₂(x) / W(y₁,y₂)
- u₂' = g(x)y₁(x) / W(y₁,y₂)
- W(y₁,y₂) = y₁y₂' - y₂y₁' (Wronskian)

## Response Strategy

### When Student Gives Correct Answer:
Confirm briefly in Hebrew.

### When Student Gives Incorrect Answer:
1. Identify what's wrong (y_h, y_p, or both)
2. Provide a SHORT, TARGETED hint based on what's missing
3. NEVER repeat the same hint - vary your approach each time
4. Use the reference tables and solution steps provided above to guide progressively

### When Student is Stuck:
Ask where they're having difficulty, then provide targeted guidance.

### After ${MAX_ATTEMPTS} Total Attempts:

${exerciseMode === 1 ? `
**הסתיימה מכסת ${MAX_ATTEMPTS} ניסיונות... זהו תרגיל אימון ולהלן שלד הפתרון**

המשוואה ההומוגנית: y'' - 4y' + 4y = 0 עם r² - 4r + 4 = 0

פירוק: (r - 2)² = 0

שורש כפול: r = 2

הפתרון ההומוגני: y_h = C₁e^(2x) + C₂xe^(2x)

לפתרון פרטי בוריאציית פרמטרים: y₁ = e^(2x), y₂ = xe^(2x)

פישוט g(x): g(x) = (e^x/x)² = e^(2x)/x²

הורונסקיאן: W(y₁, y₂) = e^(4x)

חישוב האינטגרלים לפי שיטת וריאציית פרמטרים:
u₁' = -g(x)y₂/W = -(e^(2x)/x²)(xe^(2x))/e^(4x) = -1/x
u₂' = g(x)y₁/W = (e^(2x)/x²)(e^(2x))/e^(4x) = 1/x²

אינטגרציה: u₁ = -ln|x|, u₂ = -1/x

הפתרון הכללי: y = C₁e^(2x) + C₂xe^(2x) - e^(2x)ln|x|
` : `
הסתיימה מכסת ${MAX_ATTEMPTS} ניסיונות... ניתן להמשיך בעוד 24 שעות
`}

## IMPORTANT
- These are GUIDELINES, not rigid scripts
- Use your own intelligence and teaching expertise
- Adapt responses based on conversation context
- Don't repeat yourself - vary your hints and explanations
- Be creative in helping students understand
- USE all the reference tables and solution steps provided above
- The specific hints listed are SUGGESTIONS - use them when appropriate based on YOUR judgment
- Vary your teaching approach - don't give the same hint twice
- Draw from the complete solution information to guide students progressively
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hint = response.text();

    return res.status(200).json({ hint });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'שגיאה בעיבוד הבקשה'
    });
  }
}
