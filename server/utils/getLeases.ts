import { CosmWasmClient } from "cosmwasm";
import { types } from "util";

const rpcEndpoint = "https://pirin-cl.nolus.network:26657/"
const contract_address = 'nolus1wn625s4jcmvk0szpl85rj5azkfc6suyvf75q6vrddscjdphtve8s5gg42f'

export async function getLeases():Promise<leases_t> {
    console.log("Get all the leases")
    const client = await CosmWasmClient.connect(rpcEndpoint);
    const wasm_extention = client.getQueryClient().wasm

    const leasers = await wasm_extention.getAllContractState(contract_address, undefined);
    const all_lease_addr = [];
    const all_leases = [] as lease[];
    const totals_leases = {};
    //.slice(0, 5) to limit
    await Promise.all(leasers.models.map(async (leaser) => {
        const lease_id = Buffer.from(leaser.key).toString();
        if (lease_id.includes("loansnolus")) {
        const user_leases = JSON.parse(Buffer.from(leaser.value, 'base64').toString());
           
        await Promise.all(user_leases.map(async (user_lease) => {
            const c = await wasm_extention.getContractInfo(user_lease);
            const { created: { blockHeight: {low: created_at } } } = c.contractInfo;
            all_lease_addr.push(user_lease)
            const lease_info = await client.queryContractSmart(user_lease, {});
              
            if (lease_info.opened !== undefined) {
                const { loan_interest_rate: interest_rate, current_margin_due, current_interest_due } = lease_info.opened;
                const amount:amount_t = {
                    amount: Number(lease_info.opened.amount.amount)/getExposant(lease_info.opened.amount.ticker),
                    ticker: lease_info.opened.amount.ticker
                };
                const principal_due:amount_t = {
                    amount: Number(lease_info.opened.principal_due.amount)/getExposant(lease_info.opened.principal_due.ticker),
                    ticker: lease_info.opened.principal_due.ticker
                };
                const interest_due:amount_t = {
                    amount: Number(current_interest_due.amount)/getExposant(current_margin_due.ticker.ticker),
                    ticker: current_margin_due.ticker
                };
                const adj_interest_rate = interest_rate/10
                const price = await client.queryContractSmart('nolus1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgsv3wzl4', {price:{currency:amount.ticker}})
                // console.log("add lease from ", user_lease, "open at", created_at)
                all_leases.push({
                    created_at,
                    amount,
                    interest_rate: adj_interest_rate,
                    principal_due,
                    interest_due
                });
                if (!totals_leases[amount.ticker]) { totals_leases[amount.ticker] = {amount: 0, principal_due:0, interest_due:0} }
                    totals_leases[amount.ticker].amount += Number(amount.amount)
                    totals_leases[amount.ticker].amount_usd += Number(amount.amount) * price
                    totals_leases[amount.ticker].principal_due += Number(principal_due.amount)
                    totals_leases[amount.ticker].interest_due += Number(interest_due.amount)
                }

            }));
        }
    }));
    return {
        leases: all_leases,
        total: totals_leases
    }
}

function getExposant(label:string) {
    if(label === 'WETH') {return 10**18}
    else if (label === 'WBTC') {return 10**8}
    else {return 10**6}
  }


export type leases_t = {
    leases: lease[],
    total: {
        [key: string]: {
            amount: number,
            amount_usd: number,
            principal_due: number,
            interest_due: number
        }
    }
}

type lease = {
    created_at: number,
    amount: amount_t,
    interest_rate: number,
    principal_due: amount_t,
    interest_due: amount_t  
}

type amount_t = {
    amount: number
    ticker: string
}