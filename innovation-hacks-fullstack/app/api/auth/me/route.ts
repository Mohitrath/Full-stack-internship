import {getCurrentUser} from '@/lib/auth';import {ok,err} from '@/lib/api';export async function GET(){const u=await getCurrentUser();return u?ok({user:u}):err('Unauthorized',401)}
