const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

let anthropicClient = null;
let openaiClient = null;
let geminiClient = null;

const getAIProvider = () => process.env.AI_PROVIDER || "claude";

const getAnthropicClient = () => {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
};

const getOpenAIClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const getGeminiClient = () => {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

/**
 * Send a message to the configured AI provider
 */
const generateAIResponse = async (systemPrompt, userPrompt) => {
  const provider = getAIProvider();

  try {
    if (provider === "claude") {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response.content[0].text;
    } else if (provider === "gemini") {
      const client = getGeminiClient();
      const model = client.getGenerativeModel({ model: "gemini-pro" });
      const response = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 4096,
        },
      });
      const result = await response.response;
      return result.text();
    } else {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      return response.choices[0].message.content;
    }
  } catch (error) {
    logger.error(`AI Service Error (${provider}): ${error.message}`);
    throw new Error(`AI generation failed: ${error.message}`);
  }
};

/**
 * Generate a personalized workout plan for a member
 */
const generateWorkoutPlan = async (memberProfile) => {
  const systemPrompt = `You are an expert certified personal trainer and fitness coach with 15+ years of experience. 
Your task is to create detailed, safe, and personalized workout plans based on the member's profile.
Always respond with a valid JSON object only, no markdown, no explanation.`;

  const userPrompt = `Create a comprehensive 4-week workout plan for this member:

Member Profile:
- Name: ${memberProfile.name}
- Age: ${memberProfile.profile?.age || "Not specified"}
- Gender: ${memberProfile.profile?.gender || "Not specified"}
- Weight: ${memberProfile.profile?.weight ? memberProfile.profile.weight + " kg" : "Not specified"}
- Height: ${memberProfile.profile?.height ? memberProfile.profile.height + " cm" : "Not specified"}
- Fitness Goal: ${memberProfile.profile?.fitnessGoal || "general_fitness"}
- Activity Level: ${memberProfile.profile?.activityLevel || "moderate"}
- Medical Conditions: ${memberProfile.profile?.medicalConditions?.join(", ") || "None"}

Return ONLY this JSON structure:
{
  "title": "Plan title",
  "description": "Brief overview",
  "goal": "Primary goal",
  "durationWeeks": 4,
  "schedule": [
    {
      "day": "Monday",
      "focus": "Muscle group focus",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedDuration": 45,
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "10-12",
          "rest": "60 seconds",
          "targetMuscles": ["muscle1"],
          "equipment": "equipment needed",
          "notes": "form tip"
        }
      ]
    }
  ],
  "tags": ["tag1", "tag2"]
}`;

  const response = await generateAIResponse(systemPrompt, userPrompt);

  try {
    const cleaned = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (parseError) {
    logger.error("Failed to parse AI workout plan JSON:", parseError.message);
    throw new Error("AI returned an invalid workout plan format");
  }
};

/**
 * Generate a personalized diet plan for a member
 */
const generateDietPlan = async (memberProfile) => {
  const systemPrompt = `You are a certified nutritionist and dietitian with expertise in sports nutrition.
Create detailed, practical, and culturally appropriate meal plans.
Always respond with a valid JSON object only, no markdown, no explanation.`;

  const userPrompt = `Create a 7-day diet plan for this member:

Member Profile:
- Name: ${memberProfile.name}
- Age: ${memberProfile.profile?.age || "Not specified"}
- Gender: ${memberProfile.profile?.gender || "Not specified"}
- Weight: ${memberProfile.profile?.weight ? memberProfile.profile.weight + " kg" : "Not specified"}
- Height: ${memberProfile.profile?.height ? memberProfile.profile.height + " cm" : "Not specified"}
- Fitness Goal: ${memberProfile.profile?.fitnessGoal || "general_fitness"}
- Activity Level: ${memberProfile.profile?.activityLevel || "moderate"}
- Allergies: ${memberProfile.profile?.allergies?.join(", ") || "None"}

Return ONLY this JSON structure:
{
  "title": "Diet plan title",
  "description": "Overview",
  "goal": "Nutritional goal",
  "targetCalories": 2000,
  "targetProtein": 150,
  "targetCarbs": 250,
  "targetFats": 65,
  "restrictions": [],
  "schedule": [
    {
      "day": "Monday",
      "totalDailyCalories": 2000,
      "totalProtein": 150,
      "totalCarbs": 250,
      "totalFats": 65,
      "waterIntakeLiters": 3,
      "notes": "Day notes",
      "meals": [
        {
          "mealType": "breakfast",
          "time": "8:00 AM",
          "totalCalories": 450,
          "items": [
            {
              "name": "Food item",
              "quantity": "1 cup",
              "calories": 200,
              "protein": 10,
              "carbs": 30,
              "fats": 5,
              "notes": "preparation note"
            }
          ]
        }
      ]
    }
  ]
}`;

  const response = await generateAIResponse(systemPrompt, userPrompt);

  try {
    const cleaned = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (parseError) {
    logger.error("Failed to parse AI diet plan JSON:", parseError.message);
    throw new Error("AI returned an invalid diet plan format");
  }
};

/**
 * Generate AI progress feedback for a member
 */
const generateProgressFeedback = async (member, progressHistory) => {
  const systemPrompt = `You are a supportive and expert fitness coach analyzing member progress data.
Provide detailed, actionable, motivating, and scientifically-backed feedback.
Be specific, empathetic, and practical.`;

  const recentLogs = progressHistory.slice(0, 10); // Last 10 logs
  const avgWeight =
    recentLogs.reduce((s, l) => s + (l.weight || 0), 0) /
    recentLogs.filter((l) => l.weight).length;
  const avgEnergy =
    recentLogs.reduce((s, l) => s + (l.energyLevel || 0), 0) /
    recentLogs.filter((l) => l.energyLevel).length;
  const workoutsCompleted = recentLogs.filter((l) => l.workoutCompleted).length;

  const userPrompt = `Analyze this member's fitness progress and provide comprehensive feedback:

Member: ${member.name}
Goal: ${member.profile?.fitnessGoal || "general_fitness"}
Activity Level: ${member.profile?.activityLevel || "moderate"}

Recent Progress Summary (last ${recentLogs.length} logs):
- Average Weight: ${avgWeight.toFixed(1)} kg
- Average Energy Level: ${avgEnergy.toFixed(1)}/10
- Workouts Completed: ${workoutsCompleted}/${recentLogs.length}
- Recent Logs: ${JSON.stringify(
    recentLogs.map((l) => ({
      date: l.date,
      weight: l.weight,
      workoutCompleted: l.workoutCompleted,
      caloriesConsumed: l.caloriesConsumed,
      energyLevel: l.energyLevel,
      mood: l.mood,
      sleepHours: l.sleepHours,
    })),
  )}

Provide feedback covering:
1. Overall Progress Assessment
2. Strengths & Achievements  
3. Areas for Improvement
4. Specific Actionable Recommendations
5. Motivational Message
6. Next Week Focus Areas`;

  return await generateAIResponse(systemPrompt, userPrompt);
};

module.exports = {
  generateAIResponse,
  generateWorkoutPlan,
  generateDietPlan,
  generateProgressFeedback,
};
