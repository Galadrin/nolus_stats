
export default defineEventHandler(async(event) => {
        const leases = await getLeases();
        console.log(leases)
    return leases
  })