export type EmployeeStatus = "Active" | "On Leave";

export type AssetStatus = "Assigned" | "Active" | "Repair" | "Critical";

export type TicketStatus = "Open" | "In-Progress" | "Resolved";

export type TicketPriority = "Normal" | "High" | "Critical";

export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  extension: string;
  status: EmployeeStatus;
};

export type Asset = {
  id: string;
  name: string;
  serial: string;
  assigneeId: string;
  assignee: string;
  department: string;
  status: AssetStatus;
  warranty: string;
};

export type Ticket = {
  id: string;
  title: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  owner: string;
};

export type Activity = {
  id: string;
  title: string;
  status: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
};

export type CurrentUser = {
  name: string;
  role: string;
  initials: string;
};
