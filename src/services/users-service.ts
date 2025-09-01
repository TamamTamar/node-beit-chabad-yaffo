import { IJWTPayload, ILogin, IUpdateUserType, IUserInput } from "../@types/@types";
import User from "../db/models/user-model";
import MyErrors from "../errors/MyErrors";



import { authService } from "./auth-service";

export const usersService = {
  //update user
  updateUser: async (data: IUpdateUserType, id: string) => {
    // data.password = await authService.hashPassword(data.password);
    return User.findOneAndUpdate({ _id: id }, data, { new: true });
},

  //create user
  createUser: async (data: IUserInput) => {
    const user = new User(data);
    //replace the password with it's hash
    const hash = await authService.hashPassword(user.password);
    user.password = hash;
    return user.save();
  },

//login
  loginUser: async ({ email, password }: ILogin) => {
    const normalizedEmail = (email || "").trim().toLowerCase();
    const plain = (password || "").trim();

    // שימי לב: חובה לטעון את הסיסמה למרות select:false
    const user = await User.findOne({ email: normalizedEmail })
      .select("+password"); // ← זה המפתח

    if (!user) throw new MyErrors(401, "Invalid email or password");

    const ok = await authService.comparePassword(plain, (user as any).password);
    if (!ok) throw new MyErrors(401, "Invalid email or password");

    const payload: IJWTPayload = { _id: user._id.toString(), isAdmin: user.isAdmin };
    const token = authService.generateJWT(payload);

    return { token, user: { _id: user._id, email: user.email, isAdmin: user.isAdmin } };
  },


  //get all users
  getAllUsers: async () => User.find({}, { password: 0 }),

  //get user by id
  getUserById: async (id: string) => User.findById(id, { password: 0 }),

  //delete user
  deleteUser: async (id: string) => {
    const user = await User.findByIdAndDelete(id);
    if (!user)
      throw new MyErrors(404, "User not found");
    return user;
  },
};
