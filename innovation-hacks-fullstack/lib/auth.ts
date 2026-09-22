import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from './prisma';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
export async function signToken(userId:string){return new SignJWT({userId}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret)}
export async function getCurrentUser(){const c=await cookies(); const token=c.get('session')?.value; if(!token)return null; try{const {payload}=await jwtVerify(token,secret); const id=String(payload.userId); return prisma.user.findUnique({where:{id},select:{id:true,name:true,email:true}})}catch{return null}}
export async function requireUser(){const u=await getCurrentUser(); if(!u) throw new Error('UNAUTHORIZED'); return u;}
