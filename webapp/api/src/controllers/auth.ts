import express from "express";
import bcrypt from "bcryptjs";
import { getInvestorByEmail } from "../db/Investor";
import { getIssuerByEmail } from "../db/Issuer";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { profile, email, password } = req.body;
    var user
    if (profile === "investor") {
      user = await getInvestorByEmail(email);
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
    } else {
      user = await getIssuerByEmail(email);
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
    }


    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('incorrect pass')
      res.status(401).json({ message: "Contraseña incorrecta" });
      return;
    }

    console.log('pass')
    res.json({ message: "Login exitoso", user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};
