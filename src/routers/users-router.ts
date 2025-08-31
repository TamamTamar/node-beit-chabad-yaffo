import { Router } from "express";

import { usersService } from "../services/users-service";
import { isSelf } from "../middleware/is-self";
import { validateLogin, validateUpdateUser, validateUser } from "../middleware/joi";
import { isAdminOrSelf } from "../middleware/is-admin-or-self";


const router = Router();


//update user
router.put("/:id", ...isSelf, validateUpdateUser, async (req, res, next) => {
  try {
    const saved = await usersService.updateUser(req.body, req.payload._id);
    res.json(saved);
  } catch (e) {
    next(e);
  }
});







//login
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    const jwt = await usersService.loginUser(req.body);
    res.send(jwt);
  } catch (e) {
    next(e);
  }
});

//create user
router.post("/", validateUser, async (req, res, next) => {
  try {
    const result = await usersService.createUser(req.body);
    const { password, ...saved } = result.toJSON();
    //return all data but saved!
    res.status(201).json(saved);
  } catch (e) {
    next(e);
  }
});

//delete user
router.delete("/:id", isAdminOrSelf, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const deletedUser = await usersService.deleteUser(userId);
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (e) {
    next(e);
  }
});

export { router as usersRouter };
