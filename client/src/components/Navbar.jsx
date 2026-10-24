
import { Link, useNavigate } from 'react-router-dom';

import {
  Package,
  Plus,
  UserRound,
  ClipboardList,
  LogIn,
  LogOut,
  House,
  ClipboardCheck,
} from 'lucide-react';
import NotificationBell from './NotificationBell';


import { useAuth } from '../context/useAuth';

export default function Navbar({ onReportClick }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  }

  function handleReportClick() {
    if (onReportClick) {
      onReportClick();
    } else {
      navigate('/?openReport=1');
    }
  }

  const linkClass =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Package size={22} />
          </span>

          <span>
            <span className="block text-xl font-bold tracking-tight">
              FindIt<span className="text-indigo-600">.</span>
            </span>
            <span className="block text-xs text-slate-500">
              Lost & Found Community
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-2"
        >
          <Link to="/" className={linkClass}>
            <House size={16} />
            Home
          </Link>

          {!loading && user?.isEmailVerified && (
            <>
              <Link to="/my-reports" className={linkClass}>
                <ClipboardList size={16} />
                My Reports
              </Link>

              <Link to="/claims" className={linkClass}>
                <ClipboardCheck size={16} />
                Claims
              </Link>
              <NotificationBell />

              <Link to="/profile" className={linkClass}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <UserRound size={16} />
                )}
                Profile
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={handleReportClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={17} />
            Report item
          </button>

          {!loading &&
            (user?.isEmailVerified ? (
              <>
                <span className="hidden max-w-36 truncate text-sm text-slate-500 lg:inline">
                  {user.name || user.email}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LogIn size={16} />
                Login
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}




// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Package,
//   Plus,
//   UserRound,
//   ClipboardList,
//   LogIn,
//   LogOut,
//   House,
// } from 'lucide-react';

// import { useAuth } from '../context/useAuth';

// export default function Navbar({ onReportClick }) {
//   const { user, loading, logout } = useAuth();
//   const navigate = useNavigate();

//   async function handleLogout() {
//     try {
//       await logout();
//       navigate('/', { replace: true });
//     } catch {
//       // AuthContext clears the local user in its finally block.
//       navigate('/', { replace: true });
//     }
//   }

//   function handleReportClick() {
//     if (onReportClick) {
//       onReportClick();
//     } else {
//       // From another page, return Home and open the report modal.
//       navigate('/?openReport=1');
//     }
//   }

//   return (
//     <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
//       <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
//         <Link to="/" className="flex shrink-0 items-center gap-3">
//           <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
//             <Package size={22} />
//           </span>

//           <span>
//             <span className="block text-xl font-bold tracking-tight">
//               FindIt<span className="text-indigo-600">.</span>
//             </span>
//             <span className="block text-xs text-slate-500">
//               Lost & Found Community
//             </span>
//           </span>
//         </Link>

//         <nav
//           aria-label="Main navigation"
//           className="flex flex-wrap items-center gap-2"
//         >
//           <Link
//             to="/"
//             className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
//           >
//             <House size={16} />
//             Home
//           </Link>

//           {!loading && user?.isEmailVerified && (
//             <>
//               <Link
//                 to="/my-reports"
//                 className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
//               >
//                 <ClipboardList size={16} />
//                 My Reports
//               </Link>

//               <Link
//                 to="/profile"
//                 className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
//               >
//                 {user.avatarUrl ? (
//                   <img
//                     src={user.avatarUrl}
//                     alt=""
//                     className="h-5 w-5 rounded-full object-cover"
//                   />
//                 ) : (
//                   <UserRound size={16} />
//                 )}
//                 Profile
//               </Link>
//             </>
//           )}

//           <button
//             type="button"
//             onClick={handleReportClick}
//             className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
//           >
//             <Plus size={17} />
//             Report item
//           </button>

//           {!loading &&
//             (user?.isEmailVerified ? (
//               <>
//                 <span className="hidden max-w-36 truncate text-sm text-slate-500 lg:inline">
//                   {user.name || user.email}
//                 </span>
//                 <button
//                   type="button"
//                   onClick={handleLogout}
//                   className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
//                 >
//                   <LogOut size={16} />
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <Link
//                 to="/login"
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
//               >
//                 <LogIn size={16} />
//                 Login
//               </Link>
//             ))}
//         </nav>
//       </div>
//     </header>
//   );
// }