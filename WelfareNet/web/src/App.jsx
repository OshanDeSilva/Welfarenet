import { Routes, Route } from 'react-router-dom'
import Login from './authentication/Login.jsx'
import ForgotPassword from './authentication/ForgotPassword.jsx'
import ResetPassword from './authentication/ResetPassword.jsx'
import Topnotch from './components/Topnotch.jsx'
import Footer from './components/Footer.jsx'
import PresidentDashboard from './Pages/Commen/Dashboard.jsx'
import SecretaryDashboard from './Pages/Tresurer/SecretaryDashboard.jsx'
import CommunityFeed from './Pages/Commen/CommunityFeed.jsx'
import Announcements from './Pages/Commen/Announcement.jsx'
import MemberDetails from './Pages/President/MemberDetails.jsx'
import Complaints from './Pages/President/Complaints.jsx'
import Events from './Pages/Commen/Events.jsx'
import PaymentHandeling from './Pages/Tresurer/PaymentHandeling.jsx'
import MoreOptions from './Pages/President/MoreOptions.jsx'
import CreateAnnouncement from './Pages/Commen/CreateAnnouncement.jsx'
import CreateEvent from './Pages/President/CreateEvent.jsx'
import PaymentHistory from './Pages/Tresurer/PaymentHistory.jsx'
import OldComplaints from './Pages/President/OldComplaints.jsx'
import UserManagement from './Pages/President/UserManagement.jsx'
import EventAttendance from './Pages/President/EventAttendance.jsx'
import Expenses from './Pages/Tresurer/Expenses.jsx'
import AddExpenses from './Pages/Tresurer/AddExpenses.jsx'
import UnityStars from './Pages/Commen/UnityStars.jsx'
import RedemptionRequests from './Pages/Tresurer/RedemptionRequests.jsx'
import ManageReportedPosts from './Pages/President/ManageReportedPosts.jsx'
import EventCalendar from './Pages/Commen/EventCalendar.jsx'
import Dashboard from './Pages/Commen/Dashboard.jsx'
import MoreOptionsTresurer from './Pages/Tresurer/MoreOptionsTresurer.jsx'
import EventBudget from './Pages/Tresurer/EventBudget.jsx'
import { Calendar } from 'lucide-react'
import StarClaims from './Pages/Tresurer/StarClaims.jsx'
import Reports from './Pages/Commen/Reports.jsx'
import RegistrationRequestManagement from './Pages/President/RegistrationRequestManagement.jsx'
import PrivateRoute from './Routes/PrivateRoute.jsx'
import OldStarClaims from './Pages/Tresurer/OldStarClaims.jsx'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<><Topnotch /><Login /><Footer /></>} />
      <Route path="/forgot-password" element={<><Topnotch /><ForgotPassword /><Footer /></>} />
      <Route path="/forgot-password/reset-password/:email" element={<><Topnotch /><ResetPassword /><Footer /></>} />

    {/*Routs for president*/}
      <Route path="/president/dashboard" element={<PrivateRoute role="PRESIDENT"><Topnotch/><PresidentDashboard/><Footer/></PrivateRoute>}/>
      <Route path="/president/announcements" element={<PrivateRoute role="PRESIDENT"><Topnotch/><Announcements/><Footer/></PrivateRoute>}/>
      <Route path="/president/announcements/create" element={<PrivateRoute role="PRESIDENT"><Topnotch/><CreateAnnouncement/><Footer/></PrivateRoute>}/>
      <Route path="/president/feed" element={<PrivateRoute role="PRESIDENT"><Topnotch/><ManageReportedPosts/><Footer/></PrivateRoute>}/>
      <Route path="/president/member-details" element={<PrivateRoute role="PRESIDENT"><Topnotch/><MemberDetails/><Footer/></PrivateRoute>}/>
      <Route path="/president/complaints" element={<PrivateRoute role="PRESIDENT"><Topnotch/><Complaints/><Footer/></PrivateRoute>}/>
      <Route path="/President/complaints/view" element={<PrivateRoute role="PRESIDENT"><Topnotch/><OldComplaints/><Footer/></PrivateRoute>}/>
      <Route path="/president/events" element={<PrivateRoute role="PRESIDENT"><Topnotch/><Events/><Footer/></PrivateRoute>}/>
      <Route path="/President/events/create" element={<PrivateRoute role="PRESIDENT"><Topnotch/><CreateEvent/><Footer/></PrivateRoute>}/>
      <Route path="/President/events/:id/attendance" element={<PrivateRoute role="PRESIDENT"><Topnotch/><EventAttendance/><Footer/></PrivateRoute>}/>
      <Route path="/president/more" element={<PrivateRoute role="PRESIDENT"><Topnotch/><MoreOptions/><Footer/></PrivateRoute>}/> 
      <Route path="/President/users" element={<PrivateRoute role="PRESIDENT"><Topnotch/><UserManagement/><Footer/></PrivateRoute>}/>
      <Route path="/president/registration-requests" element={<PrivateRoute role="PRESIDENT"><Topnotch/><RegistrationRequestManagement/><Footer/></PrivateRoute>}/>
      <Route path="/President/calendar" element={<PrivateRoute role="PRESIDENT"><Topnotch/><EventCalendar/><Footer/></PrivateRoute>}/>
      <Route path="/President/unityStars" element={<PrivateRoute role="PRESIDENT"><Topnotch/><UnityStars/><Footer/></PrivateRoute>}/>
      <Route path="/President/reports" element={<PrivateRoute role="PRESIDENT"><Topnotch/><Reports/><Footer/></PrivateRoute>}/>
      
      
     
      
      
      {/*Only Tresurer should have Payment Handeling access*/ }
      <Route path='/treasurer/dashboard' element={<PrivateRoute role="TREASURER"><Topnotch/><Dashboard/><Footer/></PrivateRoute>}/>
      <Route path='/treasurer/announcements' element={<PrivateRoute role="TREASURER"><Topnotch/><Announcements/><Footer/></PrivateRoute>}/>
      <Route path='/treasurer/announcements/create' element={<PrivateRoute role="TREASURER"><Topnotch/><CreateAnnouncement/><Footer/></PrivateRoute>}/>
      <Route path='/treasurer/feed' element={<PrivateRoute role="TREASURER"><Topnotch/><ManageReportedPosts/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/payments" element={<PrivateRoute role="TREASURER"><Topnotch/><PaymentHandeling/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/payments/history" element={<PrivateRoute role="TREASURER"><Topnotch/><PaymentHistory/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/starClaims" element={<PrivateRoute role="TREASURER"><Topnotch/><StarClaims/><Footer/></PrivateRoute>}/>  
      <Route path="/treasurer/expenses" element={<PrivateRoute role="TREASURER"><Topnotch/><Expenses/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/expenses/add" element={<PrivateRoute role="TREASURER"><Topnotch/><AddExpenses/><Footer/></PrivateRoute>}/>  
      <Route path="/treasurer/calendar" element={<PrivateRoute role="TREASURER"><Topnotch/><EventCalendar/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/unityStars" element={<PrivateRoute role="TREASURER"><Topnotch/><UnityStars/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/unityStars/redemptions" element={<PrivateRoute role="TREASURER"><Topnotch/><RedemptionRequests/><Footer/></PrivateRoute>}/> 
      <Route path="/treasurer/more" element={<PrivateRoute role="TREASURER"><Topnotch/><MoreOptionsTresurer/><Footer/></PrivateRoute>}/> 
      <Route path="/treasurer/more/events" element={<PrivateRoute role="TREASURER"><Topnotch/><Events/><Footer/></PrivateRoute>}/> 
      <Route path="/treasurer/more/userManagement" element={<PrivateRoute role="TREASURER"><Topnotch/><UserManagement/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/event-budget/:id" element={<PrivateRoute role="TREASURER"><Topnotch/><EventBudget/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/more/reports" element={<PrivateRoute role="TREASURER"><Topnotch/><Reports/><Footer/></PrivateRoute>}/>
      <Route path="/treasurer/more/oldStarClaims" element={<PrivateRoute role="TREASURER"><Topnotch/><OldStarClaims/><Footer/></PrivateRoute>}/>

      {/*Routes for admin*/}
      <Route path="/admin/dashboard" element={<PrivateRoute role="ADMIN"><Topnotch/><Dashboard/><Footer/></PrivateRoute>}/>
      <Route path="/admin/announcements" element={<PrivateRoute role="ADMIN"><Topnotch/><Announcements/><Footer/></PrivateRoute>}/>
      <Route path="/admin/announcements/create" element={<PrivateRoute role="ADMIN"><Topnotch/><CreateAnnouncement/><Footer/></PrivateRoute>}/>
      <Route path="/admin/feed" element={<PrivateRoute role="ADMIN"><Topnotch/><CommunityFeed/><Footer/></PrivateRoute>}/>
      <Route path="/admin/events" element={<PrivateRoute role="ADMIN"><Topnotch/><Events/><Footer/></PrivateRoute>}/>
      <Route path="/admin/events/create" element={<PrivateRoute role="ADMIN"><Topnotch/><CreateEvent/><Footer/></PrivateRoute>}/>
      <Route path="/admin/users" element={<PrivateRoute role="ADMIN"><Topnotch/><UserManagement/><Footer/></PrivateRoute>}/>
      <Route path="/admin/calendar" element={<PrivateRoute role="ADMIN"><Topnotch/><EventCalendar/><Footer/></PrivateRoute>}/>
      <Route path="/admin/complaints" element={<PrivateRoute role="ADMIN"><Topnotch/><Complaints/><Footer/></PrivateRoute>}/>
      <Route path="/admin/complaints/view" element={<PrivateRoute role="ADMIN"><Topnotch/><OldComplaints/><Footer/></PrivateRoute>}/>
      <Route path="/admin/registration-requests" element={<PrivateRoute role="ADMIN"><Topnotch/><RegistrationRequestManagement/><Footer/></PrivateRoute>}/> 
      <Route path="/admin/more" element={<PrivateRoute role="ADMIN"><Topnotch/><MoreOptions/><Footer/></PrivateRoute>}/>
      
      

   
    </Routes>
  )
}

