import { robotAgreeDisagreeOptions, robotTrustOptions } from '../constants';

export enum QuestionType { MultipleChoice, MultipleChoiceHorizontal, Ranked, Instruction, Text }
export enum TextAreaType { Small, Number, Large }
export type SurveyQuestion = {
    type: QuestionType,
    text: string,
    responses?: string[],
    followUps?: (null | SurveyQuestion | SurveyQuestion[])[],
    id?: string,
    params?: {
        textAreaType?: TextAreaType
    }
};

const multipleBeliefsFollowUp =  {
    type: QuestionType.MultipleChoice,
    text: "When you held multiple beliefs, how did you resolve them?",
    responses: [
        "I focused on one-at-a-time. I selected a sampling location that addressed my most important belief.", 
        "I weighted my beliefs. I prioritized sampling locations that addressed my most important belief first, and then selected from these a location that also addressed my second most important belief.",
        "I did not weight my beliefs. I selected a sampling location that addressed my multiple beliefs, even if it was not the ideal location to address my most important belief.",
        "Other"
    ],
    followUps: [
        null,
        null,
        null,
        {
            type: QuestionType.Text,
            text: "Please explain."
        },
    ]
}


export const surveyQuestions: SurveyQuestion[][] = [
    [
        {
            type: QuestionType.Instruction,
            text: "Thank you! You are almost finished. Please respond to a few final questions."
        },
        {
            type: QuestionType.MultipleChoice,
            text: "How often did you hold multiple beliefs at a time (e.g., believing simultaneously that there are areas along the line where data is needed, AND that there are potential discrepancies between measurements and the given hypothesis that needs to be further investigated)?",
            responses: ["Always", "Most of the time", "Sometimes", "Rarely", "Never"],
            followUps: [
                multipleBeliefsFollowUp,
                multipleBeliefsFollowUp,
                multipleBeliefsFollowUp,
                multipleBeliefsFollowUp,
                null
            ]
        },
        {
            type: QuestionType.MultipleChoice,
            text: "If the robot collected data autonomously using its own suggestions, how satisfied would you be with the resulting data collection strategy?",
            responses: ["Very satisfied", "Moderately satisfied", "Somewhat satisfied", "Neither satisfied nor unsatisfied", 
            "Somewhat unsatisfied", "Moderately unsatisfied", "Very unsatisfied"]
        },
    ],
    [
        {
            type: QuestionType.Instruction,
            text: "Rank the extent to which you agree/disagree with each of the following statements:"
        },
        {
            type: QuestionType.MultipleChoiceHorizontal,
            text: "The robot's suggestions were useful when my reported belief was to increase spatial coverage.",
            responses: robotAgreeDisagreeOptions
        },
        // {
        //     type: QuestionType.MultipleChoiceHorizontal,
        //     text: "The robot’s suggestion was useful when I wanted to increase moisture-range coverage.",
        //     responses: robotAgreeDisagreeOptions
        // },
        {
            type: QuestionType.MultipleChoiceHorizontal,
            text: "The robot's suggestions were useful when my reported belief was that there was a discrepancy between the data and hypothesis that needed further evaluation.",
            responses: robotAgreeDisagreeOptions
        },
        {
            type: QuestionType.MultipleChoiceHorizontal,
            text: "The robot’s suggestion was useful when I wanted to further verify that the measurements supported the given hypothesis.",
            responses: robotAgreeDisagreeOptions
        },
        // {
        //     type: QuestionType.MultipleChoiceHorizontal,
        //     text: "The robot’s suggestions were not useful.",
        //     responses: robotAgreeDisagreeOptions
        // },
        {
            type: QuestionType.Text,
            text: "If you were to use this robot for data collection in real life, what changes or improvements would you make in how the robot interacts with you to suggest locations?",
        },
    ],
    [
        {
            type: QuestionType.Instruction,
            text: "Thank you for your responses! You have completed this survey."
        }
    ]
];