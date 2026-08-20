export interface CurrentUser {
    name: string;
    avatar: string;
    /** Left blank until the app has real authentication — fill in or wire up to the API. */
    role: string;
    email: string;
    phone: string;
    username: string;
}

/**
 * The signed-in user. There is no auth backend yet (see lib/utils/auth.tsx), so
 * this is the single place the UI reads the user from. Replace it with the
 * response of the login request once authentication is implemented.
 */
export const CURRENT_USER: CurrentUser = {
    name: 'Asilbek',
    avatar: '/images/avatar.png',
    role: '',
    email: '',
    phone: '',
    username: '',
};
