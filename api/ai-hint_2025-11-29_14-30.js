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

המשוואה: (y/x - 2y³/x³)y' = 2 - y²/x²

סידור המשוואה: (y²x - 2x³)dx + (yx² - 2y³)dy = 0

בדיקת מדויקות:
∂M/∂y = 2xy
∂N/∂x = 2xy
מתקיים: ∂M/∂y = ∂N/∂x

לאחר הכפלה ב-x³ המשוואה מדויקת.

חישוב הפתרון:
Fₓ(x,y) = y²x - 2x³

F(x,y) = ∫(y²x - 2x³)dx = (1/2)x²y² - (1/2)x⁴ + g(y)

גזירה לפי y:
Fᵧ(x,y) = x²y + g'(y) = yx² - 2y³

לכן: g'(y) = -2y³

אינטגרציה: g(y) = -(1/2)y⁴

הפתרון הכללי: x²y² - x⁴ - y⁴ = C`
      : `הסתיימה מכסת ${MAX_ATTEMPTS} ניסיונות... ניתן להמשיך בעוד 24 שעות`;
    return res.status(200).json({ hint: solutionText });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // בניית ההיסטוריה
    let conversationText = '';
    conversationHistory.forEach(turn => {
      conversationText += `תשובת סטודנט: ${turn.user}\nתגובת מורה: ${turn.ai}\n\n`;
    });

const prompt = `
# OVERRIDE INSTRUCTION - HIGHEST PRIORITY

IF YOU ARE STUCK OR CONTRADICTING YOURSELF:
1. Be yourself (Gemini) - use your own intelligence and creativity
2. BUT: NEVER give the final complete answer
3. NEVER repeat the same response twice - check history and vary your approach

# SPECIFIC FOR EXACT EQUATIONS:
If you already said "this is an exact equation", DO NOT repeat this.
Instead, give ONE of these progressive hints:
1. Suggest multiplying both sides by x³ to make it exact
2. Mention checking if ∂M/∂y = ∂N/∂x after multiplication
3. Show how to find F(x,y) from Fₓ(x,y) = M(x,y)
4. Show how to find g(y) from Fᵧ(x,y) = N(x,y)

---

${conversationText ? `# CONVERSATION HISTORY:\n${conversationText}\n---\n\n` : ''}

# תשובת הסטודנט כעת: ${userInput}

---

# Digital Friend - Gemini Instructions for Exercise 5

## Your Role
You are a mathematics tutor helping students solve this specific differential equation:
**(y/x - 2y³/x³)y' = 2 - y²/x²**

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
Students must solve: **(y/x - 2y³/x³)y' = 2 - y²/x²**

This is a first-order exact differential equation.
Solution method: Exact Equations (with integrating factor x³)

## The Complete Correct Solution

**Original equation:** (y/x - 2y³/x³)y' = 2 - y²/x²

**Rearranged form:** (y²x - 2x³)dx + (yx² - 2y³)dy = 0

**Check for exactness:**
∂M/∂y = 2xy
∂N/∂x = 2xy
Therefore: ∂M/∂y = ∂N/∂x

**The equation is exact after multiplying by x³.**

**Finding F(x,y):**
Fₓ(x,y) = y²x - 2x³

F(x,y) = ∫(y²x - 2x³)dx = (1/2)x²y² - (1/2)x⁴ + g(y)

**Finding g(y):**
Fᵧ(x,y) = x²y + g'(y) = yx² - 2y³

Therefore: g'(y) = -2y³

Integration: g(y) = -(1/2)y⁴

**FINAL GENERAL SOLUTION:**
x²y² - x⁴ - y⁴ = C

## Hint Rules

### FORBIDDEN - Never Give:
- The complete final answer
- The exact form of F(x,y) or g(y) directly
- The final solution x²y² - x⁴ - y⁴ = C

### ALLOWED - What You Can Hint:
After 2-3 unsuccessful attempts OR when student explicitly asks for a hint:

**For Exact Equations:**
- Can mention: "Check if this is an exact equation"
- Can mention: "Try multiplying by x³"
- Can mention: "Verify ∂M/∂y = ∂N/∂x after multiplication"
- Can mention: "Find F(x,y) by integrating Fₓ(x,y) = M(x,y)"
- Can mention: "Find g(y) by comparing Fᵧ(x,y) with N(x,y)"
- Can show the setup for finding g'(y) (but not solve it completely)

## Reference Tables (ALWAYS OK to provide)

### Method for Almost Exact Equations

**Form:** M(x,y)dx + N(x,y)dy = 0

**Check exactness:** ∂M/∂y = ∂N/∂x

**If not exact, find integrating factor μ:**

Option 1: If (Mᵧ - Nₓ)/N = p(x) (function of x only)
Then: μ = e^∫p(x)dx

Option 2: If (Nₓ - Mᵧ)/M = q(y) (function of y only)
Then: μ = e^∫q(y)dy

Option 3: Additional method (see question 1.5.28, Vol. A, p.76)
If there exists an integrating factor μ as a function of (Xᵧ - Yₓ)/(xY - yX), where:
- The equation can be written as: xdy + ydx - xy² ln x dx = 0
- Look for μ that is a function of the expression: (Xᵧ - Yₓ)/(xY - yX)

**After finding μ:**
Multiply both sides by μ and solve as exact equation.

### Method for Exact Equations

**After confirming ∂M/∂y = ∂N/∂x:**

Option 1:
- Integrate: ∫M dx = h(x,y) + C(y)
- Then: N(x,y) = hᵧ + C'(y)
- Find: C(y) = ∫(N - hᵧ)dy

Option 2:
- Integrate: ∫N dy = h(x,y) + C(x)
- Then: M(x,y) = hₓ + C'(x)
- Find: C(x) = ∫(M - hₓ)dx

**General solution:** φ(x,y) = h + C = constant

## Response Strategy

### When Student Gives Correct Answer:
Confirm briefly in Hebrew.

### When Student Gives Incorrect Answer:
1. Identify what's wrong (missing integrating factor, incorrect M/N, wrong integration, etc.)
2. Provide a SHORT, TARGETED hint based on what's missing
3. NEVER repeat the same hint - vary your approach each time
4. Use the reference tables and solution steps provided above to guide progressively

### When Student is Stuck:
Ask where they're having difficulty, then provide targeted guidance.

### After ${MAX_ATTEMPTS} Total Attempts:

${exerciseMode === 1 ? `
**הסתיימה מכסת ${MAX_ATTEMPTS} ניסיונות... זהו תרגיל אימון ולהלן שלד הפתרון**

המשוואה: (y/x - 2y³/x³)y' = 2 - y²/x²

סידור המשוואה: (y²x - 2x³)dx + (yx² - 2y³)dy = 0

בדיקת מדויקות:
∂M/∂y = 2xy
∂N/∂x = 2xy
מתקיים: ∂M/∂y = ∂N/∂x

לאחר הכפלה ב-x³ המשוואה מדויקת.

חישוב הפתרון:
Fₓ(x,y) = y²x - 2x³

F(x,y) = ∫(y²x - 2x³)dx = (1/2)x²y² - (1/2)x⁴ + g(y)

גזירה לפי y:
Fᵧ(x,y) = x²y + g'(y) = yx² - 2y³

לכן: g'(y) = -2y³

אינטגרציה: g(y) = -(1/2)y⁴

הפתרון הכללי: x²y² - x⁴ - y⁴ = C
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
