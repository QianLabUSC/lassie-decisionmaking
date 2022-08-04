import { confidenceTexts, robotAgreeDisagreeOptions, robotTrustOptions } from '../constants';


export enum QuestionType {
    MultipleChoice, MultipleChoiceHorizontal, Ranked, Instruction, Text, Image1, Image2,
    dropDownMenuComponent1, dropDownMenuComponent2
}
export enum TextAreaType { Small, Number, Large }

export type SurveyQuestion = {
    type: QuestionType,
    text?: string,
    responses?: string[],
    followUps?: (null | SurveyQuestion | SurveyQuestion[])[],
    id?: string,
    params?: {
        textAreaType?: TextAreaType
    },
};

let multipleBeliefsFollowUp =  {
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

//Add new follow-ups for bachelors degree question if the user selected 'Yes'
let multipleBachelorFollowUp = [
    [
        {
            type: QuestionType.Text,
            text: "How many years of practice do you have, post bachelor's degree?",
            params: { textAreaType: TextAreaType.Number }
        },
        {
            type: QuestionType.MultipleChoice,
            text: "Are you in academia or industry",
            responses: ["Academia", "Industry"],
            followUps: [
                {
                    type: QuestionType.MultipleChoice,
                    text: "Which best describes your current position?",
                    responses: ["Graduate Student", "Postdoctoral", "Adjunct", "Assistant Professor", "Associate Professor", "Full Professor", "Emeritus"]
                },
                null
            ]
        },
        {
            type: QuestionType.Text,
            text: "What is your discipline?"
        },
        {
            type: QuestionType.Text,
            text: "How would you describe your specialization?",
        }
    ],
    null
]

export const surveyQuestions: SurveyQuestion[][] = [
    // Apply new change by Zeyu 6/13/2022
    [
        {
            type: QuestionType.Instruction,
            text: "Thank you! You are almost finished. Please respond to a few final questions."
        },
        {
            type: QuestionType.Instruction,
            text: "Imagine a trusted student or colleague also collected data at White Sands using RHex. They found the following relationship between sand moisture and shear strength:",
        },
        {
            type: QuestionType.Image1,
            // text: "Image A"
        },
        {
            type: QuestionType.dropDownMenuComponent1,
            // text: "Provide a ranking of your certainty that the hypothesis is supported or refuted by this data. If you have no preference, select “I am unsure”:",
            responses: confidenceTexts
        },
        {
            type: QuestionType.Instruction,
            text: "Imagine a different student or colleague, using the same methods, found the following relationship between sand moisture and shear strength:",
        },
        {
            type: QuestionType.Image2,
            // text: "Image B"
        },
        {
            type: QuestionType.dropDownMenuComponent2,
            // text: "Provide a ranking of your certainty that the hypothesis is supported or refuted by this data. If you have no preference, select “I am unsure”:",
            responses: confidenceTexts
        }
    ],
    [
        {
            type: QuestionType.MultipleChoice,
            text: "How often did you hold multiple beliefs at a time (e.g., believing simultaneously that there are areas along the dune transect where data is needed, AND that there are potential discrepancies between measurements and the given hypothesis that needs to be further investigated)?",
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
            text: "How satisfied were you with the suggested locations provided by the robot?",
            responses: ["Very satisfied", "Satisfied", "Somewhat satisfied", "Neither satisfied nor unsatisfied", 
            "Somewhat unsatisfied", "Unsatisfied", "Very unsatisfied"]
        },
    ],
    [
        {
            type: QuestionType.Instruction,
            text: "Rank the extent to which you agree/disagree with each of the following statements:"
        },
        {
            type: QuestionType.MultipleChoiceHorizontal,
            text: "The robot’s suggestion was useful when I wanted to increase spatial coverage.",
            responses: robotAgreeDisagreeOptions
        },
        {
            type: QuestionType.MultipleChoiceHorizontal,
            text: "The robot’s suggestion was useful when I wanted to increase moisture-range coverage.",
            responses: robotAgreeDisagreeOptions
        },
        {
            type: QuestionType.MultipleChoiceHorizontal,
            text: "The robot’s suggestion was useful when I wanted to look into a potential discrepancy between measurements and the given hypothesis.",
            responses: robotAgreeDisagreeOptions
        },
        {
            type: QuestionType.MultipleChoiceHorizontal,
            text: "The robot’s suggestion was useful when I wanted to further verify that the measurements supported the given hypothesis.",
            responses: robotAgreeDisagreeOptions
        },
        {
            type: QuestionType.MultipleChoiceHorizontal,
            text: "The robot’s suggestions were not useful.",
            responses: robotAgreeDisagreeOptions
        },
        {
            type: QuestionType.Text,
            text: "If you were to use this robot for data collection in real life, what changes or improvements would you make in how the robot interacts with you to suggest locations?",
        }
    ],
    [
        {
            type: QuestionType.Instruction,
            text: "Please respond to a few final demographic questions."
        },
        {
            type: QuestionType.Text,
            text: "What is your age?",
            params: { textAreaType: TextAreaType.Number }
        },
        {
            //Apply new changes by Zeyu 6/7/2022
            type: QuestionType.MultipleChoice,
            text: "What is your gender?",
            responses: [ "Woman", "Man", "Gender Variant / Non-conforming", "Prefer to self describe", "Prefer not to say" ],
            followUps: [
                null,
                null,
                null,
                {
                    type: QuestionType.Text,
                    text: "Please describe your gender."
                },
                null
            ]
        },
        {
            type: QuestionType.MultipleChoice,
            text: "Have you completed a bachelor's degree?",
            responses: [ "Yes", "No" ],
            followUps: multipleBachelorFollowUp // Apply new changes by Zeyu 6/7/2022
        },
        {
            type: QuestionType.MultipleChoice,
            text: "Are you familiar with any of the features of this decision making scenario? Have you ever collected data at White Sands National Monument before or investigated a similar research question?",
            responses: ["Yes", "No"],
            followUps: [
                {
                    type: QuestionType.Text,
                    text: "Please explain which features of the scenario you are familiar with."
                },
                null
            ]
        }
    ],
    [
        {
            type: QuestionType.Instruction,
            text: "Thank you for your responses! You have completed this survey."
        }
    ]
];