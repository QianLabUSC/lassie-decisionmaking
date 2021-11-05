export enum QuestionType { MultipleChoice, Ranked, Instruction, Text }
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

export const surveyQuestions: SurveyQuestion[][] = [
    [
        {
            type: QuestionType.Instruction,
            text: "Thank you! You are almost finished. Please respond to a few final questions."
        },
        {
            type: QuestionType.MultipleChoice,
            text: "Why did you select the particular number of measurements per location that you did?",
            responses: ["I am unsure.", "I had a reason."],
            followUps: [
                null,
                [
                    {
                        type: QuestionType.Instruction,
                        text: "Rank the extent to which each of the following contributed to your decision (1 - Not at all, 5 - Very much).",
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "The number (or numbers) were selected and distributed based on the expectation that moisture increased linearly over the dune."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "The number (or numbers) were selected and distributed to capture the most likely point of saturation."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "The number (or numbers) were selected and distributed based on dune slope."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "The number (or numbers) were selected and distributed based on dune elevation profile."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This is the number (or numbers) I default to"
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This is the number (or numbers) that are traditionally used in my discipline."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This is an efficient number (or numbers)."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This number (or numbers) optimizes the balance between efficiency and thoroughness."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This is the best number (or numbers) given the density of locations sampled from."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This number (or numbers) captures naturally occurring variability."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This number (or numbers) capture variability from measurement error."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This number (or numbers) captures any outliers."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This number (or numbers) allows me to compute a useful statistic."
                    },
                ],
            ]
        },
        {
            type: QuestionType.MultipleChoice,
            text: "Why did you select the particular measurement locations on each dune transect that you did?",
            responses: ["I am unsure.", "I had a reason."],
            followUps: [
                null,
                [
                    {
                        type: QuestionType.Instruction,
                        text: "Rank the extent to which each of the following contributed to your decision (1 - Not at all, 5 - Very much).",
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "The location spacing strategy was selected and distributed based on the expectation that moisture increased linearly over the dune."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "The location spacing strategy was selected and distributed to capture the most likely point of saturation."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "The location spacing strategy was driven by dune slope."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "The location spacing strategy was driven by dune elevation profile."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This is the location spacing strategy I default to."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This is the location spacing strategy that is traditionally used in my discipline."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This is an efficient location spacing strategy."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This location spacing strategy optimizes the balance between efficiency and thoroughness."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This is the best location spacing strategy given the number of measurements taken at each location."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This location spacing strategy avoids spatial bias."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This location spacing strategy achieves sufficient coverage."
                    },
                    {
                        type: QuestionType.Ranked,
                        text: "This location spacing strategy allows me to compute a useful statistic."
                    },
                ]
            ]
        }
    ],
    [
        {
            type: QuestionType.Instruction,
            text: "Thank you! You are almost finished. Please respond to a few final questions."
        },
        {
            type: QuestionType.Text,
            text: "Why did you select the particular dune transects (within the field area) that you did?"
        },
        {
            type: QuestionType.Text,
            text: "Did you ever adapt your strategy, why or why not?"
        },
        {
            type: QuestionType.Text,
            text: "Do you think this web-based scenario has pedagogical value? How so? If not, what would need to be changed to make it useful for geoeducation?"
        },
        {
            type: QuestionType.Text,
            text: "Was this task too difficult?"
        },
        {
            type: QuestionType.Text,
            text: " Is there anything else you want to tell us?"
        }
    ],
    [
        {
            type: QuestionType.Instruction,
            text: "Thank you! You are almost finished. Please respond to a few final questions."
        },
        {
            type: QuestionType.Text,
            text: "What is your age?",
            params: { textAreaType: TextAreaType.Number }
        },
        {
            type: QuestionType.MultipleChoice,
            text: "What is your gender?",
            responses: [ "Man", "Woman", "Non-binary" ]
        },
        {
            type: QuestionType.MultipleChoice,
            text: "Have you completed a bachelor's degree?",
            responses: [ "Yes", "No" ]
        },
        {
            type: QuestionType.Text,
            text: "How many years of practice do you have, post bachelor's degree?",
            params: { textAreaType: TextAreaType.Number }
        },
        {
            type: QuestionType.Text,
            text: "What is your discipline?"
        },
        {
            type: QuestionType.Text,
            text: "How would you describe your specialization, if any?"
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
        },
        {
            type: QuestionType.MultipleChoice,
            text: "Are you in academia or industry?",
            responses: ["Academia", "Industry"],
            followUps: [
                {
                    type: QuestionType.MultipleChoice,
                    text: "Which best describes your current position?",
                    responses: ["Graduate Student", "Postdoctoral", "Adjunct", "Assistant Professor", "Associate Professor", "Full Professor", "Emeritus"]
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