import mongoose, { Mongoose } from "mongoose";
import { Planner } from "../models/exercisePlanner.model.js";
import { Exercises } from "../models/status.exercise.model.js";
import openai from "../config/openai.config.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const planRecommendation = asyncHandler(async(req, res)=>{

    const  {input } = req.body
    const workoutDate= new Date(input?.date);

    if(!input){
        throw new ApiError(400, "Input is required.")
    }

    
    

    const prompt = `You are a professional fitness AI coach. Given a user’s profile and preferences as input, return a detailed weekly workout planner in **valid JSON format only**. Follow all the conditions below strictly.
                ${input}  and ${workoutDate}
            input : {
                "date" : "Date",
                "profile": {
                    "name": "John Doe",
                    "gender": "male",
                    "age": 25,
                    "weightKg": 72,
                    "heightCm": 178,
                    "bodyfat": 20,
                    "experienceLevel": "beginner",
                },
                strengthinfo: {
                "maxPushups": 20,
                "maxPullups": 3,
                "maxSquats": 30,
                "maxBenchKg": 20,
                "maxSquatkg": 20,
                "maxDeadliftkg": 20
                },
                "preferences": {
                    "goal": "muscular",
                    "daysPerWeek": number, 
                    "planStyle": "push-pull-leg",
                    sessionDuration: "45 minutes",
                    equipment: "Full gym access",
                    limitations: "broken ankle",
                    availableTime: "early morning"
                }
            }

                
            Rules and Logic to Follow:

            1. The output JSON should follow this schema:
                json
                {
                "days": [
                {
                    "date": Date,//// change accroing to wrokour date
                    "exercises": [
                        {
                        "id": Number,//1,2,3,4,5, per day
                        name: { type: String, required: true },
                        title: { type: String },
                        date: { type: Date, required: true },
                        description: { type: String },
                        shortDescription: { type: String },
                        
                        type: { type: String },
                        bodyPart: { type: String },
                        equipment: { type: String },

                        weight: { type: Number },
                        duration: { type: Number },
                        restperoid: { type: Number },
                        instructions: { type: String },

                        level: { type: String },
                        difficultyTag: { type: String },

                        avgSets: { type: Number },
                        avgReps: { type: Number },
                        calorieBurnPerRep: { type: Number },

                        status: {
                            completedByUser: { type: Boolean, default: false },
                            completePercent : { type: Number, default: 0 },
                            totalSets: { type: Number, default: 1 },
                            completedSets: { type: Number, default: 0 },
                            totalReps: { type: Number, default: 2 },
                            completedReps: { type: Number, default: 0 }
                        },

                        rating: { type: Number, min: 0, max: 5 },
                        ratingDesc: { type: String }
                        }
                    ]
                }    
                ],
                "nutrition": [ "String", "String", "String", "String", "String" ],
                "recommendations": [ "String", "String", "String", "String", "String" ],
                "goals": [ "String", "String", "String", "String", "String" ],
                "prediction": [ "String", "String", "String", "String", "String" ]
                }";
            1. Use  workoutDate ${workoutDate} as reference of start creating plan from that date.    
            2. Based on the experienceLevel:

                beginner: focus on bodyweight exercises (e.g., pushups, squats, planks)

                intermediate: mix bodyweight + equipment-based exercises

                advanced: include advanced exercises, compound lifts, weighted movements

            3. Number of exercises per day:

                beginner: 3–5

                intermediate: 4–6

                advanced: 5–8

            4. Set and rep logic:

                Decide avgSets based on level (e.g., beginner: 2–3, advanced: 4–5)

                avgReps based on the user’s capability (e.g., if user maxPushups = 20 and sets = 3, then reps = 10)

            5. Compute:

                status.totalSets = avgSets

                status.completedSets = 0

                status.totalReps = avgSets * avgReps

                status.completedReps = 0

            6. Use accurate values for:

                calorieBurnPerRep (e.g., 0.3 for pushups, 0.5 for squats, 0.8 for burpees)

                rating: between 3.5–5

                ratingDesc: motivating short review string

            7. Fill in:

                5 nutrition tips: practical meal or hydration advice

                5 recommendations: fitness habits or routine tips

                5 goals: tangible results expected after following this planner

                5 prediction: what changes or improvements user may feel after 1–4 weeks

            8.  Date. 
                date fields must be valid ISO strings of the current or upcoming 7 days. 
                
                If daysPerWeek is than 7, then put rest days in between and accordinly changes dates in result.

            9.  Days per week:
                Always create days array of size 7, then then fill daysperWeek element, and rest day is empty array!
                Output must be a pure JSON response, no explanation, no code block tags, no Markdown, and must be syntactically valid.
            10. Emphasis on sessionDuration, equipment and limitations, availableTime, as not everyone will have full gym access and some may have physical limitations.
            `;


    try {
        const chatCompletion = await openai.chat.completions.create({
            model: process.env.MODEL_NAME,
            temperature: 1.0,
            top_p: 1.0,
            max_tokens: 10000,
            messages: [
                { role: 'user', content: prompt }
            ]
        });

        const plan = chatCompletion.choices[0].message.content
        

        const cleaned_plan = plan.replace("```", "").replace("\n", "").replace("json", "")
        const output = JSON.parse(cleaned_plan)
        
        const user_id = req.user.id;
        
        
        const days = output['days']
        const nutrition = output['nutrition']
        const recommendations = output['recommendations']
        const goals = output['goals']
        const prediction = output['prediction']

        const days_planner = [];

        for (const day of days) {
            const exercise_ids = [];

            for (const exercise of day.exercises) {
                if (!exercise) {
                throw new ApiError(400, "Unable to store exercises!");
                }

                exercise['userId'] = user_id;
                

                const created_exercise = await Exercises.create(exercise);

                if (!created_exercise) {
                throw new ApiError(400, "Unable to store exercises!");
                }

                exercise_ids.push(created_exercise._id);
            }

            days_planner.push({
                date: day.date,  
                exercises: exercise_ids
            });
        }

        const created_planner = await Planner.create({
            userId : user_id,
            days : days_planner,
            nutrition : nutrition,
            recommendations : recommendations,
            goals : goals,
            prediction : prediction
        })

        if(!created_planner){
            throw new ApiError(400, "Unable to store planner!");
        }

        return res
            .status(200)
            .json(new ApiResponse(true, "Planner created successfully!", created_planner));
 
    } catch (err) {
        console.error('OpenAI error:', err);
    }

});


const historyPrediction = asyncHandler(async (req, res) => {
    const user = req?.user;
    const userId = user?._id;

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(today.getDate() - 13); // 14 days including today
    fourteenDaysAgo.setHours(0, 0, 0, 0); // Start of 14 days ago

    const exercises = await Exercises.find({
    userId: userId,
    "status.completedByUser": true,
    createdAt: {
        $gte: fourteenDaysAgo,
        $lte: today
    }
    });

    const created_exercises = exercises.map(element => ({
        name: element.name,
        type: element.type,
        bodyPart: element.bodyPart,
        equipment: element.equipment,
        status: element.status
    }));

    const prompt = 
    `
    You are a professional fitness AI coach. Given a user's recent **workout history**, generate a summary that includes the following four fields:

        1. **nutrition** – 5 practical nutrition or hydration tips that will support the user's recent training progress and fitness goal.
        2. **recommendations** – 5 fitness or lifestyle suggestions tailored to improve the user's upcoming sessions based on their current effort and consistency.
        3. **goals** – 5 achievable goals the user should target over the next 1–4 weeks based on performance trends.
        4. **prediction** – 5 outcome-based statements on what the user is likely to observe (e.g., physical, strength, or energy improvements) if they continue with similar efforts.
        5. **progressData**- 5 future predictions of progress data from the user's recent training sessions.
        6. **BodyType** - return type of body, person can achieve after 30 days from the user's recent training sessions.
        ${{history : created_exercises}}
        ${{weigth: user.profile.weightKg || 70,
            bodyfat: user.profile.bodyfat || 7,
        }}
        **INPUT FORMAT (history):**
        json
        {
        "history": [
            {
            "date": "YYYY-MM-DD",
            "exercises": [
                {
                "name": "Pushup",
                "totalSets": 3,
                "completedSets": 3,
                "totalReps": 30,
                "completedReps": 30
                },
                {
                "name": "Squat",
                "totalSets": 3,
                "completedSets": 2,
                "totalReps": 30,
                "completedReps": 20
                }
            ]
            },
            {
            "date": "YYYY-MM-DD",
            "exercises": [
                {
                "name": "Plank",
                "totalSets": 3,
                "completedSets": 3,
                "totalReps": 3,
                "completedReps": 3
                }
            ]
            }
        ]
        }

        output:{
        "nutrition": [ "String", "String", "String", "String", "String" ],
        "recommendations": [ "String", "String", "String", "String", "String" ],
        "goals": [ "String", "String", "String", "String", "String" ],
        "prediction": [ "String", "String", "String", "String", "String" ]
        "progressData" : [
            { date: '2025-01-01', weight: 75, bodyFat: 18 },
            { date: '2025-01-08', weight: 74.5, bodyFat: 17.8 },
            { date: '2025-01-15', weight: 74, bodyFat: 17.5 },
            { date: '2025-01-22', weight: 73.5, bodyFat: 17.2 },
            { date: '2025-01-29', weight: 73, bodyFat: 17 },
        ];/ dates must extimate and sould greater than current date.
        "BodyType" : "Lean" | "Average" | "Fit" | "Muscular" | "LargeBody" 
        }

        Output must be a pure JSON response, no explanation, no code block tags, no Markdown, and must be syntactically valid.

        `
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: process.env.MODEL_NAME,
            messages: [
                { role: 'user', content: prompt }
            ]
        });

        const plan = chatCompletion.choices[0].message.content
        

        const cleaned_plan = plan.replace("```", "").replace("\n", "").replace("json", "")
        const output = JSON.parse(cleaned_plan)
        console.log(3);

        
        
        const planner = Planner.findOne({
            userId,
            createdAt: { $lte: today },
            expireAt: { $gte: today }
        })
        

        const created_planner  = await Planner.findByIdAndUpdate(
            planner._id,
            {
                $set: {
                    nutrition: output.nutrition,
                    recommendations: output.recommendations,
                    goals: output.goals,
                    prediction: output.prediction
                }
            },
            {
                new: true
            }
        )


        return res
            .status(200)
            .json(new ApiResponse(true, output, "Planner created successfully!"));
 
    } catch (err) {
        console.error('OpenAI error:', err);
    }

    

});


const chat = asyncHandler(async(req, res) =>{
    const {chat} = req.body;

    if(!chat){
        throw new ApiError(400, "Unable to store planner!"); 
    }

    try {
    const chatCompletion = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        { role: 'user', content: chat}
      ]
    });

    const reply = chatCompletion.choices[0].message.content;

    return res
           .status(200)
           .json(new ApiResponse(true, reply, "chat replied!"));

  } catch (err) {
    console.error('OpenAI error:', err);
  }
});

const updateExercises = asyncHandler(async(req, res)=>{

    const {preWorkoutTaken, energyToday, soreBodyParts, date} = req.body;

    if (!preWorkoutTaken || !energyToday || !soreBodyParts || !date) {
            throw new ApiError(400, "All fields are required")
        }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const datebyuser = new Date(date);
    datebyuser.setHours(0, 0, 0, 0);

    if (datebyuser < today) {
        throw new ApiError(400, "You can't update past exercises!");
    }

    const tomorrow = new Date(datebyuser);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const exercises = await Exercises.find({
        userId: req.user?._id,
        date: {
            $gte: datebyuser,
            $lt: tomorrow
        }
    });


    const prompt =`
    You are a fitness recommendation assistant.

        I will provide you with:
        - A list of exercises that a user was supposed to do today.
        - The user's current energy level (as a string like "low", "medium", "high").
        - Whether the user took a pre-workout supplement (Yes or No).
        - The sore body parts today (comma-separated string like "legs, chest").

        input : ${{exercises : exercises},
          {preWorkoutTaken: preWorkoutTaken},
          {energyToday: energyToday},
          {soreBodyParts: soreBodyParts}}
        }

        Your task is to return a **new array of exercises**, with the same number of exercises, but **modified or substituted** based on these user inputs. For each substituted exercise:
        - Try to match or adjust for the body part or type.
        - Avoid body parts that are sore.
        - If energy is low, reduce difficulty or recommend bodyweight/light alternatives.
        - If pre-workout is taken and energy is high, allow slightly harder or compound exercises.
        - Maintain diversity across muscle groups.

        Each exercise should be returned in this format:
        json
        {
        id: Number,
        "name": "String",
        "title": "String",
        "date" : "Date", //Always todays date
        "description": "String",
        "shortDescription": "String",
        "type": "String",
        "bodyPart": "String",
        "equipment": "String",
        "level": "String",
        "difficultyTag": "String",
        "avgSets": Number,
        "avgReps": Number,
        "calorieBurnPerRep": Number,
        "status": {
            "totalSets": Number,
            "completedSets": 0,
            "totalReps": Number,
            "completedReps": 0
        },
        "rating": Number,
        "ratingDesc": "String",
        }
    1. Output substitute exercise object must have same userId and _id as it was in input exercises.
    2. Output must be a pure JSON response, no explanation, no code block tags, no Markdown, and must be syntactically valid.

    `;

     try {
    const chatCompletion = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        { role: 'user', content: prompt}
      ]
    });

    const plan = chatCompletion.choices[0].message.content
    const cleaned_plan = plan.replace("```", "").replace("\n", "").replace("json", "")
    const output = JSON.parse(cleaned_plan)

    const outputMap = new Map(output.map(item => [item.id, item]));

    for (const exercise of exercises) {
        const id = exercise.id;
        if (outputMap.has(id)) {
            const updates = {
            name: outputMap.get(id).name,
            title: outputMap.get(id).title,
            description: outputMap.get(id).description,
            shortDescription: outputMap.get(id).shortDescription,
            type: outputMap.get(id).type,
            bodyPart: outputMap.get(id).bodyPart,
            equipment: outputMap.get(id).equipment,
            level: outputMap.get(id).level,
            difficultyTag: outputMap.get(id).difficultyTag,
            avgSets: outputMap.get(id).avgSets,
            avgReps: outputMap.get(id).avgReps,
            calorieBurnPerRep: outputMap.get(id).calorieBurnPerRep,
            status: outputMap.get(id).status,
            rating: outputMap.get(id).rating,
            ratingDesc: outputMap.get(id).ratingDesc,
            };

            const created_exercise= await Exercises.findByIdAndUpdate(exercise._id, { $set: updates }, { new: true });
            if(!created_exercise){
                throw new ApiError(400, "Error updating exercise")
            }
        }
    }


    return res
           .status(200)
           .json(new ApiResponse(200, "exercies updated replied!", output));

  } catch (err) {
    console.error('OpenAI error:', err);
  }


})

export {updateExercises, chat, historyPrediction, planRecommendation};