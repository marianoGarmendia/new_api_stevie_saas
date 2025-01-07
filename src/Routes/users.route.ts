import { firestoreDB } from "@/Firebase/firebaseAdmin.config";
import { firebaseApp, db } from "@/Firebase/firebase.config";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  getFirestore,
} from "firebase/firestore";

// import type { User } from "@/types/firestore.types";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import type { Request, Response } from "express";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { firestore } from "firebase-admin";

export const userRouter = Router();

const userRef = collection(db, "users");

const userCollectionRef = firestoreDB.collection("users");

const auth = getAuth(firebaseApp);

const register = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body as any;
  try {
    const userCredentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }
    const token = jwt.sign(
      { uid: userCredentials.user.uid },
      process.env.JWT_SECRET_KEY
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    addUser(userCredentials.user);

    return res.status(200).send(userCredentials);
  } catch (err) {
    return res.status(500).send(err);
  }
};

const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const userCredentials = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }
    const token = jwt.sign(
      { uid: userCredentials.user.uid },
      process.env.JWT_SECRET_KEY
    );

    console.log("id userCredencial jwt: " + userCredentials.user.uid);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Enviar la credential para que pueda ser valdiada por el validate Login
    console.log(userCredentials);
    return res.send(userCredentials);
  } catch (err) {
    return res.send(err);
  }
};

const logout = async (req: Request, res: Response): Promise<any> => {
  const accessToken = req.cookies.token;
  try {
    if (!accessToken)
      return res.status(401).json({ message: "Access not authorized" });

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.send();
  } catch (error) {
    res.send(error);
  }
};

const verifyUser = async (req: Request, res: Response): Promise<any> => {
  const accessToken = req.cookies.token;

  if (!accessToken)
    return res.status(401).json({ message: "Access not authorized" });
  // Decoded token para obtener el id
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is not defined");
  }
  const id = jwt.verify(accessToken, process.env.JWT_SECRET_KEY) as any;
  console.log("id jwt verify: " + id);
  const userFound = await getUserFirestore({ id: id.uid });
  console.log(userFound);

  res.json({ userFound });
};

// Obtenemos un usuario por id y lo devolvemos
export const getUserFirestore = async ({ id }: { id: string }) => {
  const userDb = await getDocs(userRef).then((querySnap) => {
    const userFound = querySnap.docs.find((docs) => {
      return docs.id === id;
    });
    if (userFound) {
      return userFound.data();
    }
  });

  return userDb;
};

// getUserFirestore({ id: "4QSLpLQJsUMGktdD4lh8jbZgl9I2" });

// Agregamos un usuario creado a la base de datos (REFACTORIZAR PARA CARGARLO CON EL ID QUE GENERA EL REGISTER)
const addUser = async (user: any) => {
  const { email, uid } = user as any;
  const newUser = {
    id: uid,
    email,
  };

  await setDoc(doc(db, "users", uid), newUser);

  // userCollectionRef
  //   .where("email", "==", email)
  //   .get()
  //   .then((snapshot) => {
  //     if (snapshot.empty) {
  //       console.log("No matching documents.");
  //       const docRef = userCollectionRef.doc();
  //       docRef
  //         .set({ ...newUser, id: docRef.id })
  //         .then(() => {
  //           console.log(docRef.id);

  //           res.status(201).send("User added");
  //         })
  //         .catch((error) => {
  //           res.status(500).send("Error adding user: " + error);
  //         });
  //       return;
  //     }
  //     console.log("User already exists");
  //     res.status(400).send("User already exists");
  //   });
};

const getUsers = async (req: Request, res: Response) => {};

// userRouter.post("/addUser", addUser);
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.get("/verifyUser", verifyUser);
