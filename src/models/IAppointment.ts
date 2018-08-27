import { ICustomer } from './ICustomer';
import { ICalendarBranch } from './ICalendarBranch';
import { ICalendarService } from './ICalendarService';

export interface IAppointment {
  publicId?: string;
  status?: any;
  created?: number;
  updated?: number;
  start?: string;
  startTime?: string;
  numberOfCustomers?: number;
  custom?: string;
  customers?: ICustomer[];
  branch?: ICalendarBranch;
  services?: ICalendarService[];
  title?: string;
  notes?: string;
  allDay?: boolean;
  blocking?: boolean;
  end?: string;
  endTime?: string;
  deleted?: boolean;
  qpId?: number;
  id?: number;
}
