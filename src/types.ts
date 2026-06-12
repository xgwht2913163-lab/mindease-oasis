/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}

export interface Questionnaire {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  questions: Question[];
  scoreRanges: {
    min: number;
    max: number;
    label: string;
    color: string;
    advice: string;
  }[];
}

export type MoodType = "calm" | "joyful" | "tired" | "anxious" | "melancholy" | "stressed";

export interface MoodConfig {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface MoodLog {
  id: string;
  timestamp: string;
  mood: MoodType;
  score: number; // 1-10 intensity
  note: string;
}

export interface TestResult {
  id: string;
  questionnaireId: string;
  questionnaireTitle: string;
  timestamp: string;
  score: number;
  level: string;
  color: string;
  answers: Record<number, number>; // questionId -> selectedScore
}

export interface BreathingPhase {
  name: string;
  duration: number; // seconds
  instruction: string;
  scale: number; // visual circle multiplier
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  phases: BreathingPhase[];
}
