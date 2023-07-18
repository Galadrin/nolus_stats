import { kv } from "@vercel/kv";
import { leases_t } from "../utils/getLeases";

export default defineEventHandler(async(event) => {
    var leases:leases_t|null = await kv.get<leases_t>('leases')
    if(!leases) {
      leases = await getLeases();
      console.log(leases)
      await kv.set<leases_t>('leases', leases, {ex: 60*5}) // expire in 5min
    }
    return leases
  })

