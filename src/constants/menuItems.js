import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubCategoryIcon,
  Article as NewsIcon,
  FlashOn as FlashNewsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export const MENU_CATEGORIES = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: DashboardIcon,
      },
    ],
  },
  {
    title: 'Content Management',
    items: [
      {
        label: 'Categories',
        path: '/categories',
        icon: CategoryIcon,
      },
      {
        label: 'Sub-Categories',
        path: '/subcategories',
        icon: SubCategoryIcon,
      },
      {
        label: 'News',
        path: '/news',
        icon: NewsIcon,
      },
      {
        label: 'Flash News',
        path: '/flash-news',
        icon: FlashNewsIcon,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'User Management',
        path: '/user-management',
        icon: PeopleIcon,
      },
      {
        label: 'System Settings',
        path: '/system-settings',
        icon: SettingsIcon,
      },
    ],
  },
];

// Flattened version for backward compatibility
export const MENU_ITEMS = MENU_CATEGORIES.flatMap(category => category.items);

