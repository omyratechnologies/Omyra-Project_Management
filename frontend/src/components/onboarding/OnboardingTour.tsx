import React, { useEffect } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour, Step } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUser } from '@/hooks/useUser';

type TourStep = Required<Pick<Step.StepOptions, 'id' | 'title' | 'text' | 'attachTo' | 'buttons'>>;

const getBaseSteps = (tour: Tour): TourStep[] => [
  {
    id: 'welcome',
    title: 'Welcome to Omyra! 👋',
    text: 'Let\'s take a quick tour to help you get started. You can exit the tour anytime by clicking the "X" button.',
    attachTo: { element: '[data-tour="dashboard"]', on: 'bottom' },
    buttons: [
      {
        text: 'Skip Tour',
        action: () => tour.complete(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Start Tour',
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    text: 'This is your command center. Get a quick overview of your projects, tasks, and team activity.',
    attachTo: { element: '[data-tour="dashboard-cards"]', on: 'bottom' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Next',
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'projects',
    title: 'Project Management',
    text: 'Create and manage your projects here. Track progress, deadlines, and team collaboration all in one place.',
    attachTo: { element: '[data-tour="projects-link"]', on: 'right' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Next',
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'tasks',
    title: 'Task Board',
    text: 'Organize tasks with our Kanban board. Drag and drop tasks between columns to update their status.',
    attachTo: { element: '[data-tour="tasks-link"]', on: 'right' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Next',
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'team',
    title: 'Team Collaboration',
    text: 'View your team members, assign tasks, and track everyone\'s progress.',
    attachTo: { element: '[data-tour="team-link"]', on: 'right' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Next',
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Stay Updated',
    text: 'Get real-time notifications about project updates, mentions, and team activity.',
    attachTo: { element: '[data-tour="notifications"]', on: 'bottom' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Next',
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'settings',
    title: 'Personalize Your Experience',
    text: 'Configure your profile, notifications, and app preferences in the settings.',
    attachTo: { element: '[data-tour="settings-link"]', on: 'right' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Finish Tour',
        action: () => tour.complete()
      }
    ]
  }
];

// Role-specific steps
const getAdminSteps = (tour: Tour): TourStep[] => [
  {
    id: 'admin-panel',
    title: 'Admin Controls',
    text: 'As an admin, you have access to additional controls for managing users, system settings, and monitoring platform usage.',
    attachTo: { element: '[data-tour="admin-panel"]', on: 'left' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Next',
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'user-management',
    title: 'User Management',
    text: 'Add, remove, or modify user accounts and their permissions from here.',
    attachTo: { element: '[data-tour="user-management"]', on: 'left' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Finish Tour',
        action: () => tour.complete()
      }
    ]
  }
];

const getManagerSteps = (tour: Tour): TourStep[] => [
  {
    id: 'team-management',
    title: 'Team Management',
    text: 'As a manager, you can assign team members to projects and monitor their workload.',
    attachTo: { element: '[data-tour="team-management"]', on: 'left' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Next',
        action: () => tour.next()
      }
    ]
  },
  {
    id: 'reports',
    title: 'Performance Reports',
    text: 'Access detailed reports on project progress and team performance.',
    attachTo: { element: '[data-tour="reports"]', on: 'left' },
    buttons: [
      {
        text: 'Back',
        action: () => tour.back()
      },
      {
        text: 'Finish Tour',
        action: () => tour.complete()
      }
    ]
  }
];

export const useOnboardingTour = () => {
  const { toast } = useToast();
  const { user, role } = useUser();
  const [hasCompletedTour, setHasCompletedTour] = useLocalStorage('onboarding-completed', false);

  const configureTour = () => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md rounded-lg p-4',
        scrollTo: true,
        cancelIcon: {
          enabled: true
        },
        modalOverlayOpeningPadding: 4,
        modalOverlayOpeningRadius: 4,
        popperOptions: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 12]
              }
            }
          ]
        }
      } as Partial<Step.StepOptions>
    });

    // Get base steps first
    const baseSteps = getBaseSteps(tour);

    // Add role-specific steps
    let roleSteps: TourStep[] = [];
    if (role === 'admin') {
      roleSteps = getAdminSteps(tour);
    } else if (role === 'project_manager') {
      roleSteps = getManagerSteps(tour);
    }

    // Add all steps to the tour
    [...baseSteps, ...roleSteps].forEach(step => tour.addStep(step));

    tour.on('complete', () => {
      setHasCompletedTour(true);
      toast({
        title: "Tour Completed! 🎉",
        description: "You're all set to start using Omyra. Visit Settings if you want to take the tour again."
      });
    });

    tour.on('cancel', () => {
      toast({
        title: "Tour Cancelled",
        description: "You can restart the tour anytime from the Settings page."
      });
    });

    return tour;
  };

  const startTour = () => {
    const tour = configureTour();
    tour.start();
  };

  // Auto-start tour for first-time users
  useEffect(() => {
    if (!hasCompletedTour) {
      // Add a slight delay to ensure the DOM is ready
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour]);

  return {
    startTour,
    hasCompletedTour,
    setHasCompletedTour
  };
};
