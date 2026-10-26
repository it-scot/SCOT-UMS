# CHANGELOG_STATE

- **Last Updated:** 2026-10-26 16:30 IST

## Current System Overview

Campus ERP monorepo with Google Workspace auth, HR/admin/helpdesk screens, and a working Employee Dashboard Home & Attendance module.

Completed modules:
- Auth (Google Workspace OAuth + JWT cookie, frontend Quick Dev Login)
- Employee persistence (employees, attendance, leave, HR requests, IT tickets, evaluations)
- Employee Dashboard Home & Attendance (summary API, out-of-office break, dinner allowance, React dashboard)

## Active Tech Stack & Dependencies

- Backend: Spring Boot 4.1, Java 21, Maven, Spring Data JPA, PostgreSQL, Lombok, Spring Security OAuth2
- Frontend: TanStack Start/Router, TanStack Query v5, Framer Motion, Lucide, Sonner, Tailwind 4, Radix dropdown-menu
- No new npm/Maven packages were added for this attendance module

## Database Schemas & Models Implemented

- `user_accounts` — Google identity, role, active flag
- `employees` — emp number, name, `@scot.lk` official email, designation, department, supervisor, shift, minimum departure
- `attendance_records` — daily punch, check-in/out, status, overtime, dinner claim, out-of-office break start/used minutes
- `leave_requests` — type, dates, approval status, supervisor comment
- `hr_requests` — service letter / salary confirmation
- `it_tickets` — category, priority, assignment
- `evaluations` — annual cycle scores

Relationships: child records `ManyToOne` → `Employee`; `Employee.directSupervisor` is a self-reference.

## API Endpoints Implemented

- `GET /api/health`
- `GET /api/auth/me`
- `GET /oauth2/authorization/google`
- `GET /api/v1/employee/dashboard-summary`
- `POST /api/v1/employee/attendance/out-of-office`
- `POST /api/v1/employee/attendance/claim-dinner-allowance`

## Recent Changes Log

### 2026-10-26 / Employee Dashboard Home & Attendance

Files created/modified:
- `backend/src/main/java/lk/scot/erp/controller/AttendanceController.java`
- `backend/src/main/java/lk/scot/erp/service/AttendanceService.java`
- `backend/src/main/java/lk/scot/erp/attendance/AttendancePolicy.java`
- `backend/src/main/java/lk/scot/erp/dto/DashboardSummaryResponse.java`
- `backend/src/main/java/lk/scot/erp/dto/OutOfOfficeResponse.java`
- `backend/src/main/java/lk/scot/erp/dto/DinnerAllowanceClaimResponse.java`
- `backend/src/main/java/lk/scot/erp/config/CampusTimeConfig.java`
- `backend/src/main/java/lk/scot/erp/entity/Attendance.java` (break fields)
- `backend/src/main/java/lk/scot/erp/repository/LeaveRequestRepository.java`
- `frontend/src/pages/employee/Dashboard.tsx`
- `frontend/src/hooks/use-employee-dashboard.ts`
- `frontend/src/types/employee-dashboard.ts`
- `frontend/src/data/employee-dashboard.ts`
- `frontend/src/utils/attendance.ts`
- `frontend/src/utils/api.ts`
- `frontend/src/routes/index.tsx`
- `frontend/src/pages/employee-dashboard.tsx` (re-export)
- `frontend/src/components/erp/StatusPill.tsx`

Key logic:
- Non-academic shift 08:00–17:00, academic 08:30–17:30 (`Asia/Colombo`)
- Time-to-leave = official end if early; check-in + 9 hours if late
- Dashboard GET provisions an employee from the signed-in account and simulates a ZKTeco check-in after 06:00
- Out-of-office toggle runs a 20-minute lunch counter
- Dinner claim (Rs. 700 + transport) only after 20:00 or a checkout past 20:00
- Frontend uses TanStack Query hooks, fallback seed data unless `VITE_USE_API=true`, and an 8:00 PM dinner popup

## Next Pending Tasks / To-Do

- Employee leave application and approval APIs/screens
- Wire real ZKTeco punches instead of simulated check-in
- MapStruct DTO layer for remaining employee APIs
- Replace Quick Dev Login with production Google Workspace session on the UI
- HR / Admin / Helpdesk backend APIs
