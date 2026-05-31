import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/guards/ProtectedRoute'
import { AdminRoute } from '../components/guards/AdminRoute'
import { AppShell } from '../components/layout/AppShell'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Dashboard } from '../pages/Dashboard'
import { UserList } from '../pages/users/UserList'
import { UserForm } from '../pages/users/UserForm'
import { WeeklySchedule } from '../pages/schedule/WeeklySchedule'
import { ScheduleForm } from '../pages/schedule/ScheduleForm'
import { ShiftSwap } from '../pages/schedule/ShiftSwap'
import { PersonnelDirectory } from '../pages/directory/PersonnelDirectory'
import { AnnouncementList } from '../pages/announcements/AnnouncementList'
import { AnnouncementForm } from '../pages/announcements/AnnouncementForm'
import { AnnouncementDetail } from '../pages/announcements/AnnouncementDetail'
import { ResourceList } from '../pages/resources/ResourceList'
import { ResourceForm } from '../pages/resources/ResourceForm'
import { BookingCalendar } from '../pages/bookings/BookingCalendar'
import { BookingForm } from '../pages/bookings/BookingForm'
import { ReportsPage } from '../pages/reports/ReportsPage'
import { Settings } from '../pages/settings/Settings'
import { PublicBoard } from '../pages/public/PublicBoard'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tablero" element={<PublicBoard />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/directorio" element={<PersonnelDirectory />} />
          <Route path="/anuncios" element={<AnnouncementList />} />
          <Route path="/anuncios/:id" element={<AnnouncementDetail />} />
          <Route path="/horarios" element={<WeeklySchedule />} />
          <Route path="/horarios/cambios" element={<ShiftSwap />} />
          <Route path="/recursos" element={<ResourceList />} />
          <Route path="/reservas" element={<BookingCalendar />} />
          <Route path="/reservas/nueva" element={<BookingForm />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/configuracion" element={<Settings />} />
          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<UserList />} />
            <Route path="/usuarios/nuevo" element={<UserForm />} />
            <Route path="/usuarios/:id/editar" element={<UserForm />} />
            <Route path="/horarios/nuevo" element={<ScheduleForm />} />
            <Route path="/horarios/:id/editar" element={<ScheduleForm />} />
            <Route path="/anuncios/nuevo" element={<AnnouncementForm />} />
            <Route path="/anuncios/:id/editar" element={<AnnouncementForm />} />
            <Route path="/recursos/nuevo" element={<ResourceForm />} />
            <Route path="/recursos/:id/editar" element={<ResourceForm />} />
            <Route path="/reservas/:id/editar" element={<BookingForm />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
