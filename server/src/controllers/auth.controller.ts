import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import type { User as PrismaUser, UserPreferences as PrismaUserPreferences } from '@prisma/client';
import { prisma } from '../config/db';
import { parseStoredPreferences } from '../utils/preferences';

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

interface SafeUser {
  id: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SafePreferences {
  id: string;
  userId: string;
  cryptoAssets: string[];
  investorType: string;
  contentTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface AuthResponse {
  token: string;
  user: SafeUser;
}

interface MeResponse {
  user: SafeUser;
  preferences: SafePreferences | null;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
}

function getJwtExpiresIn(): SignOptions['expiresIn'] {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
  return expiresIn as SignOptions['expiresIn'];
}

function generateToken(user: PrismaUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
  };
  const options: SignOptions = {
    expiresIn: getJwtExpiresIn(),
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

function toSafeUser(user: PrismaUser): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toSafePreferences(preferences: PrismaUserPreferences): SafePreferences {
  const parsed = parseStoredPreferences(
    preferences.cryptoAssets,
    preferences.investorType,
    preferences.contentTypes
  );

  return {
    id: preferences.id,
    userId: preferences.userId,
    cryptoAssets: parsed.cryptoAssets,
    investorType: parsed.investorType,
    contentTypes: parsed.contentTypes,
    createdAt: preferences.createdAt,
    updatedAt: preferences.updatedAt,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function register(
  req: Request<unknown, unknown, RegisterBody>,
  res: Response
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Name is required' });
      return;
    }

    if (!email?.trim()) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    if (!password) {
      res.status(400).json({ success: false, message: 'Password is required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    const token = generateToken(user);
    const response: AuthResponse = {
      token,
      user: toSafeUser(user),
    };

    res.status(201).json({ success: true, ...response });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
      return;
    }

    console.error('[Auth] Register error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
}

export async function login(
  req: Request<unknown, unknown, LoginBody>,
  res: Response
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    if (!password) {
      res.status(400).json({ success: false, message: 'Password is required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    const response: AuthResponse = {
      token,
      user: toSafeUser(user),
    };

    res.status(200).json({ success: true, ...response });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ success: false, message: 'Failed to log in' });
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let preferences: SafePreferences | null = null;

    if (user.onboardingCompleted) {
      const storedPreferences = await prisma.userPreferences.findUnique({
        where: { userId: user.id },
      });

      if (storedPreferences) {
        preferences = toSafePreferences(storedPreferences);
      }
    }

    const response: MeResponse = {
      user: toSafeUser(user),
      preferences,
    };

    res.status(200).json({ success: true, ...response });
  } catch (error) {
    console.error('[Auth] Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current user',
    });
  }
}
