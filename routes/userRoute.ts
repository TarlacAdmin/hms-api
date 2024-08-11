// Purpose: Provide routes for user interactions with the database

import express, { Request, Response, NextFunction } from "express";
import { validationResult, body, param } from "express-validator";
import userService from "../services/userService";
import { config } from "../config/config";
import { API_ENDPOINTS } from "../config/endpointsConfig";
import logActivity from "../middleware/activityLogger";
import { CustomRequest } from "./types";

const router = express.Router();

router.route(API_ENDPOINTS.USER.GET_ALL).get(getUsers);
router.route(API_ENDPOINTS.USER.CREATE).post(createUser);
router.route(API_ENDPOINTS.USER.GET_BY_ID).get(getUser);
router.route(API_ENDPOINTS.USER.UPDATE).put(updateUser);
router.route(API_ENDPOINTS.USER.REMOVE).delete(deleteUser);
router.route(API_ENDPOINTS.USER.LOGIN).post(loginUser);
router.route(API_ENDPOINTS.USER.CHECKLOGIN).get(currentUser);
router.route(API_ENDPOINTS.USER.LOGOUT).get(logoutUser);
router.route(API_ENDPOINTS.USER.SEARCH).get(search);

/*
 * @desc   Get user
 * @route  GET /api/user/:id
 * @access Private
 */
async function getUser(req: Request, res: Response, next: NextFunction) {
  await param(config.VALIDATION.USER.ID)
    .isMongoId()
    .withMessage(config.ERROR.USER.INVALID_ID)
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  userService.getUser(req, res, next);
}

/*
 * @desc   Create user
 * @route  POST /api/user/create
 * @access Public
 */
async function createUser(req: Request, res: Response, next: NextFunction) {
  await Promise.all([
    body(config.VALIDATION.USER.EMAIL)
      .isEmail()
      .withMessage(config.ERROR.USER.INVALID_EMAIL)
      .run(req),
    body(config.VALIDATION.USER.EMAIL, config.VALIDATION.USER.PASSWORD)
      .notEmpty()
      .withMessage(config.ERROR.USER.REQUIRED_FIELDS)
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  userService.createUser(req, res, next);
}

/*
 * @desc   Update user
 * @route  PUT /api/user/update
 * @access Private
 */
async function updateUser(req: Request, res: Response, next: NextFunction) {
  await Promise.all([
    body(config.VALIDATION.USER.EMAIL)
      .isEmail()
      .withMessage(config.ERROR.USER.INVALID_EMAIL)
      .run(req),
    body(config.VALIDATION.USER.EMAIL, config.VALIDATION.USER.PASSWORD)
      .notEmpty()
      .withMessage(config.ERROR.USER.REQUIRED_FIELDS)
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  userService.updateUser(req, res, next);
}

/*
 * @desc   Remove user
 * @route  DELETE /api/user/remove
 * @access Private
 */
async function deleteUser(req: Request, res: Response, next: NextFunction) {
  await param(config.VALIDATION.USER.ID)
    .isMongoId()
    .withMessage(config.ERROR.USER.INVALID_ID)
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  userService
    .deleteUser(req, res, next)
    .then(async function (user) {
      res.status(200).send(user);
    })
    .catch(function (error) {
      res.status(400).send({ error: error.toString() });
    });
}

/*
 * @desc   Login user
 * @route  POST /api/user/login
 * @access Public
 */
async function loginUser(req: CustomRequest, res: Response, next: NextFunction) {
  await Promise.all([
    body(config.VALIDATION.USER.EMAIL)
      .isEmail()
      .withMessage(config.ERROR.USER.INVALID_EMAIL)
      .run(req),
    body(config.VALIDATION.USER.EMAIL, config.VALIDATION.USER.PASSWORD)
      .notEmpty()
      .withMessage(config.ERROR.USER.REQUIRED_FIELDS)
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await userService.loginUser(req, res, next);
    if (result && result.user && result.user.id) {
      req.user = result.user;
      if (req.user) {
        await logActivity(req.user.id, null, "login");
      } else {
        console.error("User is not available");
      }
    } else {
      console.error("User is not available");
    }
    res.status(200).send(result);
  } catch (error) {
    if (!res.headersSent) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).send({ error: errorMessage });
    }
  }
}

/*
 * @desc   Get all users
 * @route  GET /api/user/get/all
 * @access Public
 */
async function getUsers(req: Request, res: Response, next: NextFunction) {
  await userService.getUsers(req, res, next);
}

/*
 * @desc   Check login
 * @route  GET /api/user/login
 * @access Private
 */
async function currentUser(req: Request, res: Response, next: NextFunction) {
  await userService.currentUser(req, res, next);
}

/*
 * @desc   Logout user
 * @route  GET /api/user/logout
 * @access Private
 */
async function logoutUser(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.logoutUser(req, res, next);
    if (user && user._id) {
      if (req.user) {
        await logActivity(req.user.id, null, "logout");
      } else {
        console.error("User is not available");
      }
      res.status(200).json({ message: config.SUCCESS.USER.LOGOUT });
    } else {
      console.error("User is not available");
      res.status(400).send({ error: "User is not available" });
    }
  } catch (error) {
    if (!res.headersSent) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).send({ error: errorMessage });
    }
  }
}

/*
 * @desc   Search user
 * @route  GET /api/user/search
 * @access Private
 */
async function search(req: Request, res: Response, next: NextFunction) {
  await userService.search(req, res, next);
}

export default router;
