// Description: This file contains the user service responsible for handling user related operations.

import { Request, Response, NextFunction } from "express";
import userRepository from "../repository/userRepository";
import { config } from "../config/config";
import { trimAll } from "../helper/trimHelper";
import { generateToken, sendResponseCookie } from "../utils/token";
import * as bcrypt from "bcrypt";
import validator from "validator";
import { CustomRequest } from "./types";

const saltFactor = 10;

const userService = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  loginUser,
  currentUser,
  logoutUser,
  search,
  cleanUpInactiveUsers,
};

export default userService;

async function getUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const params = {
      populateArray: Array.isArray(req.query.populateArray)
        ? req.query.populateArray
        : [req.query.populateArray].filter(Boolean),
      select: req.query.select
        ? Array.isArray(req.query.select)
          ? req.query.select
          : [req.query.select]
        : ["_id"],
      lean: req.query.lean === "true",
    };

    const dbParams = {
      query: { _id: req.params.id },
      options: {
        populateArray: params.populateArray,
        select: params.select.join(" "),
        lean: params.lean,
      },
    };

    const user = await userRepository.getUser(req.params.id, dbParams);
    if (!user) {
      return res.status(400).json({ message: config.ERROR.USER.NOT_FOUND });
    }
    return res.status(200).json({ user });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}

async function getUsers(req: Request, res: Response, next: NextFunction): Promise<Response> {
  const params = {
    query: req.query.query || {},
    queryArray: req.query.queryArray,
    queryArrayType: req.query.queryArrayType,
    populateArray: Array.isArray(req.query.populateArray)
      ? req.query.populateArray
      : [req.query.populateArray].filter(Boolean),
    sort: req.query.sort,
    limit: parseInt(req.query.limit as string, 10),
    select: req.query.select
      ? Array.isArray(req.query.select)
        ? req.query.select
        : [req.query.select]
      : [],
    lean: req.query.lean === "true",
  };

  try {
    let dbParams: any = { query: { ...(params.query as object) } };

    if (params.queryArray) {
      let queryArrayObj: Record<string, any> = {};
      queryArrayObj[params.queryArrayType as string] = params.queryArray;
      dbParams.query = { ...dbParams.query, ...queryArrayObj };
    }

    if (params.populateArray.length > 0) {
      dbParams.options = dbParams.options || {};
      dbParams.options.populate = params.populateArray;
    }

    let optionsObj = {
      sort: params.sort,
      limit: params.limit,
      select: params.select ? params.select.join(" ") : undefined,
      lean: params.lean,
    };
    dbParams.options = { ...dbParams.options, ...optionsObj };
    const users = await userRepository.getUsers(dbParams);
    return res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}

async function createUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
  const trimmedBody = trimAll(req.body);
  try {
    const { email, password, username, firstname, lastname } = trimmedBody;

    const userAvailable = await userRepository.findByEmail(email);
    if (userAvailable) {
      return res.status(400).json({ message: config.ERROR.USER.ALREADY_EXIST });
    }

    const hashedPassword = await bcrypt.hash(password, saltFactor);

    const user = await userRepository.createUser({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: config.SUCCESS.USER.REGISTER, user });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}

async function updateUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const trimmedBody = trimAll(req.body);
  try {
    const { email, password, firstname, lastname, username, ...otherUpdates } = trimmedBody;

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: config.ERROR.USER.INVALID_EMAIL });
    }

    let updates: any = { ...otherUpdates };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    if (email) updates.email = email;
    if (firstname) updates.firstname = firstname;
    if (lastname) updates.lastname = lastname;
    if (username) updates.username = username;

    const updatedUser = await userRepository.updateUser(req.user!.id, updates);

    if (!updatedUser) {
      return res.status(400).json({ message: config.ERROR.USER.NOT_FOUND });
    }

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    return res.status(200).json({ message: config.SUCCESS.USER.UPDATE, user: userWithoutPassword });
  } catch (error) {
    if (error instanceof Error && (error as any).code === 11000) {
      return res.status(400).json({ message: config.ERROR.USER.EMAIL_ALREADY_EXISTS });
    } else {
      if (error instanceof Error) {
        return res
          .status(500)
          .json({ message: config.ERROR.USER.UPDATE_FAILED, error: error.message });
      } else {
        return res
          .status(500)
          .json({ message: config.ERROR.USER.UPDATE_FAILED, error: "Unknown error" });
      }
    }
  }
}

async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const user = await userRepository.getUser(req.params.id);
    if (!user) {
      return res.status(400).json({ message: config.ERROR.USER.NOT_FOUND });
    }
    const deletedUser = await userRepository.deleteUser(req.params.id);
    return res.status(200).json({ message: config.SUCCESS.USER.DELETE, user: deletedUser });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Unknown error" });
    }
  }
}

async function loginUser(req: Request, res: Response, next: NextFunction): Promise<any> {
  const trimmedBody = trimAll(req.body);
  try {
    const { email, password } = trimmedBody;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: config.ERROR.USER.NO_ACCOUNT });
    }

    if (user.status === "deactivated") {
      return res.status(403).json({ message: config.ERROR.USER.DEACTIVATED });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: config.ERROR.USER.INVALID_CREDENTIALS });
    }

    user.lastActive = new Date();
    await user.save();

    const userResponse = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };

    const token = generateToken(user);
    sendResponseCookie(res, token);

    return { user: userResponse, token };
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Unknown error" });
    }
  }
}

async function currentUser(
  req: CustomRequest,
  res: Response,
  _next: NextFunction
): Promise<Response> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: config.ERROR.USER.NOT_AUTHORIZED });
    }

    // Type guard to check if req.user is of type UserModel
    if ("password" in req.user) {
      const { password, ...userWithoutPassword } = req.user;
      return res.status(200).json({ user: userWithoutPassword, token: (req as any).token });
    } else {
      return res.status(400).json({ message: "User data is not complete" });
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Unknown error" });
    }
  }
}

async function logoutUser(req: CustomRequest, res: Response, next: NextFunction): Promise<any> {
  try {
    const user = req.user;

    res.clearCookie(config.JWTCONFIG.CLEAR_COOKIE, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Unknown error");
    }
  }
}

async function search(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const query = req.query.search as string;
    const users = await userRepository.search(query);
    return res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Unknown error" });
    }
  }
}

async function cleanUpInactiveUsers(): Promise<void> {
  try {
    const now = new Date();

    // Deactivate users who have been inactive for more than the threshold
    const deactivateSince = new Date(now);
    deactivateSince.setMonth(
      deactivateSince.getMonth() - config.CRON.CLEAN_UP.INACTIVE_USERS_DEACTIVATE_THRESHOLD
    );
    const usersToDeactivate = await userRepository.findInactiveUsers(deactivateSince);
    const deactivateUserIds = usersToDeactivate.map((user) => (user._id as string).toString());

    if (deactivateUserIds.length > 0) {
      await userRepository.deactivateUsers(deactivateUserIds);
      console.log(`Deactivated ${deactivateUserIds.length} users`);
    } else {
      console.log(config.ERROR.NO_DEACTIVE_USERS);
    }

    // Archive users who have been inactive for more than the archive threshold
    const archiveSince = new Date(now);
    archiveSince.setFullYear(
      archiveSince.getFullYear() - config.CRON.CLEAN_UP.INACTIVE_USERS_ARCHIVE_THRESHOLD
    );
    const usersToArchive = await userRepository.findInactiveUsers(archiveSince);
    const archiveUserIds = usersToArchive.map((user) => (user._id as string).toString());

    if (archiveUserIds.length > 0) {
      await userRepository.archiveUsers(archiveUserIds);
      console.log(`Archived ${archiveUserIds.length} users`);
    } else {
      console.log(config.ERROR.NO_ARCHIVE_USERS);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error(config.ERROR.UNEXPECTED);
    }
  }
}

// For testing purposes
// async function cleanUpInactiveUsers(): Promise<void> {
//   try {
//     const now = new Date();

//     // Deactivate users who have been inactive for more than the threshold
//     const deactivateSince = new Date(
//       now.getTime() - config.CRON.CLEAN_UP.INACTIVE_USERS_DEACTIVATE_THRESHOLD
//     );
//     const usersToDeactivate = await userRepository.findInactiveUsers(deactivateSince);
//     const deactivateUserIds = usersToDeactivate.map((user) => (user._id as string).toString());

//     if (deactivateUserIds.length > 0) {
//       await userRepository.deactivateUsers(deactivateUserIds);
//       console.log(`Deactivated ${deactivateUserIds.length} users`);
//     } else {
//       console.log(config.ERROR.NO_DEACTIVE_USERS);
//     }

//     // Archive users who have been inactive for more than the archive threshold
//     const archiveSince = new Date(
//       now.getTime() -
//         config.CRON.CLEAN_UP.INACTIVE_USERS_ARCHIVE_THRESHOLD * 365 * 24 * 60 * 60 * 1000
//     );
//     const usersToArchive = await userRepository.findInactiveUsers(archiveSince);
//     const archiveUserIds = usersToArchive.map((user) => (user._id as string).toString());

//     if (archiveUserIds.length > 0) {
//       await userRepository.archiveUsers(archiveUserIds);
//       console.log(`Archived ${archiveUserIds.length} users`);
//     } else {
//       console.log(config.ERROR.NO_ARCHIVE_USERS);
//     }
//   } catch (error) {
//     if (error instanceof Error) {
//       throw new Error(error.message);
//     } else {
//       throw new Error(config.ERROR.UNEXPECTED);
//     }
//   }
// }
