import { NextResponse } from 'next/server';
export function ok(data:any,status=200){return NextResponse.json(data,{status})}
export function err(message:string,status=400){return NextResponse.json({error:message},{status})}
