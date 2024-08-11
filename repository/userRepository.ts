// Description: Repository for user model.
// Used for database operations related to user model.
import User, { UserModel } from "../models/userModel";

interface DbParams {
  query?: any;
  options?: {
    populateArray?: any[];
    select?: string;
    lean?: boolean;
    sort?: any;
    limit?: number;
  };
}

const userRepository = {
  getUser,
  getUsers,
  findByEmail,
  createUser,
  updateUser,
  deleteUser,
  search,
  findInactiveUsers,
  deleteUsersInactive,
  deactivateUsers,
  archiveUsers,
};

export default userRepository;

async function getUser(id: string, dbParams: DbParams = {}): Promise<UserModel | null> {
  try {
    let query = User.findById(id);

    (dbParams.options?.populateArray || []).forEach((populateOption) => {
      query = query.populate(populateOption);
    });

    const options = {
      select: dbParams.options?.select || "_id",
      lean: dbParams.options?.lean || true,
    };

    query = query.select(options.select).lean(options.lean);

    return query.exec();
  } catch (error) {
    throw error;
  }
}

async function getUsers(dbParams: DbParams): Promise<UserModel[]> {
  try {
    let query = User.find(dbParams.query);

    (dbParams.options?.populateArray || []).forEach((populateOption) => {
      query = query.populate(populateOption);
    });

    const options = {
      sort: dbParams.options?.sort || {},
      limit: dbParams.options?.limit || 10,
      select: dbParams.options?.select || "_id",
      lean: dbParams.options?.lean || true,
    };

    query = query.sort(options.sort).limit(options.limit).select(options.select).lean(options.lean);

    return query.exec();
  } catch (error) {
    throw error;
  }
}

async function findByEmail(email: string): Promise<UserModel | null> {
  try {
    return await User.findOne({ email });
  } catch (error) {
    throw error;
  }
}

async function createUser(data: Partial<UserModel>): Promise<UserModel | null> {
  try {
    let user = await User.create(data);
    const userWithoutPassword = await User.findById(user.id).select("-password").lean();
    return userWithoutPassword as UserModel | null;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id: string, data: Partial<UserModel>): Promise<UserModel | null> {
  try {
    return await User.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    throw error;
  }
}

async function deleteUser(id: string): Promise<UserModel | null> {
  try {
    return await User.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
}

async function search(query: string): Promise<UserModel[]> {
  try {
    return User.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(20);
  } catch (error) {
    throw error;
  }
}

async function findInactiveUsers(inactiveSince: Date): Promise<UserModel[]> {
  try {
    return await User.find({ lastActive: { $lt: inactiveSince } }).lean();
  } catch (error) {
    throw error;
  }
}

async function deleteUsersInactive(userIds: string[]): Promise<void> {
  try {
    await User.deleteMany({ _id: { $in: userIds } });
  } catch (error) {
    throw error;
  }
}

async function deactivateUsers(userIds: string[]): Promise<void> {
  try {
    await User.updateMany({ _id: { $in: userIds } }, { status: "deactivated" });
  } catch (error) {
    throw error;
  }
}

async function archiveUsers(userIds: string[]): Promise<void> {
  try {
    await User.updateMany({ _id: { $in: userIds } }, { status: "archived" });
  } catch (error) {
    throw error;
  }
}
