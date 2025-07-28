// src/testing/testData.js
// 🧪 PAHM TEST CASES (from your 18-page checklist)
// First extraction - just test data

export const PAHM_TEST_CASES = {
    experiencedPractitioner: {
      name: "Experienced Practitioner",
      target: 65,
      tolerance: 3,
      questionnaire: {
        experience_level: 8,
        goals: ["liberation", "inner-peace", "spiritual-growth"],
        age_range: "35-44",
        emotional_awareness: 9,
        mindfulness_experience: 9,
        sleep_pattern: 8,
        physical_activity: "very_active",
        stress_response: "Observe and let go",
        work_life_balance: "Perfect integration of work and practice"
      },
      selfAssessment: {
        taste: "none",
        smell: "none",
        sound: "some", 
        sight: "none",
        touch: "none",
        totalAttachmentPenalty: -7
      }
    },
    
    motivatedBeginner: {
      name: "Motivated Beginner",
      target: 34,
      tolerance: 3,
      questionnaire: {
        experience_level: 3,
        goals: ["stress-reduction", "emotional-balance"],
        age_range: "25-34",
        emotional_awareness: 6,
        mindfulness_experience: 4,
        sleep_pattern: 6,
        physical_activity: "moderate",
        stress_response: "Usually manage well",
        work_life_balance: "Sometimes struggle but generally good"
      },
      selfAssessment: {
        taste: "strong",
        smell: "moderate",
        sound: "strong",
        sight: "moderate", 
        touch: "some",
        totalAttachmentPenalty: -58
      }
    },
  
    highlyStressedBeginner: {
      name: "Highly Stressed Beginner",
      target: 10,
      tolerance: 2,
      questionnaire: {
        experience_level: 1,
        goals: ["stress-reduction"],
        age_range: "18-24",
        emotional_awareness: 3,
        mindfulness_experience: 1,
        sleep_pattern: 3,
        physical_activity: "sedentary",
        stress_response: "Get overwhelmed easily",
        work_life_balance: "Work dominates everything"
      },
      selfAssessment: {
        taste: "strong",
        smell: "strong",
        sound: "strong",
        sight: "strong",
        touch: "strong",
        totalAttachmentPenalty: -75
      }
    }
  };