// Objective: Create a custom interface that extends the Request interface from Express to include the user property.

import { Request } from "express";
import { UserModel } from "../models/userModel";
import { IActivityLogging } from "../models/activityLoggingModel";

export interface CustomRequest extends Request {
  user?: UserModel | IActivityLogging;
}
