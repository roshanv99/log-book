import React from 'react';

export default function WorkoutOverview() {
  // Mock data for workout stats
  const stats = [
    { name: 'Workouts This Month', value: 14 },
    { name: 'Total Duration', value: '12h 30m' },
    { name: 'Calories Burned', value: '4,320' },
    { name: 'Active Days', value: '75%' },
  ];

  // Mock data for exercise history (last 7 days)
  const exerciseHistory = [
    { date: 'Mon', value: 45 },
    { date: 'Tue', value: 60 },
    { date: 'Wed', value: 0 },
    { date: 'Thu', value: 30 },
    { date: 'Fri', value: 75 },
    { date: 'Sat', value: 90 },
    { date: 'Sun', value: 0 },
  ];

  // Mock data for recent workouts
  const recentWorkouts = [
    {
      id: 1,
      date: '2023-09-18',
      type: 'Strength Training',
      duration: 45,
      calories: 320,
      exercises: [
        { name: 'Bench Press', sets: 3, reps: 10, weight: 135 },
        { name: 'Squats', sets: 3, reps: 12, weight: 185 },
        { name: 'Deadlift', sets: 3, reps: 8, weight: 205 },
      ],
    },
    {
      id: 2,
      date: '2023-09-16',
      type: 'Cardio',
      duration: 30,
      calories: 275,
      exercises: [
        { name: 'Running', distance: 5.2, unit: 'km' },
      ],
    },
    {
      id: 3,
      date: '2023-09-12',
      type: 'Yoga',
      duration: 60,
      calories: 180,
      exercises: [
        { name: 'Yoga Session' },
      ],
    },
  ];

  // Calculate max value for exercise history chart
  const maxExerciseValue = Math.max(...exerciseHistory.map(day => day.value));

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Workout Overview</h1>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Exercise history chart */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Last 7 Days</h2>
        <div className="flex items-end justify-between h-48">
          {exerciseHistory.map((day) => (
            <div key={day.date} className="flex flex-col items-center w-full">
              <div 
                className={`rounded-t w-5/6 ${day.value > 0 ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} 
                style={{ 
                  height: `${day.value > 0 ? (day.value / maxExerciseValue) * 100 : 5}%`,
                }}
              ></div>
              <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">{day.date}</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{day.value > 0 ? `${day.value}m` : 'Rest'}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent workouts */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Workouts</h2>
        <div className="space-y-6">
          {recentWorkouts.map((workout) => (
            <div key={workout.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">{workout.type}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{workout.date}</p>
                </div>
                <div className="mt-2 sm:mt-0 flex space-x-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">{workout.duration}</span> min
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">{workout.calories}</span> calories
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Exercises:</h4>
                <ul className="space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                      {'distance' in exercise ? (
                        <span>{exercise.name} - {exercise.distance} {exercise.unit}</span>
                      ) : 'sets' in exercise ? (
                        <span>{exercise.name} - {exercise.sets} sets × {exercise.reps} reps at {exercise.weight} lbs</span>
                      ) : (
                        <span>{exercise.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 