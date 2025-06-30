import mongoose, { Mongoose } from "mongoose";
import { Exercises } from "../models/status.exercise.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const ExercisesbyDay = asyncHandler(async(req, res) =>{
    const userId = req?.user?._id || new mongoose.Types.ObjectId('68592b2cdbf5572dbfda8c1e'); ;
    const day = new Date(req.body.date);
    day.setHours(0, 0, 0, 0);

    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const exercises = await Exercises.find({
    userId: userId,
    date: {
        $gte: day,
        $lt: nextDay
    }
    });

    if(!exercises){
        throw new ApiError(400, "Unable to fetch exercises");
    }

    res.status(200).
    json(new ApiResponse(
        true,
        "Exercises fetched successfully!",
        exercises
    ))
});

const ExercisebyUser = asyncHandler(async(req, res) => {
    const userId = req?.user?._id;

    const exercises = await Exercises.find({
        userId : userId
    });
    
    if(!exercises){
        throw new ApiError(400, "Unable to fetch exercises");
    }

    res.status(200).
    json(new ApiResponse(
        true,
        exercises,
        "Exercises fetched successfully!",
        
    ))
});

const Exerciseupdated = asyncHandler(async(req, res) => {
    const userId = req?.user?._id;
    const exercises = req.body.exercises;

    for(const exercise of exercises){
        const status = exercise.status;
        const complete = status.totalReps > 0 ? (status.completedReps / status.totalReps) * 100 : 0;
        const reps = exercise.status.totalReps == 0 ? 12 : exercise.status.totalReps;
        status.completePercent = complete;
        status.totalReps = reps;
        const updatedExercise = await Exercises.findByIdAndUpdate(
            exercise._id,
            { status: exercise.status },
            { new: true } 
        );

        if(!updatedExercise){
            throw new ApiError(400, "Unable to update exercise");
        }
    }

    res.status(200).
    json(new ApiResponse(
        true,
        {}
        ,
        "Exercises updated successfully!",
    ))

});

const CaloriesByExercises = asyncHandler(async(req, res) => {
        const userId = req?.user?._id || new mongoose.Types.ObjectId('68592b2cdbf5572dbfda8c1e'); ;
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Fetch exercises in last 30 days
        const exercises = await Exercises.find({
        userId: userId,
        createdAt: {
            $gte: thirtyDaysAgo,
            $lte: today
        }
        });

        if (!exercises) {
        throw new ApiError(400, "Unable to fetch exercises");
        }

        // Group by date
        const grouped = {};

        exercises.forEach(ex => {
        const dateStr = new Date(ex.createdAt).toISOString().split('T')[0]; // e.g. '2025-06-22'

        if (!grouped[dateStr]) {
            grouped[dateStr] = {
            totalCalories: 0,
            totalReps: 0,
            completedReps: 0
            };
        }

        const { calorieBurnPerRep, status } = ex;
        const totalCaloriesForExercise = calorieBurnPerRep * (status.totalReps || 0);

        grouped[dateStr].totalCalories += totalCaloriesForExercise;
        grouped[dateStr].totalReps += status.totalReps || 0;
        grouped[dateStr].completedReps += status.completedReps || 0;
        });

        // Convert grouped object to array
        const summary = Object.entries(grouped).map(([date, data]) => {
        const completion =
            data.totalReps > 0 ? (data.completedReps / data.totalReps) * 100 : 0;

            return {
                date,
                totalCaloriesBurnt: data.totalCalories,
                completionPercent: parseFloat(completion.toFixed(2))
            };
        });


        return res.status(200).json(new ApiResponse(true, summary,"Calories fetched successfully!" ));
});


export {
    ExercisesbyDay,
    ExercisebyUser,
    Exerciseupdated,
    CaloriesByExercises
}