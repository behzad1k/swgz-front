import DefaultPlaylistPage from '@pages/library/DefaultPlaylistPage.tsx';
import { FC } from 'react';

// Pages
import SearchPage from '@pages/search/SearchPage.tsx';
import LibraryPage from '@pages/library/LibraryPage.tsx';
import ProfilePage from '@pages/profile/ProfilePage.tsx';
import EditProfilePage from '@pages/profile/EditProfilePage.tsx';
import UserProfilePage from '@pages/profile/UserProfilePage.tsx';
import SettingsPage from '@pages/profile/SettingsPage.tsx';
import LoginPage from '@pages/auth/LoginPage.tsx';
import EmailConfirmation from '@pages/auth/EmailConfirmation.tsx';
import GoogleCallback from '@pages/auth/GoogleCallback.tsx';
import PlaylistDetailPage from '@pages/playlist/PlaylistDetailPage.tsx';
import CreatePlaylistPage from '@pages/playlist/CreatePlaylistPage.tsx';
import EditPlaylistPage from '@pages/playlist/EditPlaylistPage.tsx';
import ArtistPage from '@pages/artist/ArtistPage.tsx';
import AlbumPage from '@pages/album/AlbumPage.tsx';

export interface Route {
  path: string;
  component: FC<any>;
  protected?: boolean;
  exact?: boolean;
  title?: string;
  description?: string;
  showHeader?: boolean;
  headerBackButton?: boolean;
}

interface Routes {
  [routeName: string]: Route;
}

export const routes: Routes = {
    login: {
    path: '/login',
    component: LoginPage,
    protected: false,
    title: 'Login',
    description: 'Sign in to your account',
    showHeader: false,
  },
  emailConfirm: {
    path: '/email-confirm',
    component: EmailConfirmation,
    protected: false,
    title: 'Confirm Email',
    description: 'Verify your email address',
    showHeader: false,
  },
  googleCallback: {
    path: '/google/callback',
    component: GoogleCallback,
    protected: false,
    title: 'Google Sign In',
    showHeader: false,
  },

    root: {
    path: '/',
    component: LibraryPage,
    protected: true,
    exact: true,
    title: 'Library',
    description: 'Library',
    showHeader: true,
  },
  // home: {
  //   path: '/home',
  //   component: HomePage,
  //   protected: true,
  //   title: 'Home',
  //   description: 'Discover new music',
  //   showHeader: true,
  // },
  search: {
    path: '/search',
    component: SearchPage,
    protected: true,
    title: 'Search',
    description: 'Find songs, artists, and albums',
    showHeader: true,
  },
  library: {
    path: '/library',
    component: LibraryPage,
    protected: true,
    title: 'Your Library',
    description: 'Your music collection',
    showHeader: true,
  },

  // Profile Routes
  profile: {
    path: '/profile',
    component: ProfilePage,
    protected: true,
    exact: true,
    title: 'Profile',
    description: 'Your profile',
    showHeader: true,
  },
  editProfile: {
    path: '/profile/edit',
    component: EditProfilePage,
    protected: true,
    title: 'Edit Profile',
    description: 'Update your information',
    showHeader: true,
    headerBackButton: true,
  },
  userProfile: {
    path: '/profile/:username',
    component: UserProfilePage,
    protected: true,
    title: 'User Profile',
    description: 'View user profile',
    showHeader: true,
    headerBackButton: true,
  },
  settings: {
    path: '/settings',
    component: SettingsPage,
    protected: true,
    title: 'Settings',
    description: 'App settings and preferences',
    showHeader: true,
    headerBackButton: true,
  },


  // playlist
  defaultPlaylist: {
    path: '/playlist/default/:slug',
    component: DefaultPlaylistPage,
    protected: true,
    showHeader: true,
    headerBackButton: true,
  },

  // Playlist Routes
  createPlaylist: {
    path: '/playlist/create',
    component: CreatePlaylistPage,
    protected: true,
    title: 'Create Playlist',
    description: 'Create a new playlist',
    showHeader: true,
    headerBackButton: true,
  },
  playlistDetail: {
    path: '/playlist/get/:id',
    component: PlaylistDetailPage,
    protected: true,
    exact: true,
    title: 'Playlist',
    description: 'View playlist',
    showHeader: true,
    headerBackButton: true,
  },
  editPlaylist: {
    path: '/playlist/edit/:id',
    component: EditPlaylistPage,
    protected: true,
    title: 'Edit Playlist',
    exact: true,
    description: 'Update playlist details',
    showHeader: true,
    headerBackButton: true,
  },

  // Artist & Album Routes
  artist: {
    path: '/artist/:id',
    component: ArtistPage,
    protected: true,
    title: 'Artist',
    description: 'View artist profile',
    showHeader: true,
    headerBackButton: true,
  },
  album: {
    path: '/album/:id',
    component: AlbumPage,
    protected: true,
    title: 'Album',
    description: 'View album details',
    showHeader: true,
    headerBackButton: true,
  },
};

// Helper to convert routes object to array for rendering
export const routesConfig = Object.values(routes);

// Helper to build paths with params
export const buildPath = (
  route: Route,
  params?: Record<string, string | number>
): string => {
  if (!params) return route.path;

  let path = route.path;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value));
  });

  return path;
};

export default routesConfig;