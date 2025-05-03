import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "../db";
import { users, User, userRoles } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "../db/index";

declare global {
  namespace Express {
    interface User extends User {
      role?: {
        id: number;
        name: string;
      };
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Funções para gerenciar usuários no banco de dados
export async function getUserByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      role: true
    }
  });
  return user;
}

export async function getUser(id: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      role: true
    }
  });
  return user;
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  roleId: number;
}) {
  const hashedPassword = await hashPassword(userData.password);
  const [user] = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
  }).returning();
  
  return getUserByEmail(userData.email);
}

export async function getAllUsers() {
  return db.query.users.findMany({
    with: {
      role: true
    }
  });
}

export async function getAllRoles() {
  return db.query.userRoles.findMany();
}

export function setupAuth(app: Express) {
  // Configurar o PostgreSQL para armazenar sessões
  const PostgresStore = connectPg(session);
  
  // Configurações da sessão
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
    },
    store: new PostgresStore({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true
    }),
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configurar estratégia local de autenticação
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await getUserByEmail(email);

          // Verificar se o usuário existe e se está ativo
          if (!user || !user.isActive) {
            return done(null, false, { message: "Usuário não encontrado ou inativo" });
          }

          // Verificar se a senha está correta
          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Senha incorreta" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialização do usuário para a sessão
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialização do usuário da sessão
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Rotas de autenticação
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: Express.User, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      });
    })(req, res, next);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Verificar se o email já está em uso
      const existingUser = await getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "Este email já está em uso" });
      }

      // Criar novo usuário
      const user = await createUser(req.body);

      // Autenticar o usuário recém-criado
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(201).json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.status(200).json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user;
      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }
    return res.status(401).json({ message: "Não autenticado" });
  });

  // Rota para obter todos os usuários (apenas para administradores)
  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allUsers = await getAllUsers();
      res.status(200).json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  // Rota para obter todos os papéis (roles)
  app.get("/api/roles", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const roles = await getAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar papéis" });
    }
  });
}

// Middleware para verificar se o usuário está autenticado
export function isAuthenticated(req: Request, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Não autenticado" });
}

// Middleware para verificar se o usuário é administrador
export function isAdmin(req: Request, res: any, next: any) {
  if (req.user && req.user.role && req.user.role.name === "Administrador") {
    return next();
  }
  res.status(403).json({ message: "Acesso negado: Requer permissão de administrador" });
}

// Middleware para verificar se o usuário é cadastrador ou administrador
export function isCadastrador(req: Request, res: any, next: any) {
  if (
    req.user && 
    req.user.role && 
    (req.user.role.name === "Administrador" || req.user.role.name === "Cadastrador")
  ) {
    return next();
  }
  res.status(403).json({ message: "Acesso negado: Requer permissão de cadastrador ou administrador" });
}