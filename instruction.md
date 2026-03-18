CARWASH APPLICATION — COMPLETE SPECIFICATION DOCUMENT
1. APP OVERVIEW
Purpose: Car wash business management system for scheduling appointments, managing clients, and managing workers.

Target Users: Car wash business owners / admins

Core Features:

Appointment scheduling with conflict detection
Client management
Worker management
Multi-language UI (English + Hebrew with RTL)
Firebase-authenticated access
Calendar views (daily/weekly) for appointments
2. TECH STACK
Frontend
Technology	Version
React	^19.0.0
TypeScript	~5.7.2
Vite	^6.2.5
React Router DOM	^7.5.0
Redux Toolkit	^2.6.1
Redux Persist	^6.0.0
React Redux	^9.2.0
TanStack React Query	^5.71.10
React Hook Form	^7.55.0
@hookform/resolvers	^5.0.1
Zod	^3.24.2
Axios	^1.8.4
Firebase	^11.6.0
i18next	^24.2.3
react-i18next	^15.4.1
i18next-browser-languagedetector	^8.0.4
i18next-http-backend	^3.0.2
Tailwind CSS	^4.1.3
@tailwindcss/vite	^4.1.3
tailwind-merge	^3.1.0
tailwindcss-animate	^1.0.7
tw-animate-css	^1.2.5
class-variance-authority	^0.7.1
clsx	^2.1.1
Radix UI (all packages)	various (see below)
@radix-ui/react-checkbox	^1.1.4
@radix-ui/react-dialog	^1.1.6
@radix-ui/react-dropdown-menu	^2.1.6
@radix-ui/react-label	^2.1.2
@radix-ui/react-navigation-menu	^1.2.5
@radix-ui/react-popover	^1.1.6
@radix-ui/react-select	^2.1.6
@radix-ui/react-separator	^1.1.2
@radix-ui/react-slot	^1.1.2
@radix-ui/react-switch	^1.1.3
@radix-ui/react-toast	^1.2.6
@radix-ui/react-tooltip	^1.1.8
lucide-react	^0.487.0
date-fns	^4.1.0
react-day-picker	^9.6.4
sonner	^2.0.3
cmdk	^1.1.1
Backend
Technology	Version
Node.js	(runtime)
Express	~4.16.1
Mongoose	^8.13.2
Firebase Admin SDK	^13.2.0
dotenv	^16.4.7
cors	^2.8.5
helmet	^8.1.0
morgan	~1.9.1
cookie-parser	~1.4.4
http-errors	~1.6.3
debug	~2.6.9
pug	2.0.0-beta11
3. PROJECT STRUCTURE

c:\Developer\CarWash
├── Client/                         # React frontend (Vite)
│   ├── public/
│   │   └── locales/                # i18n translation files
│   │       ├── en/translation.json
│   │       └── he/translation.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/              # Primitive UI: Button, Input, Label
│   │   │   ├── molecules/          # Compound: FormField, LanguageToggle, NavLink
│   │   │   ├── organisms/          # Complex: AppointmentDialogs, AppointmentForm,
│   │   │   │                       # AuthForm, ClientDetails, ClientForm,
│   │   │   │                       # DailyCalendar, Header, WeeklyCalendar
│   │   │   ├── ui/                 # Shadcn/Radix UI wrappers
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ProtectedRoute.tsx  # Auth guard component
│   │   ├── hooks/
│   │   │   ├── useAppointmentMutations.ts
│   │   │   └── useDebounce.ts
│   │   ├── layout/
│   │   │   └── MainLayout.tsx      # Shell with Header + Outlet
│   │   ├── lib/
│   │   │   ├── react-query.ts      # QueryClient config
│   │   │   └── utils.ts            # cn(), time conversion utilities
│   │   ├── pages/
│   │   │   ├── AddAppointment.tsx
│   │   │   ├── AddWorker.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── NewClient.tsx
│   │   │   └── Workers.tsx
│   │   ├── routes/
│   │   │   └── index.tsx           # React Router route tree
│   │   ├── services/
│   │   │   └── api.ts              # Axios API functions + types
│   │   ├── store/
│   │   │   ├── index.ts            # Redux store + persist config
│   │   │   └── slices/
│   │   │       └── authSlice.ts    # Auth state + thunks
│   │   ├── App.tsx                 # QueryClientProvider + ReduxProvider + Router
│   │   ├── firebase.ts             # Firebase app init + GoogleAuthProvider
│   │   ├── i18n.ts                 # i18next config
│   │   ├── main.tsx                # Entry point + RTL detection
│   │   └── vite-env.d.ts
│   ├── components.json             # Shadcn config
│   ├── eslint.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   └── vite.config.ts
│
├── Server/                         # Express backend
│   ├── controllers/
│   │   ├── appointmentsController.js
│   │   ├── clientsController.js
│   │   └── workersController.js
│   ├── middleware/
│   │   ├── auth.js                 # Firebase token verification middleware
│   │   └── firebaseAuth.js         # Duplicate of auth.js
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Client.js
│   │   └── Worker.js
│   ├── routes/
│   │   ├── appointments.js
│   │   ├── clients.js
│   │   └── workers.js
│   ├── dist/                       # Build output
│   ├── server.js                   # Express entry point
│   └── package.json
│
└── CarWashAdminAPI.postman_collection.json  # Postman collection
4. DATABASE MODELS
Client Model (Server/models/Client.js)

{
  name:      { type: String, required: true },
  email:     { type: String },
  phone:     { type: String },
  notes:     { type: String },
  carType:   { type: String, enum: ['small', 'medium', 'large', 'motorcycle'] },
  isActive:  { type: Boolean, default: true },
  createdAt: Date,  // auto via timestamps: true
  updatedAt: Date   // auto via timestamps: true
}
Indexes: MongoDB default _id only. timestamps: true option.

Worker Model (Server/models/Worker.js)

{
  name:        { type: String, required: true },
  email:       { type: String },
  phone:       { type: String },
  specialties: { type: [String], default: [] },
  isActive:    { type: Boolean, default: true },
  createdAt:   Date,
  updatedAt:   Date
}
Availability Logic (hardcoded in controller):

Available slots: 08:30 → 20:30 in 1-hour increments
Appointment Model (Server/models/Appointment.js)

{
  clientId:        { type: ObjectId, ref: 'Client', required: true },
  workerId:        { type: ObjectId, ref: 'Worker', required: true },
  serviceType:     { type: String, required: true },
                   // used values: 'basic' | 'premium' | 'deluxe'
  startTime:       { type: Date, required: true },
  status:          { type: String,
                     enum: ['pending','confirmed','completed','cancelled'],
                     default: 'pending' },
  notes:           { type: String },
  carType:         { type: String },           // legacy field
  isPickedUp:      { type: Boolean, default: false },
  pickupLocation:  { type: String },
  vehicleType:     { type: String,
                     enum: ['small','5-seater','7-seater'] },
  createdAt:       Date,
  updatedAt:       Date
}
Instance Method:


appointmentSchema.methods.conflictsWith = function(startTime) {
  // Returns true if startTime falls within ±59 minutes of this.startTime
  const duration = 59 * 60 * 1000;
  return Math.abs(this.startTime - startTime) < duration;
};
5. API ENDPOINTS
Server Base
Development: http://localhost:5001
Production: https://carwash-api-zsny.onrender.com
All routes prefixed: /api
All routes require: Authorization: Bearer <Firebase ID Token>
Clients — /api/clients
Method	Path	Description	Request	Response
GET	/api/clients	Get all clients	—	Client[]
GET	/api/clients/search?name=:query	Search clients by name	query param: name	{ _id, name }[] (max 10)
GET	/api/clients/:id	Get client by ID	—	Client
POST	/api/clients	Create client	{ name, email?, phone?, notes?, carType, isActive? }	Client (201)
PUT	/api/clients/:id	Update client	Same as POST	Client
DELETE	/api/clients/:id	Delete client	—	{ message }
Search implementation: Case-insensitive regex on name field, returns only _id and name.

Workers — /api/workers
Method	Path	Description	Request	Response
GET	/api/workers	Get all workers	—	Worker[]
GET	/api/workers/name/:name	Get worker by name	path param: name	Worker (case-insensitive regex)
GET	/api/workers/:id	Get worker by ID	—	Worker
GET	/api/workers/:workerId/availability?date=:date	Get worker availability	query: date (ISO date string)	{ workerId, date, availableSlots, bookedSlots, appointments }
POST	/api/workers	Create worker	{ name, email?, phone?, specialties?, isActive? }	Worker (201)
PUT	/api/workers/:id	Update worker	Same as POST	Worker
DELETE	/api/workers/:id	Delete worker	—	{ message }
Availability response shape:


{
  "workerId": "ObjectId",
  "date": "ISO date string (start of day)",
  "availableSlots": [{ "start": "Date", "end": "Date" }],
  "bookedSlots":    [{ "start": "Date", "end": "Date" }],
  "appointments":   [Appointment]
}
Slots generated from 08:30 to 20:30, 1-hour increments. Cancelled appointments excluded.

Appointments — /api/appointments
Method	Path	Description	Request	Response
GET	/api/appointments	Get all appointments (populated)	—	Appointment[]
GET	/api/appointments/:id	Get by ID (populated)	—	Appointment
GET	/api/appointments/worker/:workerId	Get by worker (sorted by startTime)	—	Appointment[]
GET	/api/appointments/client/:clientId	Get by client (sorted by startTime)	—	Appointment[]
POST	/api/appointments	Create appointment	See below	Appointment (201) or 409/400
POST	/api/appointments/:id/switch-status/:status	Switch status	path param: status	Appointment
PUT	/api/appointments/:id	Update appointment	Same as create	Appointment
DELETE	/api/appointments/:id	Delete appointment	—	{ message }
Create/Update Request Body:


{
  "clientId":       "ObjectId (required)",
  "workerId":       "ObjectId (required)",
  "serviceType":    "basic | premium | deluxe (required)",
  "startTime":      "ISO datetime string (required)",
  "status":         "pending | confirmed | completed | cancelled",
  "notes":          "string (optional)",
  "isPickedUp":     "boolean (optional)",
  "pickupLocation": "string (optional)",
  "vehicleType":    "small | 5-seater | 7-seater (optional)"
}
Business Logic — Create/Update:

Verify worker exists → 404 if not
Check business hours: startTime must be between 05:30 and 18:30 → 400 if not
Query conflicts:

{
  workerId,
  status: { $nin: ['cancelled'] },
  startTime: {
    $gte: new Date(startTime - 59 * 60 * 1000),
    $lte: new Date(startTime + 59 * 60 * 1000)
  }
}
For updates: also exclude { _id: { $ne: id } } from conflict query
If conflicts found → 409 with { message, conflicts: Appointment[] }
Populate response: clientId (name, email, phone), workerId (name, email)
6. AUTHENTICATION & AUTHORIZATION
Backend Auth Middleware (Server/middleware/auth.js)

// Pseudocode
async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const idToken = header.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
Applied to all API routes via router.use(auth) in each route file.

Firebase Admin Initialization (Server/server.js)

admin.initializeApp({
  credential: admin.credential.cert({
    projectId:    process.env.FIREBASE_PROJECT_ID,
    clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:   process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
Frontend Firebase Config (Client/src/firebase.ts)

const firebaseConfig = {
  apiKey:            "AIzaSyAEADD_jN1mWzx74PI7I3CD1wEYQQsGJNY",
  authDomain:        "carwash-9b3c6.firebaseapp.com",
  projectId:         "carwash-9b3c6",
  storageBucket:     "carwash-9b3c6.firebasestorage.app",
  messagingSenderId: "867633346945",
  appId:             "1:867633346945:web:d9bb68a1dfca79f6669080",
  measurementId:     "G-LVLH85X7HR",
};
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
API Client Token Injection (Client/src/services/api.ts)

apiClient.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401)
      window.location.href = '/auth';
    return Promise.reject(error);
  }
);
Protected Route (Client/src/components/ProtectedRoute.tsx)
Wraps all non-auth routes. Reads user from Redux auth state. Redirects to /auth if null.

Roles
No role-based access control — all authenticated users have full access to all endpoints.

7. BUSINESS LOGIC
Appointment Duration
Fixed: 59 minutes (hardcoded, not configurable)
Business Hours
Appointment creation allowed: 05:30 – 18:30
Worker availability display: 08:30 – 20:30
Conflict Detection
A new appointment conflicts if another non-cancelled appointment for the same worker exists within ±59 minutes of the requested startTime
Conflict returns HTTP 409 with the conflicting appointments array
Status Lifecycle

pending → confirmed → completed
           ↓
        cancelled  (can be set from any state via switch-status endpoint)
Client Search
Triggered on name input with 300ms debounce
Case-insensitive regex match
Returns max 10 results (only _id and name)
Pickup Service
isPickedUp: true enables pickupLocation field
Shown in appointments list with car icon tooltip
Appointment Creation Flow (Frontend)
If "new client" toggled: POST /api/clients first, capture returned _id
POST /api/appointments with clientId
On 409: Show "worker unavailable" dialog
On success: Navigate to /appointments
8. FRONTEND ROUTES & PAGES
Route Tree (Client/src/routes/index.tsx)

/ → redirect to /dashboard              (ProtectedRoute > MainLayout)
/auth                                   (public, lazy)
/dashboard                              (lazy)
/appointments                           (lazy) — list page
/appointments/new                       (lazy) — create form
/clients                                (lazy) — list page
/clients/new                            (lazy) — create form
/workers                                (lazy) — list page
/workers/new                            (lazy) — create form
All protected routes are wrapped with <ProtectedRoute> and rendered inside <MainLayout> (Header + <Outlet>).

All pages are lazy loaded with React.lazy() and <Suspense fallback={<LoadingSpinner />}>.

Page: Auth (/auth)
Toggle: Sign In / Sign Up
Email + Password inputs
Google sign-in button
Dispatches: signIn, signUp, signInWithGoogle thunks
Shows loading state during auth
Shows error alert on failure
No redirect if already authenticated (ProtectedRoute handles that)
Page: Dashboard (/dashboard)
Static content only (no API calls)
4 stat cards: Total Appointments, Active Clients, Staff Members, Revenue
Recent Appointments placeholder card
Quick Stats (Basic 45%, Premium 35%, Deluxe 20%)
Page: Appointments (/appointments)
Fetches all appointments via getAppointments() on mount
Toggle: Daily Calendar / Weekly Calendar (desktop only)
Calendar navigation: previous/next day or week
Desktop table columns: Client, Worker, Start Time, Service Type, Vehicle Type, Status (dropdown), Actions
Mobile: Daily calendar view only
Status dropdown per row with color coding:
pending: bg-yellow-100
confirmed: bg-blue-100
completed: bg-green-100
cancelled: bg-red-100
Edit button → opens edit dialog (<AppointmentDialogs>)
Delete button → opens delete confirmation
Pickup indicator: Car icon with location tooltip
RTL support based on i18n.language === 'he'
Page: AddAppointment (/appointments/new)
Client selector with toggle: "new client" vs "existing client"
Existing: Combobox with debounced search
New: Embedded <ClientForm hideSubmitButton={true} />
Worker selector dropdown (auto-selects last worker by default)
datetime-local input (step=900, i.e. 15-minute increments)
Service type select: basic / premium / deluxe
Vehicle type select: small / 5-seater / 7-seater
Pickup toggle + conditional pickup location input
On 409 conflict: shows dialog with conflict details
Page: Clients (/clients)
Fetches all clients via useQuery({ queryKey: ['clients'], queryFn: getClients })
Table: Name, Car Type (hidden mobile), Contact (phone/SMS/WhatsApp links), Actions
Click name → opens <ClientDetails> dialog
Delete button → confirmation dialog → deleteClient(id) mutation
Toast on success/error
Page: NewClient (/clients/new)
Renders <ClientForm> component
On submit: createClient(data) → navigate to /clients
Page: Workers (/workers)
Fetches workers via useQuery({ queryKey: ['workers'], queryFn: fetchWorkers })
Table: Name (UserCircle icon), Status (hardcoded "Active"), Actions
Delete with confirmation dialog → deleteWorkerMutation
Page: AddWorker (/workers/new)
Zod-validated form
Fields: Name, Email, Phone, Specialties (checkboxes), Active status
Specialties options: exterior-wash, interior-cleaning, detailing, polishing
On submit: POST /api/workers → navigate to /workers
9. KEY COMPONENTS
<ProtectedRoute>
Reads Redux state.auth.user. If null → <Navigate to="/auth" replace />. Otherwise renders children.

<MainLayout>
Shell component: renders <Header /> + <Outlet /> (React Router nested route outlet).

<Header>
Logo "Car Wash" (links to /)
Nav links: Dashboard, Clients, Workers, Appointments (translated)
Mobile: hamburger menu (collapsible state)
<LanguageToggle> component
Logout button: calls signOut(auth) then navigate('/auth')
<ClientForm>
Props:


{
  initialData?: Partial<ClientFormValues>;
  onSubmit: (data: ClientFormValues) => void;
  isLoading?: boolean;
  hideSubmitButton?: boolean;
}
When hideSubmitButton={true}: uses watch() to auto-call onSubmit whenever form is valid and values change. Used for inline client creation inside AddAppointment page.

<AppointmentForm>
Props:


{
  initialData?: Partial<AppointmentFormValues>;
  onSubmit: SubmitHandler<AppointmentFormValues>;
  isLoading?: boolean;
}
Contains client combobox, worker combobox, datetime input, service type, vehicle type, pickup toggle + location field. All fields use react-hook-form + Zod.

<WeeklyCalendar>
Props:


{
  appointments: Appointment[];
  currentDate?: Date;
  onAppointmentClick?: (appointment: Appointment) => void;
}
Business hours: 8 AM – 9 PM
Hour height: 80px
Service colors: basic=bg-blue-100, premium=bg-purple-100, deluxe=bg-amber-100
Status opacity: pending=0.9, confirmed=1.0, completed=0.5, cancelled=0.3 + line-through
<DailyCalendar>
Same props as WeeklyCalendar. Shows single day with hourly grid.

<AppointmentDialogs>
Manages three dialogs: Edit Appointment, Delete Confirmation, Appointment Details.

Props: selected appointment, open states, mutation handlers.

<LanguageToggle>
Calls i18n.changeLanguage('en' | 'he'). Updates document.documentElement.dir.

<LoadingSpinner>
Full-page centered spinner used as Suspense fallback.

<ErrorBoundary>
Class component wrapping the app. Shows fallback UI on render errors.

10. STATE MANAGEMENT
Redux Store

// Persisted to localStorage
store = {
  auth: AuthState  // persisted whitelist: ['user']
}
Auth Slice State

interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  loading: boolean;   // initial: true
  error: string | null;
}
Auth Slice Thunks
Thunk	Firebase Method	Returns
signIn({ email, password })	signInWithEmailAndPassword	SerializedUser
signUp({ email, password })	createUserWithEmailAndPassword	SerializedUser
signOut()	firebaseSignOut	null
signInWithGoogle()	signInWithPopup(googleProvider)	SerializedUser
All thunks follow: pending → loading=true, fulfilled → user=payload, loading=false, rejected → error=payload, loading=false.

React Query Config

{
  staleTime: 1000 * 60 * 5,   // 5 minutes
  gcTime:    1000 * 60 * 30,  // 30 minutes
}
Query Keys:

['clients']
['workers']
['appointments']
11. FORMS & VALIDATION
Client Form (Zod Schema)

z.object({
  name:     z.string().min(2),
  email:    z.string().email().optional().or(z.literal("")),
  phone:    z.string().optional(),
  notes:    z.string().optional(),
  carType:  z.enum(["small", "medium", "large", "motorcycle"]),
  isActive: z.boolean(),
})
Fields: Name (text), Email (email), Phone (text), Car Type (select), Notes (textarea), Active (checkbox)

Appointment Form (Zod Schema)

z.object({
  clientId:       z.string().min(1, "Please select a client"),
  workerId:       z.string().min(1, "Please select a worker"),
  startTime:      z.string().min(1, "Please select a start time"),
  serviceType:    z.enum(["basic", "premium", "deluxe"]),
  status:         z.enum(["pending", "confirmed", "completed", "cancelled"]),
  isPickedUp:     z.boolean(),
  pickupLocation: z.string().optional(),
  vehicleType:    z.enum(["small", "5-seater", "7-seater"]),
})
Fields: Client (combobox), Worker (combobox), Start Time (datetime-local, step=900), Service Type (select), Vehicle Type (select), Pickup (switch), Pickup Location (text, conditional), Status (select)

Worker Form (Zod Schema)

z.object({
  name:        z.string().min(2, "Name must be at least 2 characters"),
  email:       z.string().email("Invalid email address").optional().or(z.literal("")),
  phone:       z.string().min(10, "Phone number must be at least 10 digits"),
  specialties: z.array(z.string()),
  isActive:    z.boolean(),
})
Fields: Name (text), Email (email), Phone (text), Specialties (checkboxes: exterior-wash / interior-cleaning / detailing / polishing), Active (checkbox)

12. ENVIRONMENT VARIABLES
Server (.env)
Variable	Description
MONGO_URI	MongoDB connection string
PORT	Server port (default: 5001)
FIREBASE_PROJECT_ID	Firebase project ID
FIREBASE_CLIENT_EMAIL	Firebase service account email
FIREBASE_PRIVATE_KEY	Firebase service account private key (newlines as \\n)
Client (.env)
Variable	Description
VITE_BASE_URL	API base URL (e.g. http://localhost:5001)
VITE_MODE	If 'development', proxy targets localhost:5001; else targets production URL
Vite Proxy Config

server: {
  proxy: {
    '/api': {
      target: process.env.VITE_MODE === 'development'
        ? 'http://localhost:5001'
        : 'https://carwash-api-zsny.onrender.com',
      changeOrigin: true,
      secure: false,
    },
  },
}
13. i18n / LANGUAGES
Config (Client/src/i18n.ts)
Supported languages: en (English), he (Hebrew)
Fallback: en
Backend: i18next-http-backend, load path /locales/{{lng}}/{{ns}}.json
Detection order: localStorage → navigator
Cache: localStorage
Debug: true
Escape interpolation: false
RTL Support (Client/src/main.tsx)

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
});
Translation Key Structure (en/translation.json)

{
  "app":        { "title": "Car Wash Service" },
  "auth":       { "login", "signup", "email", "password", "logout" },
  "navigation": { "dashboard", "appointments", "clients", "workers" },
  "common":     { "loading", "save", "saving", "cancel", "delete", "edit", "close" },
  "appointments": {
    "title", "subtitle", "add", "all", "all_description", "loading", "error", "no_appointments",
    "calendar": { "title", "description", "daily", "weekly" },
    "table":    { "client", "worker", "start_time", "service_type", "vehicle_type", "status", "actions" },
    "status":   { "completed", "pending", "confirmed", "cancelled", "update" },
    "vehicle_types":  { "small", "5-seater", "7-seater" },
    "service_types":  { "basic", "premium", "deluxe" },
    "pickup":   { "service", "location" },
    "form":     { "client", "worker", "start_time", "service_type", "vehicle_type", "status", "pickup", "pickup_location" },
    "edit":     { "title", "description", "saving" },
    "delete":   { "title", "description", "deleting", "confirm", "success", "error" },
    "update":   { "success", "error" },
    "details":  { "title", "description" }
  }
}
Hebrew translations mirror the same key structure in he/translation.json.

14. UTILITY FUNCTIONS
Client/src/lib/utils.ts

// Merge Tailwind classes
cn(...inputs: ClassValue[]): string
// Uses clsx + tailwind-merge

// Convert datetime-local string to ISO string for API
localToServerTime(localDateTimeString: string): string
// Input:  "2024-03-15T09:30"
// Output: ISO string (no timezone shift applied)

// Convert ISO string from API to datetime-local format
serverToLocalTime(isoString: string): string
// Input:  "2024-03-15T09:30:00.000Z"
// Output: "2024-03-15T09:30"

// Format ISO string for display
formatTimeForDisplay(utcTimeString: string, options?: Intl.DateTimeFormatOptions): string
// Default timezone: "Asia/Jerusalem"
// Default: dateStyle: "short", timeStyle: "short"
// Locale: "en-IL"
Client/src/hooks/useDebounce.ts

function useDebounce<T>(value: T, delay: number): T
// Returns debounced value after `delay` ms
// Clears timeout on value/delay change
Client/src/hooks/useAppointmentMutations.ts
Returns { statusMutation, updateMutation, deleteMutation }:

statusMutation: Optimistic update — snapshots current appointments query data, applies status change locally, reverts on error. Shows sonner toast on success/error. Refetches on settle.
updateMutation: Invalidates ['appointments'] on success. Shows toast.
deleteMutation: Invalidates ['appointments'] on success. Shows toast.
15. SPECIAL FEATURES
Calendar Views
Two calendar components for the Appointments page:

WeeklyCalendar: 7-column grid, 8AM–9PM range, appointment blocks positioned by time offset. 80px per hour. Color-coded by service type.

DailyCalendar: Single day view, same time range and positioning logic.

Pickup Service
Optional feature on appointments:

Boolean field isPickedUp
String field pickupLocation (shown only when isPickedUp=true)
In appointment list: car icon with tooltip displaying location
Contact Actions
In the Clients list, phone number supports three actions:

Direct phone call (tel: link)
SMS (sms: link)
WhatsApp (https://wa.me/ link)
Optimistic Updates
Status mutation on appointments page uses React Query optimistic update pattern:

Snapshot current query cache
Apply update locally
On error: restore snapshot
On settle: refetch from server
Toast Notifications
Uses sonner library (^2.0.3) for all success/error feedback messages.

Deployment
Frontend + Backend both deployed on Render
Frontend URL: https://carwash-3ocb.onrender.com
Backend URL: https://carwash-api-zsny.onrender.com
CORS configured to allow both production frontend and http://localhost:5173
End of specification document. All field names, enum values, route paths, component props, validation rules, and business logic captured from source code.