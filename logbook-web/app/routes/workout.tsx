import React from 'react';
import { Outlet } from 'react-router';
import SubNavigation from '../components/SubNavigation';
import { workoutNavigation } from '../config/navigation';

export default function WorkoutLayout() {
  return (
    <div>
      {/* Sub Navigation */}
      <SubNavigation links={workoutNavigation} />

      {/* Workout Section Content */}
      <Outlet />
    </div>
  );
} 