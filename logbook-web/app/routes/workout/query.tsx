import React, { useState } from 'react';

export default function WorkoutQuery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [workoutType, setWorkoutType] = useState('all');

  // Mock data for demonstration
  const workouts = [
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
      date: '2023-09-14',
      type: 'HIIT',
      duration: 25,
      calories: 310,
      exercises: [
        { name: 'Burpees', sets: 4, reps: 15 },
        { name: 'Mountain Climbers', sets: 4, reps: 30 },
        { name: 'Jumping Jacks', sets: 4, reps: 25 },
      ],
    },
    {
      id: 4,
      date: '2023-09-12',
      type: 'Yoga',
      duration: 60,
      calories: 180,
      exercises: [
        { name: 'Yoga Session' },
      ],
    },
    {
      id: 5,
      date: '2023-09-10',
      type: 'Strength Training',
      duration: 50,
      calories: 350,
      exercises: [
        { name: 'Pull-ups', sets: 3, reps: 8 },
        { name: 'Rows', sets: 3, reps: 12, weight: 135 },
        { name: 'Bicep Curls', sets: 3, reps: 10, weight: 25 },
        { name: 'Shoulder Press', sets: 3, reps: 10, weight: 30 },
      ],
    },
    {
      id: 6,
      date: '2023-09-08',
      type: 'Cardio',
      duration: 45,
      calories: 380,
      exercises: [
        { name: 'Cycling', distance: 15, unit: 'km' },
      ],
    },
  ];

  // Filter workouts based on search criteria
  const filteredWorkouts = workouts.filter(workout => {
    // Filter by search query
    const matchesQuery = searchQuery === '' || 
      workout.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.exercises.some(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by workout type
    const matchesType = workoutType === 'all' || workout.type === workoutType;
    
    // Filter by date range
    const workoutDate = new Date(workout.date);
    const matchesDateStart = !dateRange.start || new Date(dateRange.start) <= workoutDate;
    const matchesDateEnd = !dateRange.end || new Date(dateRange.end) >= workoutDate;
    
    return matchesQuery && matchesType && matchesDateStart && matchesDateEnd;
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Workout Query</h1>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Search Workouts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input
              id="search-query"
              type="text"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search workout type or exercise"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="workout-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workout Type</label>
            <select
              id="workout-type"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Strength Training">Strength Training</option>
              <option value="Cardio">Cardio</option>
              <option value="HIIT">HIIT</option>
              <option value="Yoga">Yoga</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              id="start-date"
              type="date"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              id="end-date"
              type="date"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Results ({filteredWorkouts.length} workouts found)</h2>
        
        {filteredWorkouts.length > 0 ? (
          <div className="space-y-6">
            {filteredWorkouts.map((workout) => (
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
                          <span>
                            {exercise.name} - {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight ? ` at ${exercise.weight} lbs` : ''}
                          </span>
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
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No workouts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
} 