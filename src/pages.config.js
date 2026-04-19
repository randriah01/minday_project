/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminPanel from './pages/AdminPanel';
import SearchParcels from './pages/SearchParcels';
import PublishParcel from './pages/PublishParcel';
import UserProfile from './pages/UserProfile';
import ContactUs from './pages/ContactUs';
import Dashboard from './pages/Dashboard';
import DriverProfile from './pages/DriverProfile';
import HelpCenter from './pages/HelpCenter';
import Home from './pages/Home';
import LiveTracking from './pages/LiveTracking';
import MyTrips from './pages/MyTrips';
import MyVehicles from './pages/MyVehicles';
import Notifications from './pages/Notifications';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import PublishTrip from './pages/PublishTrip';
import SearchTrips from './pages/SearchTrips';
import Subscription from './pages/Subscription';
import TermsOfUse from './pages/TermsOfUse';
import TripDetails from './pages/TripDetails';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPanel": AdminPanel,
    "ContactUs": ContactUs,
    "Dashboard": Dashboard,
    "DriverProfile": DriverProfile,
    "HelpCenter": HelpCenter,
    "Home": Home,
    "LiveTracking": LiveTracking,
    "MyTrips": MyTrips,
    "MyVehicles": MyVehicles,
    "Notifications": Notifications,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "PublishTrip": PublishTrip,
    "SearchTrips": SearchTrips,
    "Subscription": Subscription,
    "TermsOfUse": TermsOfUse,
    "TripDetails": TripDetails,
    "SearchParcels": SearchParcels,
    "PublishParcel": PublishParcel,
    "UserProfile": UserProfile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};